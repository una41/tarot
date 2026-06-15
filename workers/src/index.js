// ============================================================
// Tarot Billing Worker — Cloudflare Workers
// 담당: 포트원 V2 정기결제 빌링키 결제, Firestore 업데이트
// ============================================================

const PORTONE_API_BASE = 'https://api.portone.io'
const SUBSCRIPTION_AMOUNT = 3900
const ORDER_NAME = '수비학타로 월구독'
const ALLOWED_ORIGINS = [
  'https://numerologytarot.uk',
  'https://www.numerologytarot.uk',
  'http://localhost:3000',
]

// ── 진입점 ──────────────────────────────────────────────────
export default {
  async fetch(request, env, ctx) {
    const corsHeaders = getCORSHeaders(request)

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders })
    }

    const url = new URL(request.url)
    const { pathname } = url

    try {
      if (pathname === '/api/billing/issue' && request.method === 'POST') {
        return await handleIssue(request, env, corsHeaders)
      }
      if (pathname === '/api/billing/cancel' && request.method === 'POST') {
        return await handleCancel(request, env, corsHeaders)
      }
      if (pathname === '/api/billing/admin-cancel' && request.method === 'POST') {
        return await handleAdminCancel(request, env, corsHeaders)
      }
      if (pathname === '/api/billing/history' && request.method === 'POST') {
        return await handleGetHistory(request, env, corsHeaders)
      }
      if (pathname === '/api/withdrawal/request' && request.method === 'POST') {
        return await handleWithdrawalRequest(request, env, corsHeaders)
      }
      return json({ error: 'Not found' }, 404, corsHeaders)
    } catch (err) {
      console.error('Worker error:', err)
      return json({ error: '서버 오류가 발생했습니다.' }, 500, corsHeaders)
    }
  },

  // 매월 1일 자동 결제 Cron
  async scheduled(event, env, ctx) {
    await handleMonthlyBilling(env)
  },
}

// ── 빌링키 결제 + Firestore 업데이트 ─────────────────────────
async function handleIssue(request, env, corsHeaders) {
  const { billingKey, uid, customerEmail, customerName } = await request.json()

  if (!billingKey || !uid) {
    return json({ error: '필수 파라미터가 누락되었습니다.' }, 400, corsHeaders)
  }

  // 1. 이미 활성 구독인지 확인
  const existing = await env.BILLING_STORE.get(`sub:${uid}`)
  if (existing) {
    const sub = JSON.parse(existing)
    if (sub.status === 'active') {
      const expiry = new Date(sub.nextBillingDate)
      if (expiry > new Date()) {
        return json({ error: '이미 활성 구독이 있습니다.' }, 409, corsHeaders)
      }
    }
  }

  // 2. 포트원 V2 빌링키로 첫 결제 실행
  const paymentId = makePaymentId(uid)
  const chargeRes = await fetch(`${PORTONE_API_BASE}/payments/${paymentId}/billing-key`, {
    method: 'POST',
    headers: {
      'Authorization': `PortOne ${env.PORTONE_API_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      billingKey,
      orderName: ORDER_NAME,
      customer: {
        id: uid,
        email: customerEmail || '',
        name: { full: customerName || '' },
      },
      amount: { total: SUBSCRIPTION_AMOUNT },
      currency: 'KRW',
    }),
  })

  const chargeData = await chargeRes.json()
  if (!chargeRes.ok) {
    return json({ error: chargeData.message || '결제에 실패했습니다.' }, 400, corsHeaders)
  }

  const now = new Date()
  const expiry = addOneMonth(now)

  // 3. KV에 구독 정보 저장
  const subscription = {
    billingKey,
    uid,
    email: customerEmail,
    name: customerName,
    amount: SUBSCRIPTION_AMOUNT,
    status: 'active',
    startDate: now.toISOString(),
    nextBillingDate: expiry.toISOString(),
    lastPaymentDate: now.toISOString(),
    lastPaymentId: paymentId,
  }
  await env.BILLING_STORE.put(`sub:${uid}`, JSON.stringify(subscription))

  // 4. Firestore 업데이트 — 실패 시 결제 취소 + KV 삭제 롤백
  try {
    await updateFirestore(uid, {
      isSubscribed: { booleanValue: true },
      isTrial: { booleanValue: false },
      subscriptionStart: { stringValue: now.toISOString() },
      subscriptionExpiry: { stringValue: expiry.toISOString() },
      subscriptionCancelled: { booleanValue: false },
    }, env)
    await pushHistory(env, uid, { type: 'subscribed', amount: SUBSCRIPTION_AMOUNT, paymentId, expiry: expiry.toISOString() })
  } catch (err) {
    // 결제 취소
    await fetch(`${PORTONE_API_BASE}/payments/${paymentId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `PortOne ${env.PORTONE_API_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason: 'Firestore 업데이트 실패로 인한 자동 취소' }),
    }).catch(() => {})
    // KV 삭제
    await env.BILLING_STORE.delete(`sub:${uid}`).catch(() => {})
    return json({ error: 'DB 저장 실패로 결제가 취소되었습니다. 다시 시도해주세요.' }, 500, corsHeaders)
  }

  return json({ success: true, expiry: expiry.toISOString() }, 200, corsHeaders)
}

// ── 구독 취소 ────────────────────────────────────────────────
async function handleCancel(request, env, corsHeaders) {
  const { uid } = await request.json()

  if (!uid) {
    return json({ error: '필수 파라미터가 누락되었습니다.' }, 400, corsHeaders)
  }

  const subStr = await env.BILLING_STORE.get(`sub:${uid}`)
  if (!subStr) {
    return json({ error: '구독 정보를 찾을 수 없습니다.' }, 404, corsHeaders)
  }

  const sub = JSON.parse(subStr)
  sub.status = 'cancelled'
  sub.cancelledAt = new Date().toISOString()
  await env.BILLING_STORE.put(`sub:${uid}`, JSON.stringify(sub))

  await updateFirestore(uid, {
    subscriptionCancelled: { booleanValue: true },
  }, env)
  await pushHistory(env, uid, { type: 'cancelled' })

  return json({ success: true }, 200, corsHeaders)
}

// ── 관리자 즉시 해지 (환불 + 구독 취소) ───────────────────────
async function handleAdminCancel(request, env, corsHeaders) {
  const { uid } = await request.json()

  if (!uid) {
    return json({ error: '필수 파라미터가 누락되었습니다.' }, 400, corsHeaders)
  }

  const subStr = await env.BILLING_STORE.get(`sub:${uid}`)
  if (!subStr) {
    return json({ error: '구독 정보를 찾을 수 없습니다.' }, 404, corsHeaders)
  }

  const sub = JSON.parse(subStr)

  // 1. 마지막 결제 환불
  if (sub.lastPaymentId) {
    const refundRes = await fetch(`${PORTONE_API_BASE}/payments/${sub.lastPaymentId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `PortOne ${env.PORTONE_API_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason: '관리자 즉시 해지' }),
    })
    if (!refundRes.ok) {
      const err = await refundRes.json()
      return json({ error: err.message || '환불 처리에 실패했습니다.' }, 400, corsHeaders)
    }
  }

  // 2. KV 구독 취소 처리
  sub.status = 'cancelled'
  sub.cancelledAt = new Date().toISOString()
  sub.adminCancelled = true
  await env.BILLING_STORE.put(`sub:${uid}`, JSON.stringify(sub))

  // 3. Firestore 업데이트
  await updateFirestore(uid, {
    isSubscribed: { booleanValue: false },
    subscriptionCancelled: { booleanValue: true },
  }, env)
  await pushHistory(env, uid, { type: 'admin_cancelled', amount: sub.amount })

  return json({ success: true }, 200, corsHeaders)
}

// ── 월간 자동 결제 (Cron) ────────────────────────────────────
async function handleMonthlyBilling(env) {
  const list = await env.BILLING_STORE.list({ prefix: 'sub:' })
  const now = new Date()

  for (const key of list.keys) {
    const subStr = await env.BILLING_STORE.get(key.name)
    if (!subStr) continue

    const sub = JSON.parse(subStr)
    if (sub.status !== 'active') continue

    const nextBilling = new Date(sub.nextBillingDate)
    if (nextBilling > now) continue

    const paymentId = makePaymentId(sub.uid)
    const chargeRes = await fetch(`${PORTONE_API_BASE}/payments/${paymentId}/billing-key`, {
      method: 'POST',
      headers: {
        'Authorization': `PortOne ${env.PORTONE_API_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        billingKey: sub.billingKey,
        orderName: ORDER_NAME,
        customer: {
          id: sub.uid,
          email: sub.email || '',
          name: { full: sub.name || '' },
        },
        amount: { total: sub.amount },
        currency: 'KRW',
      }),
    })

    if (chargeRes.ok) {
      const newExpiry = addOneMonth(nextBilling)
      sub.nextBillingDate = newExpiry.toISOString()
      sub.lastPaymentDate = now.toISOString()
      sub.lastPaymentId = paymentId
      await env.BILLING_STORE.put(key.name, JSON.stringify(sub))

      await updateFirestore(sub.uid, {
        subscriptionExpiry: { stringValue: newExpiry.toISOString() },
      }, env)
      await pushHistory(env, sub.uid, { type: 'renewed', amount: sub.amount, paymentId, expiry: newExpiry.toISOString() })
    } else {
      sub.status = 'failed'
      sub.failedAt = now.toISOString()
      await env.BILLING_STORE.put(key.name, JSON.stringify(sub))

      await updateFirestore(sub.uid, {
        isSubscribed: { booleanValue: false },
        subscriptionCancelled: { booleanValue: true },
      }, env)
      await pushHistory(env, sub.uid, { type: 'renewal_failed', amount: sub.amount })
    }
  }
}

// ── 구독 히스토리 조회 ───────────────────────────────────────
async function handleGetHistory(request, env, corsHeaders) {
  const { uid } = await request.json()

  if (!uid) {
    return json({ error: '필수 파라미터가 누락되었습니다.' }, 400, corsHeaders)
  }

  const histStr = await env.BILLING_STORE.get(`hist:${uid}`)
  const history = histStr ? JSON.parse(histStr) : []

  return json({ history }, 200, corsHeaders)
}

// ── 회원 탈퇴 요청 처리 ─────────────────────────────────────
async function handleWithdrawalRequest(request, env, corsHeaders) {
  const { uid, name, email } = await request.json()

  if (!uid) {
    return json({ error: '필수 파라미터가 누락되었습니다.' }, 400, corsHeaders)
  }

  await updateFirestore(uid, {
    withdrawalRequested: { booleanValue: true },
  }, env)

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: '수비학타로 <noreply@numerologytarot.uk>',
        to: ['runanumerologytarot@gmail.com'],
        subject: '[수비학타로] 회원 탈퇴 요청',
        html: `
          <h2>회원 탈퇴 요청</h2>
          <p>아래 회원이 탈퇴를 요청했습니다.</p>
          <ul>
            <li><strong>이름:</strong> ${name || '(알 수 없음)'}</li>
            <li><strong>이메일:</strong> ${email || '(알 수 없음)'}</li>
            <li><strong>UID:</strong> ${uid}</li>
            <li><strong>요청 시각:</strong> ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</li>
          </ul>
          <p>관리자 페이지에서 탈퇴 처리를 진행해주세요.</p>
        `,
      }),
    })
    if (!resendRes.ok) {
      const resendErr = await resendRes.text()
      console.error('Resend 이메일 발송 실패:', resendRes.status, resendErr)
    }
  } catch (err) {
    console.error('탈퇴 요청 이메일 발송 실패:', err)
  }

  return json({ success: true }, 200, corsHeaders)
}

// ── 히스토리 이벤트 추가 ─────────────────────────────────────
async function pushHistory(env, uid, event) {
  const key = `hist:${uid}`
  const existing = await env.BILLING_STORE.get(key)
  const history = existing ? JSON.parse(existing) : []
  history.unshift({ ...event, date: new Date().toISOString() })
  await env.BILLING_STORE.put(key, JSON.stringify(history))
}

// ── Firestore REST API ───────────────────────────────────────
async function updateFirestore(uid, fields, env) {
  const accessToken = await getGoogleAccessToken(env)
  const fieldMasks = Object.keys(fields).map(f => `updateMask.fieldPaths=${f}`).join('&')
  const projectId = env.FIREBASE_PROJECT_ID

  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}?${fieldMasks}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Firestore 업데이트 실패: ${err}`)
  }
}

// Firebase 서비스 계정으로 Google OAuth 액세스 토큰 생성
async function getGoogleAccessToken(env) {
  const clientEmail = env.FIREBASE_CLIENT_EMAIL
  const privateKey = env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')

  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const payload = {
    iss: clientEmail,
    sub: clientEmail,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/datastore',
  }

  const b64url = (obj) =>
    btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

  const headerB64 = b64url(header)
  const payloadB64 = b64url(payload)
  const signingInput = `${headerB64}.${payloadB64}`

  const pemContent = privateKey.replace(/-----[^-]+-----/g, '').replace(/\s/g, '')
  const derBuffer = Uint8Array.from(atob(pemContent), (c) => c.charCodeAt(0))

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    derBuffer.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signingInput)
  )

  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  const jwt = `${signingInput}.${sigB64}`

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  })

  const tokenData = await tokenRes.json()
  if (!tokenData.access_token) {
    throw new Error('Google 액세스 토큰 발급 실패: ' + JSON.stringify(tokenData))
  }
  return tokenData.access_token
}

// ── 유틸 ────────────────────────────────────────────────────
function makePaymentId(uid) {
  return `SUB-${uid.slice(0, 8)}-${Date.now()}`.slice(0, 40)
}

function addOneMonth(date) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + 1)
  return d
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

function getCORSHeaders(request) {
  const origin = request.headers.get('Origin') || ''
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

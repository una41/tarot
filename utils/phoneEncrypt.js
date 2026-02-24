// 개인정보 AES-GCM 암호화/복호화 유틸리티
// SPA 클라이언트 환경에서 실행되며, Firestore 저장 데이터를 암호화함
// 암호화 키는 환경변수(NUXT_PUBLIC_CRYPTO_KEY)에서 가져와야 함

const ALGO = 'AES-GCM'
const KEY_BYTES = 32

// base64 변환 헬퍼
const toBase64 = (buffer) => btoa(String.fromCharCode(...new Uint8Array(buffer)))
const fromBase64 = (b64) => Uint8Array.from(atob(b64), c => c.charCodeAt(0))

// 키 임포트 캐시 (매번 importKey 호출 방지)
const keyCache = new Map()

const importKey = async (rawKey) => {
  if (keyCache.has(rawKey)) return keyCache.get(rawKey)
  const keyBytes = new TextEncoder().encode(rawKey.padEnd(KEY_BYTES, '0').slice(0, KEY_BYTES))
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: ALGO }, false, ['encrypt', 'decrypt'])
  keyCache.set(rawKey, key)
  return key
}

// 유니코드(한국어 등) 안전 base64 인코딩
const toBase64Unicode = (str) => btoa(unescape(encodeURIComponent(str)))

// 전화번호 암호화 → `aes:{iv}:{cipher}` 형식의 문자열 반환
export const encryptPhone = async (phone, cryptoKey) => {
  if (!phone) return ''
  // 암호화 키 없거나 Web Crypto API 미지원 환경 → 유니코드 안전 Base64 폴백
  if (!cryptoKey || !crypto?.subtle) return toBase64Unicode(phone)
  try {
    const key = await importKey(cryptoKey)
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encoded = new TextEncoder().encode(phone)
    const cipherBuffer = await crypto.subtle.encrypt({ name: ALGO, iv }, key, encoded)
    return `aes:${toBase64(iv)}:${toBase64(cipherBuffer)}`
  } catch {
    return toBase64Unicode(phone)
  }
}

// 전화번호 복호화
// - 신규 `aes:...` 형식: AES-GCM 복호화
// - 구형 Base64 형식: atob 폴백 (기존 데이터 호환)
export const decryptPhone = async (encrypted, cryptoKey) => {
  if (!encrypted) return ''
  try {
    if (typeof encrypted === 'string' && encrypted.startsWith('aes:')) {
      if (!cryptoKey || !crypto?.subtle) return ''
      const parts = encrypted.split(':')
      const key = await importKey(cryptoKey)
      const iv = fromBase64(parts[1])
      const cipher = fromBase64(parts[2])
      const plainBuffer = await crypto.subtle.decrypt({ name: ALGO, iv }, key, cipher)
      return new TextDecoder().decode(plainBuffer)
    }
    // 구형 Base64 데이터 호환 처리 (유니코드 안전)
    try {
      return decodeURIComponent(escape(atob(String(encrypted))))
    } catch {
      return atob(String(encrypted))
    }
  } catch {
    return String(encrypted)
  }
}

// 범용 개인정보 암호화 (이름 등 평문으로 저장되던 필드)
export const encryptData = encryptPhone

// 범용 개인정보 복호화
// - 신규 `aes:...` 형식: AES-GCM 복호화
// - base64 인코딩된 값: atob 폴백 복호화 (폴백 저장된 데이터 호환)
// - 구형 평문: 그대로 반환 (기존 데이터 호환)
export const decryptData = async (encrypted, cryptoKey) => {
  if (!encrypted) return ''
  try {
    if (typeof encrypted === 'string' && encrypted.startsWith('aes:')) {
      if (!cryptoKey || !crypto?.subtle) return ''
      const parts = encrypted.split(':')
      const key = await importKey(cryptoKey)
      const iv = fromBase64(parts[1])
      const cipher = fromBase64(parts[2])
      const plainBuffer = await crypto.subtle.decrypt({ name: ALGO, iv }, key, cipher)
      return new TextDecoder().decode(plainBuffer)
    }
    // base64 문자로만 구성된 경우 → base64 복호화 시도 (폴백 저장 데이터)
    const str = String(encrypted)
    const isBase64Like = /^[A-Za-z0-9+/]+=*$/.test(str) && str.length % 4 === 0
    if (isBase64Like) {
      try {
        return decodeURIComponent(escape(atob(str)))
      } catch {
        // base64 디코딩 실패 → 평문으로 반환
      }
    }
    // 구형 평문 데이터 그대로 반환
    return str
  } catch {
    return String(encrypted)
  }
}

<template>
  <div class="shop_login_wrap">
    <div class="shop_login_inner">

      <div class="shop_login_logo">
        <img src="/img/icon_ball.png" alt="" class="logo_ico" />
        <span class="logo_txt">numerologyTarot</span>
        <span class="logo_badge">Shop</span>
      </div>

      <div class="shop_login_card">

        <!-- 이메일 인증 안내 -->
        <Transition name="s_fade" mode="out-in">
          <div v-if="shopStore.pendingVerificationEmail" class="shop_verify" key="verify">
            <p class="verify_icon">✉️</p>
            <p class="verify_tit">인증 메일을 발송했습니다</p>
            <p class="verify_desc">{{ shopStore.pendingVerificationEmail }}로 전송된<br />인증 링크를 클릭해주세요.</p>
            <p class="verify_sub">메일이 보이지 않으면 스팸함을 확인해주세요.</p>
            <button type="button" class="shop_btn" @click="goToLogin">로그인하러 가기</button>
          </div>

          <!-- 비밀번호 찾기 -->
          <div v-else-if="isForgotPassword" key="forgot">
            <h2 class="form_tit">비밀번호 재설정</h2>
            <div class="shop_form">
              <input
                class="shop_ipt"
                v-model="email"
                type="email"
                placeholder="이메일"
                @keyup.enter="handleResetPassword"
              />
              <button
                type="button"
                class="shop_btn"
                :disabled="shopStore.authLoading"
                @click="handleResetPassword"
              >
                {{ shopStore.authLoading ? '처리 중...' : '재설정 메일 발송' }}
              </button>
            </div>
            <button type="button" class="shop_link" @click="goToLogin">로그인으로 돌아가기</button>
          </div>

          <!-- 로그인 / 회원가입 -->
          <div v-else :key="isSignUp ? 'signup' : 'login'">
            <h2 class="form_tit">{{ isSignUp ? '샵 회원가입' : '샵 로그인' }}</h2>
            <div class="shop_form">
              <input
                class="shop_ipt"
                v-model="email"
                type="email"
                placeholder="이메일"
                @keyup.enter="handleSubmit"
              />
              <div class="shop_ipt_pw">
                <input
                  class="shop_ipt"
                  v-model="pw"
                  :type="showPw ? 'text' : 'password'"
                  placeholder="비밀번호"
                  @keyup.enter="handleSubmit"
                />
                <button type="button" class="btn_eye" :class="{ on: showPw }" @click="showPw = !showPw" tabindex="-1"></button>
              </div>
              <template v-if="isSignUp">
                <div class="shop_ipt_pw">
                  <input
                    class="shop_ipt"
                    v-model="pwConfirm"
                    :type="showPwConfirm ? 'text' : 'password'"
                    placeholder="비밀번호 확인"
                    @keyup.enter="handleSubmit"
                  />
                  <button type="button" class="btn_eye" :class="{ on: showPwConfirm }" @click="showPwConfirm = !showPwConfirm" tabindex="-1"></button>
                </div>
                <input class="shop_ipt" v-model="userName" type="text" placeholder="이름" @keyup.enter="handleSubmit" />
                <input class="shop_ipt" v-model="userPhone" type="tel" placeholder="연락처 (010-0000-0000)" @keyup.enter="handleSubmit" />
              </template>
              <button
                type="button"
                class="shop_btn"
                :disabled="shopStore.authLoading"
                @click="handleSubmit"
              >
                {{ shopStore.authLoading ? '처리 중...' : (isSignUp ? '가입하기' : '로그인') }}
              </button>
            </div>

            <div class="shop_form_footer">
              <template v-if="isSignUp">
                <span>이미 계정이 있으신가요?</span>
                <button type="button" class="shop_link" @click="toggleMode">로그인</button>
              </template>
              <template v-else>
                <span>계정이 없으신가요?</span>
                <button type="button" class="shop_link" @click="toggleMode">회원가입</button>
                <span class="divider">|</span>
                <button type="button" class="shop_link" @click="isForgotPassword = true">비밀번호 찾기</button>
              </template>
            </div>
          </div>
        </Transition>

      </div>
    </div>

    <!-- 알림 -->
    <Transition name="s_fade">
      <div v-if="shopStore.alertData.isVisible" class="shop_alert_dim" @click="shopStore.closeAlert()">
        <div class="shop_alert" @click.stop>
          <p class="alert_icon">{{ shopStore.alertData.icon }}</p>
          <p v-if="shopStore.alertData.title" class="alert_tit">{{ shopStore.alertData.title }}</p>
          <p class="alert_msg">{{ shopStore.alertData.message }}</p>
          <button type="button" class="shop_btn" @click="shopStore.closeAlert()">확인</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from '#imports'
import { useShopStore } from '~/stores/useShopStore'

definePageMeta({ layout: 'shop' })

const shopStore = useShopStore()

onMounted(() => {
  shopStore.checkAuth()
})

const email = ref<string>('')
const pw = ref<string>('')
const pwConfirm = ref<string>('')
const userName = ref<string>('')
const userPhone = ref<string>('')
const isSignUp = ref<boolean>(false)
const isForgotPassword = ref<boolean>(false)
const showPw = ref<boolean>(false)
const showPwConfirm = ref<boolean>(false)

const toggleMode = () => {
  isSignUp.value = !isSignUp.value
  pw.value = ''
  pwConfirm.value = ''
  userName.value = ''
  userPhone.value = ''
}

const goToLogin = () => {
  shopStore.clearPendingVerification()
  isSignUp.value = false
  isForgotPassword.value = false
  pw.value = ''
  pwConfirm.value = ''
}

const handleResetPassword = async () => {
  if (!email.value) {
    shopStore.showAlert({ message: '이메일을 입력해주세요.', icon: '✉️' })
    return
  }
  const result = await shopStore.fnResetPassword(email.value)
  if (result.success) {
    shopStore.showAlert({ title: '발송 완료', message: '비밀번호 재설정 링크를 이메일로 발송했습니다.', icon: '✉️' })
    goToLogin()
  } else {
    shopStore.showAlert({ title: '발송 실패', message: result.error || '', icon: '⚠️' })
  }
}

const handleSubmit = async () => {
  if (!email.value || !pw.value) {
    shopStore.showAlert({ message: '이메일과 비밀번호를 입력해주세요.', icon: '⚠️' })
    return
  }

  if (isSignUp.value) {
    if (!userName.value || !userPhone.value) {
      shopStore.showAlert({ message: '모든 항목을 입력해주세요.', icon: '⚠️' })
      return
    }
    const phoneRegex = /^01[0-9]-[0-9]{4}-[0-9]{4}$/
    if (!phoneRegex.test(userPhone.value)) {
      shopStore.showAlert({ message: '연락처 형식을 확인해주세요.\n(010-0000-0000)', icon: '⚠️' })
      return
    }
    if (pw.value !== pwConfirm.value) {
      shopStore.showAlert({ message: '비밀번호가 일치하지 않습니다.', icon: '⚠️' })
      return
    }
    const result = await shopStore.fnSignUp(email.value, pw.value, userName.value, userPhone.value)
    if (!result.success) {
      shopStore.showAlert({ title: '회원가입 실패', message: result.error || '', icon: '⚠️' })
    }
  } else {
    const result = await shopStore.fnLogin(email.value, pw.value)
    if (result.success) {
      navigateTo('/shop')
    } else {
      shopStore.showAlert({
        title: result.needVerification ? '이메일 인증 필요' : '로그인 실패',
        message: result.error || '',
        icon: result.needVerification ? '✉️' : '⚠️',
      })
      pw.value = ''
    }
  }
}
</script>

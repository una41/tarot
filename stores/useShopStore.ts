import { defineStore } from 'pinia'
import Cookies from 'js-cookie'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { encryptPhone, decryptPhone, encryptData, decryptData } from '~/utils/phoneEncrypt'

interface IShopUser {
  uid: string
  email: string
  name: string
  phone: string
}

interface IAlertData {
  isVisible: boolean
  title: string
  message: string
  icon: string
}

export const useShopStore = defineStore('shop', {
  state: () => ({
    user: null as IShopUser | null,
    isLoggedIn: false,
    token: null as string | null,
    authLoading: false,
    authChecked: false,
    pendingVerificationEmail: null as string | null,
    alertData: {
      isVisible: false,
      title: '',
      message: '',
      icon: '🛍️',
    } as IAlertData,
  }),

  actions: {
    // 회원가입: shop_users 컬렉션에만 저장 (users 컬렉션 사용 안 함)
    async fnSignUp(email: string, password: string, userName: string, userPhone: string) {
      const { $auth, $db } = useNuxtApp()
      const config = useRuntimeConfig()
      const cryptoKey = config.public.cryptoKey
      this.authLoading = true
      this.pendingVerificationEmail = email

      try {
        const userCredential = await createUserWithEmailAndPassword($auth as Parameters<typeof signInWithEmailAndPassword>[0], email, password)
        const user = userCredential.user

        await sendEmailVerification(user)

        await setDoc(doc($db as Parameters<typeof doc>[0], 'shop_users', user.uid), {
          email,
          name: await encryptData(userName, cryptoKey),
          phone: await encryptPhone(userPhone, cryptoKey),
          createdAt: new Date(),
        })

        await signOut($auth as Parameters<typeof signOut>[0])
        return { success: true }
      } catch (error: unknown) {
        this.pendingVerificationEmail = null
        return { success: false, error: this.getErrorMessage((error as { code?: string }).code || '') }
      } finally {
        this.authLoading = false
      }
    },

    // 로그인: shop_users 컬렉션만 확인 → 없으면 접근 거부
    async fnLogin(email: string, password: string) {
      const { $auth, $db } = useNuxtApp()
      const config = useRuntimeConfig()
      const cryptoKey = config.public.cryptoKey
      this.authLoading = true

      try {
        const userCredential = await signInWithEmailAndPassword($auth as Parameters<typeof signInWithEmailAndPassword>[0], email, password)
        const user = userCredential.user

        if (!user.emailVerified) {
          await signOut($auth as Parameters<typeof signOut>[0])
          return { success: false, needVerification: true, error: '이메일 인증이 필요합니다. 메일함을 확인해주세요.' }
        }

        const shopDoc = await getDoc(doc($db as Parameters<typeof doc>[0], 'shop_users', user.uid))
        if (!shopDoc.exists()) {
          await signOut($auth as Parameters<typeof signOut>[0])
          return { success: false, error: '샵 계정을 찾을 수 없습니다.\n샵 회원가입을 먼저 진행해주세요.' }
        }

        const userData = shopDoc.data()
        this.user = {
          uid: user.uid,
          email: user.email || '',
          name: await decryptData(userData.name, cryptoKey),
          phone: await decryptPhone(userData.phone, cryptoKey),
        }
        this.token = await user.getIdToken()
        this.isLoggedIn = true

        const cookieOptions = { expires: 1, path: '/' }
        Cookies.set('shop_token', this.token, cookieOptions)
        Cookies.set('shop_user_info', JSON.stringify(this.user), cookieOptions)

        return { success: true }
      } catch (error: unknown) {
        return { success: false, error: this.getErrorMessage((error as { code?: string }).code || '') }
      } finally {
        this.authLoading = false
      }
    },

    // 로그아웃
    async fnLogout() {
      const { $auth } = useNuxtApp()
      try {
        await signOut($auth as Parameters<typeof signOut>[0])
      } catch {}
      this.user = null
      this.token = null
      this.isLoggedIn = false
      Cookies.remove('shop_token')
      Cookies.remove('shop_user_info')
    },

    // 인증 상태 체크 (앱 시작 시 호출)
    checkAuth() {
      if (!process.client) return

      const { $auth, $db } = useNuxtApp()
      const config = useRuntimeConfig()
      const cryptoKey = config.public.cryptoKey

      // 쿠키 즉시 복원
      const savedToken = Cookies.get('shop_token')
      const savedUserInfo = Cookies.get('shop_user_info')
      if (savedToken && savedUserInfo) {
        try {
          this.user = JSON.parse(savedUserInfo)
          this.token = savedToken
          this.isLoggedIn = true
          this.authChecked = true
        } catch {}
      }

      // Firebase 세션 백그라운드 검증
      onAuthStateChanged($auth as Parameters<typeof onAuthStateChanged>[0], async (user) => {
        if (this.pendingVerificationEmail) return

        if (user && user.emailVerified) {
          try {
            const shopDoc = await getDoc(doc($db as Parameters<typeof doc>[0], 'shop_users', user.uid))
            if (shopDoc.exists()) {
              const userData = shopDoc.data()
              this.user = {
                uid: user.uid,
                email: user.email || '',
                name: await decryptData(userData.name, cryptoKey),
                phone: await decryptPhone(userData.phone, cryptoKey),
              }
              this.token = await user.getIdToken()
              this.isLoggedIn = true

              const cookieOptions = { expires: 1, path: '/' }
              Cookies.set('shop_token', this.token, cookieOptions)
              Cookies.set('shop_user_info', JSON.stringify(this.user), cookieOptions)
            } else {
              // shop_users에 없는 계정 → 샵 로그인 불가
              this.user = null
              this.token = null
              this.isLoggedIn = false
              Cookies.remove('shop_token')
              Cookies.remove('shop_user_info')
            }
          } catch {}
        } else if (!user) {
          this.user = null
          this.token = null
          this.isLoggedIn = false
          Cookies.remove('shop_token')
          Cookies.remove('shop_user_info')
        }

        this.authChecked = true
      })
    },

    clearPendingVerification() {
      this.pendingVerificationEmail = null
    },

    async fnResendVerification() {
      const { $auth } = useNuxtApp()
      const user = ($auth as { currentUser: Parameters<typeof sendEmailVerification>[0] | null }).currentUser
      if (user && !(user as { emailVerified: boolean }).emailVerified) {
        try {
          await sendEmailVerification(user)
          return { success: true }
        } catch (error: unknown) {
          return { success: false, error: this.getErrorMessage((error as { code?: string }).code || '') }
        }
      }
      return { success: false, error: '재발송할 수 없습니다.' }
    },

    async fnResetPassword(email: string) {
      const { $auth } = useNuxtApp()
      this.authLoading = true
      try {
        await sendPasswordResetEmail($auth as Parameters<typeof sendPasswordResetEmail>[0], email)
        return { success: true }
      } catch (error: unknown) {
        return { success: false, error: this.getErrorMessage((error as { code?: string }).code || '') }
      } finally {
        this.authLoading = false
      }
    },

    getErrorMessage(code: string): string {
      const messages: Record<string, string> = {
        'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
        'auth/invalid-email': '유효하지 않은 이메일 형식입니다.',
        'auth/weak-password': '비밀번호는 6자 이상이어야 합니다.',
        'auth/user-not-found': '등록되지 않은 이메일입니다.',
        'auth/wrong-password': '비밀번호가 일치하지 않습니다.',
        'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다.',
        'auth/too-many-requests': '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.',
      }
      return messages[code] || '오류가 발생했습니다.'
    },

    showAlert(options: { title?: string; message?: string; icon?: string }) {
      this.alertData = {
        isVisible: true,
        title: options.title || '',
        message: options.message || '',
        icon: options.icon || '🛍️',
      }
    },

    closeAlert() {
      this.alertData.isVisible = false
    },
  },
})

import { useShopStore } from '~/stores/useShopStore'

export default defineNuxtRouteMiddleware(async (to) => {
  if (process.server) return

  // 로그인 페이지는 보호 불필요
  if (to.path === '/shop/login') return

  const shopStore = useShopStore()

  // authChecked 될 때까지 대기 (최대 3초)
  if (!shopStore.authChecked) {
    await new Promise<void>((resolve) => {
      let count = 0
      const interval = setInterval(() => {
        count++
        if (shopStore.authChecked || count > 30) {
          clearInterval(interval)
          resolve()
        }
      }, 100)
    })
  }

  if (!shopStore.isLoggedIn) {
    return navigateTo('/shop/login')
  }
})

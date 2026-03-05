export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  if (!config.public.kakaoJsKey) return

  const initKakao = () => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(config.public.kakaoJsKey)
    }
  }

  // SDK가 이미 로드된 경우 바로 초기화, 아니면 로드 완료 이벤트에서 초기화
  if (window.Kakao) {
    initKakao()
  } else {
    const script = document.querySelector('script[src*="kakao_js_sdk"]')
    if (script) {
      script.addEventListener('load', initKakao)
    }
  }
})

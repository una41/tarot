// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2026-01-06',
	modules: [
    '@pinia/nuxt',
	// '@nuxtjs/tailwindcss', // 예시 모듈
	// '@pinia/nuxt',
	],
  // 2. 개발 및 런타임 설정 (Devtools & Runtime Configuration)
	devtools: { enabled: true },

  // 3. 빌드 설정 (Vite Configuration)
  // Vite 빌더에 대한 설정을 지정할 수 있습니다.
	// vite: {
	// 예: CSS 전처리기 설정
	// css: {
	//   preprocessorOptions: {
	//     scss: {
	//       additionalData: `@use "@/assets/_variables.scss" as *;`
	//     }
	//   }
	// }
	// },

  // 4. 전역 CSS 및 정적 파일 경로 설정 (CSS & Assets)
  // 모든 페이지에 적용할 CSS 파일이나 전역 스타일링을 지정합니다.
	features: {
		inlineStyles: true // 'experimental.inlineSSRStyles' 대신 이걸 사용하세요.
	},
	css: [
		'@/assets/scss/style.scss'
	],
	vite: {
		css: {
			preprocessorOptions: {
				scss: {
					style: 'compressed',
					// 변수나 믹스인 파일만 자동으로 모든 컴포넌트에 주입
					additionalData: '@use "@/assets/scss/_reset.scss" as *;'
				}
			}
		}
	},

  // 5. 서버 측 렌더링 (SSR) 및 환경 변수 설정

	ssr: false,// 서버 측 렌더링 비활성화
	runtimeConfig: {
	// 서버에서만 접근 가능한 변수 (외부 노출 X)
	apiSecret: 'my-secret', 
	// 공개적으로 접근 가능한 변수 (클라이언트에서도 접근 가능)
	public: {
		apiBase: '/api'
	}
	},

  // 6. 헤더 및 메타데이터 설정 (App Configuration)
  // 모든 페이지에 공통적으로 적용될 <head> 태그 내용을 설정합니다.
	app: {
	head: {
		htmlAttrs: {
			lang: 'ko' // 이 부분이 페이지를 한국어로 인식하게 만듭니다.
		},
		title: '타로카드 - 생일 & 해운 ',
		meta: [
			{ charset: 'utf-8' },
			{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
			// { hid: 'description', name: 'description', content: 'Nuxt 3 프로젝트 기본 템플릿입니다.' }
			],
			link: [
			// { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
			]
		},
    	// 본인의 깃허브 저장소 이름이 'Tarot'이라면 아래와 같이 설정
		baseURL: '/tarot/', 
		buildAssetsDir: 'assets',
	},
	nitro: {
		preset: 'github-pages'
	}
  // 7. 기타 설정
  // typescript: {
  //   typeCheck: true // 타입 체크 활성화
  // },
})

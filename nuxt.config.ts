import { defineNuxtConfig } from 'nuxt/config'

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

	// 5. ★ 중요: 빌드 결과물을 docs 폴더로 변경하는 설정 ★
	ssr: false,// 서버 측 렌더링 비활성화
	nitro: {
		preset: 'static',
		output: {
			publicDir: 'docs' // 빌드된 정적 파일들이 프로젝트 루트의 /docs 폴더로 들어갑니다.
		}
	},

	// 6. 런타임 설정
	runtimeConfig: {
		apiSecret: 'my-secret',
		public: {
			apiBase: '/api',
			firebaseApiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
			firebaseAuthDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
			firebaseProjectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
			firebaseStorageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
			firebaseMessagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
			firebaseAppId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID,
		}
	},

	// 6. 헤더 및 메타데이터 설정 (App Configuration)
	// 모든 페이지에 공통적으로 적용될 <head> 태그 내용을 설정합니다.
	app: {
	head: {
		htmlAttrs: {
			lang: 'ko' // 이 부분이 페이지를 한국어로 인식하게 만듭니다.
		},
		title: 'numerologyTarot - 수비학으로 보는 타로',
		meta: [
				{ charset: 'utf-8' },
				{ name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
				
				{ property: 'og:title', content: 'numerologyTarot - 수비학으로 보는 타로'},
				// 2. 상세 설명
				{ property: 'og:description', content: '부자사관학교 타로🔮' },
				// 3. 이미지 URL (반드시 http/https로 시작하는 전체 경로여야 합니다)
				{ property: 'og:image', content: 'https://una41.github.io/tarot/img/main.jpg?v=1' },
				// 4. 클릭 시 이동할 주소
				{ property: 'og:url', content: 'https://una41.github.io/tarot/' },
			],
			link: [
				{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
			]
		},
    	// 본인의 깃허브 저장소 이름이 'Tarot'이라면 아래와 같이 설정
		baseURL: '/', 
		buildAssetsDir: 'assets',
	},
})

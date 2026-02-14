// plugins/firebase.js
// 동적 import로 번들 분리 (초기 로딩 최적화)

let auth;
let db;
let firebaseApp;

export default defineNuxtPlugin(async (nuxtApp) => {
	const config = useRuntimeConfig();

	const firebaseConfig = {
		apiKey: config.public.firebaseApiKey,
		authDomain: config.public.firebaseAuthDomain,
		projectId: config.public.firebaseProjectId,
		storageBucket: config.public.firebaseStorageBucket,
		messagingSenderId: config.public.firebaseMessagingSenderId,
		appId: config.public.firebaseAppId,
	};

	// 동적 import로 Firebase 모듈 로드
	const [{ initializeApp }, { getAuth, browserLocalPersistence, setPersistence }, { getFirestore }] = await Promise.all([
		import('firebase/app'),
		import('firebase/auth'),
		import('firebase/firestore')
	]);

	// Firebase 초기화
	firebaseApp = initializeApp(firebaseConfig);
	auth = getAuth(firebaseApp);

	// 쿠키(1일)와 동일하게 브라우저 닫아도 인증 유지
	await setPersistence(auth, browserLocalPersistence);

	db = getFirestore(firebaseApp);

	return {
		provide: {
		auth,
		db,
		firebaseApp
		}
	};
});

// store 등에서 직접 import { auth, db } 로 쓸 수 있게 내보냅니다.
export { auth, db, firebaseApp };
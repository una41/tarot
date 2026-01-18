// plugins/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Firestore 추가

// 전역 변수로 선언하여 export 합니다.
let auth;
let db;
let firebaseApp;

export default defineNuxtPlugin((nuxtApp) => {
	const config = useRuntimeConfig();

	const firebaseConfig = {
		apiKey: config.public.firebaseApiKey,
		authDomain: config.public.firebaseAuthDomain,
		projectId: config.public.firebaseProjectId,
		storageBucket: config.public.firebaseStorageBucket,
		messagingSenderId: config.public.firebaseMessagingSenderId,
		appId: config.public.firebaseAppId,
	};

	// Firebase 초기화 (중복 방지)
	firebaseApp = initializeApp(firebaseConfig);
	auth = getAuth(firebaseApp);
	db = getFirestore(firebaseApp); // Firestore 초기화

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
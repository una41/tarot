import { useTarotStore } from '~/stores/tarot';

// 구독 여부를 확인하고, 비구독자는 /app/subscribe 으로 리디렉션
export default defineNuxtRouteMiddleware(async () => {
	// SSR에서는 실행하지 않음
	if (process.server) return;

	const store = useTarotStore();

	// 앱(Android WebView) 환경에서만 동작 — 웹 브라우저는 패스
	if (!window.ReactNativeWebView) return;

	// 로그인 안 된 경우 패스 (app.vue에서 Login 컴포넌트 표시)
	if (!store.isLoggedIn) return;

	// subscriptionLoaded 될 때까지 대기 (최대 5초)
	await new Promise((resolve) => {
		if (store.subscriptionLoaded) {
			resolve();
			return;
		}
		let count = 0;
		const interval = setInterval(() => {
			count++;
			if (store.subscriptionLoaded || count > 50) {
				clearInterval(interval);
				resolve();
			}
		}, 100);
	});

	const expiry = store.subscription.subscriptionExpiry
		? new Date(store.subscription.subscriptionExpiry)
		: null;
	const isActive = store.subscription.isSubscribed && expiry && expiry > new Date();

	// paywallAccepted: 이미 페이월을 확인한 경우 재노출 방지 (로그인 세션당 1회만 표시)
	if (!isActive && !store.paywallAccepted) {
		return navigateTo('/app/paywall');
	}
});

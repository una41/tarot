<template>
	<div>
		<!-- 초기 로더 (JS 로드 전에도 보임, Vue 마운트 후 제거) -->
		<Teleport to="body">
			<div v-if="showInitialLoader" id="initial-loader">
				<div class="loader-content">
					<div class="mystic-icon"><img :src="'/img/icon_ball.png'" class="ico_ball" alt="" /></div>
					<h1 class="title">운명의 흐름을 읽는 중</h1>
					<div class="progress-bar">
						<div class="progress-inner"></div>
					</div>
					<p class="subtitle">잠시만 기다려 주세요...</p>
				</div>
			</div>
		</Teleport>

		<!-- 전역 로더 -->
		<GlobalLoader />

		<div v-show="!store.loader.isAppLoading && store.authChecked">
			<NuxtLayout v-if="store.isLoggedIn || isPublicPage">
				<NuxtPage />
			</NuxtLayout>
			<Login v-else/>
		</div>

		<!-- 전역 모달 -->
		<AlertModal />
		<ConfirmModal />
	</div>
</template>

<script setup>
	import { ref, computed, watch } from 'vue';
	import { useTarotStore } from '~/stores/tarot';
	const store = useTarotStore();
	const route = useRoute();
	const publicPages = ['/terms', '/privacy', '/app/terms', '/app/privacy', '/payment/success', '/payment/fail'];
	const isPublicPage = computed(() => publicPages.includes(route.path));
	const showInitialLoader = ref(true);

	// 비로그인 상태일 때 앱으로 { login: false } 전송
	// index.vue는 비로그인 시 마운트되지 않으므로 여기서 처리
	watch(() => store.authChecked, (checked) => {
		if (!checked || store.isLoggedIn) return
		window.ReactNativeWebView?.postMessage(JSON.stringify({ login: false }))
	}, { immediate: true })

	onMounted(() => {
		// 앱이 켜질 때 쿠키에 토큰이 있는지 확인
		store.checkAuth();
		// 앱 웹뷰 감지 시 body에 클래스 추가
		if (window.ReactNativeWebView) {
			document.body.classList.add('is_app_view');
			// 앱에서 JS 주입으로 Firebase signOut을 트리거하기 위한 전역 함수
			// modular SDK는 window.firebase가 없어서 앱에서 직접 호출 불가능하므로 웹에서 노출
			window.__appSignOut = async () => {
				await store.fnLogout();
				window.ReactNativeWebView?.postMessage(JSON.stringify({ login: false }));
				navigateTo('/');
			};
		}
		// GlobalLoader가 먼저 브라우저에 그려진 후 초기 로더 제거 (깜박임 방지)
		requestAnimationFrame(() => {
			showInitialLoader.value = false;
		});
		// 최소 0.6초는 보여줌
		setTimeout(() => {
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					store.setAppLoading(false);
				});
			});
		}, 600);
	});
</script>


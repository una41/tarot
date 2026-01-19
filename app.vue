<template>
	<div>
		<!-- 초기 로더 (JS 로드 전에도 보임, Vue 마운트 후 제거) -->
		<Teleport to="body">
			<div v-if="showInitialLoader" id="initial-loader">
				<div class="loader-content">
					<div class="mystic-icon">🔮</div>
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

		<div v-show="!store.loader.isAppLoading">
			<NuxtLayout v-if="store.isLoggedIn">
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
	import { ref } from 'vue';
	import { useTarotStore } from '~/stores/tarot';
	const store = useTarotStore();
	const showInitialLoader = ref(true);

	onMounted(() => {
		// 앱이 켜질 때 쿠키에 토큰이 있는지 확인
		store.checkAuth();
		// Vue 마운트 후 초기 로더 제거
		showInitialLoader.value = false;
  		// 최소 0.6초는 보여줌
		setTimeout(() => {
			// 브라우저에게 "다음 화면 그릴 준비가 되면 알려줘"라고 요청
			requestAnimationFrame(() => {
				// 한 번 더 요청하여 확실하게 프레임 준비를 마침 (더블 버퍼링 개념)
				requestAnimationFrame(() => {
					store.setAppLoading(false);
				});
			});
		}, 600);
	});
</script>


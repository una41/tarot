<template>
	<div>
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
	import { useTarotStore } from '~/stores/tarot';
	const store = useTarotStore();

	onMounted(() => {
		// 앱이 켜질 때 쿠키에 토큰이 있는지 확인
		store.checkAuth();
  		// 최소 1.2초는 보여줌
		setTimeout(() => {
			// 브라우저에게 "다음 화면 그릴 준비가 되면 알려줘"라고 요청
			requestAnimationFrame(() => {
				// 한 번 더 요청하여 확실하게 프레임 준비를 마침 (더블 버퍼링 개념)
				requestAnimationFrame(() => {
					store.setAppLoading(false);
				});
			});
		}, 1200);
	});
</script>


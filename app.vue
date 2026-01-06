<template>
	<div>
		<Transition name="fade">
			<div v-if="isLoading" class="intro-loader">
				<div class="loader-content">
				<div class="mystic-icon">🔮</div>
				<h1 class="title">운명의 흐름을 읽는 중</h1>
				<div class="progress-bar">
					<div class="progress-inner"></div>
				</div>
				<p class="subtitle">잠시만 기다려 주세요...</p>
				</div>
			</div>
		</Transition>

		<div v-show="!isLoading">
			<NuxtLayout>
				<NuxtPage />
			</NuxtLayout>
		</div>
	</div>
</template>

<script setup>
	const isLoading = ref(true);
	onMounted(() => {
  	// 최소 1.2초는 보여줌
	setTimeout(() => {
		// 브라우저에게 "다음 화면 그릴 준비가 되면 알려줘"라고 요청
		requestAnimationFrame(() => {
			// 한 번 더 요청하여 확실하게 프레임 준비를 마침 (더블 버퍼링 개념)
			requestAnimationFrame(() => {
				isLoading.value = false;
			});
		});
	}, 1200);
	});
</script>

<style lang="scss">
	/* 전역 스타일 혹은 scoped 설정 */
	.intro-loader {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: radial-gradient(circle, #01062c 0%, #0f172a 100%); // 진한 보라색~검정 그라데이션
		background: #121212;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 9999;
		color: #ddd6fe;/* 🌟 중요: 부드러운 하드웨어 가속을 위해 추가 */
		will-change: opacity, transform, filter;
		/* 초기 상태 */
		opacity: 1;
		filter: blur(0px);
		transform: scale(1);
		.loader-content {
			text-align: center;
			.mystic-icon {
				font-size: 4rem;
				margin-bottom: 1.5rem;
				animation: float 2s ease-in-out infinite;
			}

			.title {
				font-size: 1.2rem;
				letter-spacing: 0.2rem;
				margin-bottom: 2rem;
				font-weight: 300;
			}

			.progress-bar {
				width: 200px;
				height: 2px;
				background: rgba(255, 255, 255, 0.1);
				margin: 0 auto 1rem;
				overflow: hidden;
			.progress-inner {
				width: 100%;
				height: 100%;
				background: linear-gradient(90deg, transparent, #c084fc, transparent);
				animation: loading-line 1.5s infinite;
			}
		}

		.subtitle {
		font-size: 0.9rem;
		opacity: 0.6;
		}
	}
	}

	/* 애니메이션 효과 */
	@keyframes float {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-15px); filter: drop-shadow(0 0 15px #a78bfa); }
	}

	@keyframes loading-line {
		0% { transform: translateX(-100%); }
		100% { transform: translateX(100%); }
	}

	/* 사라지기 시작할 때의 상태 정의 (Vue Transition) */
	.fade-leave-active {
	/* 시간을 1.5초로 늘리고, ease-in-out으로 부드럽게 시작하고 끝나게 설정 */
	transition: all 1.5s ease-in-out;
	}

	/* 사라지는 마지막 순간의 상태 */
	.fade-leave-to {
		opacity: 0;
	/* 핵심: 사라지면서 약간 흐려지고 커지면서 안개처럼 흩어짐 */
	filter: blur(20px);
		transform: scale(1.1); 
	}
</style>
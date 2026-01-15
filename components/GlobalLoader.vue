<template>
	<Transition name="ifade">
		<div v-if="store.loader.isAppLoading || store.loader.isPdfLoading" class="global-loader" :class="{ 'pdf-mode': store.loader.isPdfLoading }">
			<div class="loader-content">
				<div class="mystic-icon">{{ loaderConfig.icon }}</div>
				<h1 class="title">{{ loaderConfig.title }}</h1>
				<div class="progress-bar">
					<div class="progress-inner"></div>
				</div>
				<p class="subtitle">{{ loaderConfig.subtitle }}</p>
			</div>
		</div>
	</Transition>
</template>

<script setup>
	import { computed } from 'vue';
	import { useTarotStore } from '~/stores/tarot';

	const store = useTarotStore();

	const loaderConfig = computed(() => {
		if (store.loader.isPdfLoading) {
			return {
				icon: '🔮',
				title: '운명의 흐름을 저장하는 중',
				subtitle: '잠시만 기다려 주세요...'
			};
		}
		return {
			icon: '🔮',
			title: '운명의 흐름을 읽는 중',
			subtitle: '잠시만 기다려 주세요...'
		};
	});
</script>

<style lang="scss" scoped>
	.global-loader {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: #121212;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 9999;
		color: #ddd6fe;
		will-change: opacity, transform, filter;
		opacity: 1;
		filter: blur(0px);
		transform: scale(1);

		&.pdf-mode {
			z-index: 99999;
		}

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

	@keyframes float {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-15px); filter: drop-shadow(0 0 15px #a78bfa); }
	}

	@keyframes loading-line {
		0% { transform: translateX(-100%); }
		100% { transform: translateX(100%); }
	}

	/* Vue Transition */
	.ifade-leave-active {
		transition: all 1.5s ease-in-out;
	}

	.ifade-leave-to {
		opacity: 0;
		filter: blur(20px);
		transform: scale(1.1);
	}
</style>

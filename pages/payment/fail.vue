<template>
	<div class="payment_result">
		<div class="result_card">
			<div class="icon">❌</div>
			<h1 class="result_title">결제가 취소되었습니다</h1>
			<p class="result_desc">{{ errorMessage }}</p>
			<button class="btn_go" @click="navigateTo('/', { replace: true })">돌아가기</button>
		</div>
	</div>
</template>

<script setup>
const route = useRoute();
const errorMessage = computed(() => {
	const code = route.query.code;
	const msg = route.query.message;
	if (code === 'USER_CANCEL') return '결제를 취소했습니다.';
	return msg || '결제 중 문제가 발생했습니다.';
});
</script>

<style lang="scss" scoped>
.payment_result {
	width: 100%;
	min-height: 100vh;
	background: #f5f0e8;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 20px;

	.result_card {
		background: #fff;
		border-radius: 20px;
		padding: 40px 30px;
		text-align: center;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		width: 100%;
		max-width: 360px;

		.icon {
			font-size: 3.5rem;
			margin-bottom: 20px;
		}

		.result_title {
			font-size: 1.2rem;
			font-weight: 700;
			color: #2d2015;
			margin-bottom: 10px;
		}

		.result_desc {
			font-size: 0.9rem;
			color: #8b7355;
			line-height: 1.5;
			margin-bottom: 24px;
		}

		.btn_go {
			width: 100%;
			padding: 14px 0;
			background: #5c4033;
			color: #fff;
			border: none;
			border-radius: 12px;
			font-size: 1rem;
			font-weight: 600;
			cursor: pointer;
			transition: background 300ms;

			&:hover {
				background: #7a5a48;
			}
		}
	}
}
</style>

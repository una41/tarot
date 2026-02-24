<template>
	<div class="payment_result">
		<div class="result_card">
			<template v-if="state === 'loading'">
				<div class="icon loading_icon">⏳</div>
				<h1 class="result_title">결제 처리 중...</h1>
				<p class="result_desc">잠시만 기다려 주세요.</p>
			</template>

			<template v-else-if="state === 'success'">
				<div class="icon">✅</div>
				<template v-if="isTrial">
					<h1 class="result_title">1일 무료 체험이 시작되었습니다!</h1>
					<p class="result_desc">체험 종료 후 월 4,900원이 자동 결제됩니다.</p>
					<p class="result_expiry">체험 종료일: ~ {{ expiryText }}</p>
				</template>
				<template v-else>
					<h1 class="result_title">구독이 완료되었습니다!</h1>
					<p class="result_desc">월 4,900원 구독이 시작되었습니다.</p>
					<p class="result_expiry">이용 가능 기간: ~ {{ expiryText }}</p>
				</template>
				<button class="btn_go" @click="navigateTo('/app/my', { replace: true })">마이페이지로 이동</button>
			</template>

			<template v-else-if="state === 'error'">
				<div class="icon">❌</div>
				<h1 class="result_title">결제에 실패했습니다</h1>
				<p class="result_desc">{{ errorMessage }}</p>
				<button class="btn_go" @click="navigateTo('/', { replace: true })">돌아가기</button>
			</template>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useTarotStore } from '~/stores/tarot';

const store = useTarotStore();
const route = useRoute();
const config = useRuntimeConfig();

const state = ref('loading');
const isTrial = ref(false);
const expiryText = ref('');
const errorMessage = ref('결제 처리 중 문제가 발생했습니다. 고객센터에 문의해주세요.');

const formatExpiry = (isoString) => {
	const d = new Date(isoString);
	return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
};

const waitForAuth = () => {
	return new Promise((resolve) => {
		if (store.authChecked) {
			resolve();
			return;
		}
		const interval = setInterval(() => {
			if (store.authChecked) {
				clearInterval(interval);
				resolve();
			}
		}, 100);
		// 5초 타임아웃
		setTimeout(() => { clearInterval(interval); resolve(); }, 5000);
	});
};

onMounted(async () => {
	const authKey = route.query.authKey;
	const customerKey = route.query.customerKey;

	if (!authKey || !customerKey) {
		errorMessage.value = '결제 정보가 올바르지 않습니다.';
		state.value = 'error';
		return;
	}

	// 인증 상태 복원 대기
	await waitForAuth();

	if (!store.isLoggedIn || !store.user?.uid) {
		errorMessage.value = '로그인 정보를 확인할 수 없습니다. 다시 로그인 후 시도해주세요.';
		state.value = 'error';
		return;
	}

	try {
		const workerUrl = config.public.workerUrl;
		const trial = route.query.trial === 'true';
		const res = await fetch(`${workerUrl}/api/billing/issue`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				authKey,
				customerKey,
				uid: store.user.uid,
				customerEmail: store.user.email,
				customerName: store.user.name,
				trial,
			}),
		});

		const data = await res.json();

		if (res.ok && data.success) {
			isTrial.value = data.trial || false;
			expiryText.value = formatExpiry(data.trial ? data.trialExpiry : data.expiry);
			state.value = 'success';
		} else {
			errorMessage.value = data.error || '결제 처리 중 문제가 발생했습니다.';
			state.value = 'error';
		}
	} catch (e) {
		errorMessage.value = '서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.';
		state.value = 'error';
	}
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

			&.loading_icon {
				animation: spin 1.5s linear infinite;
			}
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
			margin-bottom: 8px;
		}

		.result_expiry {
			font-size: 0.95rem;
			font-weight: 600;
			color: #5c4033;
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
			margin-top: 20px;
			transition: background 300ms;

			&:hover {
				background: #7a5a48;
			}
		}
	}
}

@keyframes spin {
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
}
</style>

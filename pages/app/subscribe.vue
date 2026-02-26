<template>
	<div class="page_subscribe">
		<div class="subscribe_wrap">
			<!-- 헤더 -->
			<div class="subscribe_header">
				<div class="logo_icon"><img src="https://img.numerologytarot.uk/web/img/icon_ball.png?v=260219" class="ico_ball" alt="" /></div>
				<h1 class="subscribe_title">수비학타로 앱</h1>
				<p class="subscribe_subtitle">부자사관학교 전용 타로 앱</p>
			</div>

			<!-- 혜택 목록 -->
			<ul class="benefit_list">
				<li class="benefit_item">
					<span class="benefit_ico">🎴</span>
					<div class="benefit_txt">
						<strong>생일카드 분석</strong>
						<span>수비학 기반 생일 타로 해석</span>
					</div>
				</li>
				<li class="benefit_item">
					<span class="benefit_ico">📅</span>
					<div class="benefit_txt">
						<strong>해운카드 분석</strong>
						<span>올해의 운세 흐름 파악</span>
					</div>
				</li>
				<li class="benefit_item">
					<span class="benefit_ico">📄</span>
					<div class="benefit_txt">
						<strong>PDF 저장</strong>
						<span>분석 결과 PDF로 다운로드</span>
					</div>
				</li>
				<li class="benefit_item">
					<span class="benefit_ico">♾️</span>
					<div class="benefit_txt">
						<strong>무제한 이용</strong>
						<span>구독 기간 중 제한 없이 이용</span>
					</div>
				</li>
			</ul>

			<!-- 구독 카드 -->
			<div class="subscribe_card">
				<div class="price_info">
					<span class="price_amount">4,900원</span>
					<span class="price_unit">/ 월</span>
				</div>
				<!-- <p class="price_desc" v-if="!subscriptionStatus.trialUsed">
					1일 무료 체험 후 월 4,900원 · 언제든 취소 가능
				</p> -->
				<p class="price_desc">
					월 4,900원 · 자동결제 · 언제든 취소 가능
				</p>

				<button
					v-if="!subscriptionStatus.isActive"
					class="btn_subscribe"
					@click="fnSubscribe"
					:disabled="isLoading"
				>
					<template v-if="isLoading">로딩 중...</template>
					<!-- <template v-else-if="!subscriptionStatus.trialUsed">1일 무료체험 후 앱 구독하기</template> -->
					<template v-else>앱 구독하기</template>
				</button>

				<!-- 이미 구독 중인 경우 -->
				<div v-else class="already_subscribed">
					<p class="already_txt">✅ 구독 중입니다</p>
					<button class="btn_go_app" @click="navigateTo('/app/birth')">앱 이용하기</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useTarotStore } from '~/stores/tarot';
import { doc, getDoc } from 'firebase/firestore';

const store = useTarotStore();

const isLoading = ref(true);

const userData = ref({
	isSubscribed: false,
	subscriptionExpiry: null,
	trialUsed: false,
});

onMounted(async () => {
	// store에 이미 구독 데이터가 있으면 사용
	if (store.subscriptionLoaded) {
		userData.value = {
			isSubscribed: store.subscription.isSubscribed,
			subscriptionExpiry: store.subscription.subscriptionExpiry,
			trialUsed: store.subscription.trialUsed,
		};
		isLoading.value = false;

		// 이미 구독 중이면 앱으로 이동
		const expiry = userData.value.subscriptionExpiry ? new Date(userData.value.subscriptionExpiry) : null;
		const isActive = userData.value.isSubscribed && expiry && expiry > new Date();
		if (isActive) {
			navigateTo('/app/birth');
		}
		return;
	}

	// Firestore에서 직접 조회
	if (store.user?.uid) {
		try {
			const { $db } = useNuxtApp();
			const snap = await getDoc(doc($db, 'users', store.user.uid));
			if (snap.exists()) {
				const d = snap.data();
				userData.value = {
					isSubscribed: d.isSubscribed || false,
					subscriptionExpiry: d.subscriptionExpiry || null,
					trialUsed: d.trialUsed || false,
				};

				// 이미 구독 중이면 앱으로 이동
				const expiry = userData.value.subscriptionExpiry ? new Date(userData.value.subscriptionExpiry) : null;
				const isActive = userData.value.isSubscribed && expiry && expiry > new Date();
				if (isActive) {
					navigateTo('/app/birth');
				}
			}
		} catch (e) {
			console.error('구독 정보 조회 실패:', e);
		}
	}
	isLoading.value = false;
});

const subscriptionStatus = computed(() => {
	const expiry = userData.value.subscriptionExpiry ? new Date(userData.value.subscriptionExpiry) : null;
	const isActive = userData.value.isSubscribed && expiry && expiry > new Date();
	return {
		isActive,
		trialUsed: userData.value.trialUsed || false,
	};
});

// 구독 버튼 클릭 → 안드로이드 앱에 구독 요청 전달
const fnSubscribe = () => {
	if (!window.ReactNativeWebView) return;
	// const isTrial = !subscriptionStatus.value.trialUsed;
	window.ReactNativeWebView.postMessage(JSON.stringify({
		type: 'subscribe',
		isTrial: false,
		uid: store.user?.uid || '',
		email: store.user?.email || '',
		name: store.user?.name || '',
	}));
};
</script>

<style lang="scss" scoped>
.page_subscribe {
	width: 100%;
	min-height: 100vh;
	background: #f5f0e8;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 30px 20px;
}

.subscribe_wrap {
	width: 100%;
	max-width: 400px;
}

.subscribe_header {
	text-align: center;
	margin-bottom: 28px;

	.logo_icon {
		font-size: 3rem;
		margin-bottom: 12px;
	}

	.subscribe_title {
		font-size: 1.4rem;
		font-weight: 700;
		color: #2d2015;
		margin-bottom: 6px;
	}

	.subscribe_subtitle {
		font-size: 0.9rem;
		color: #8b7355;
	}
}

.benefit_list {
	background: #fff;
	border-radius: 16px;
	padding: 10px 20px;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
	margin-bottom: 16px;

	.benefit_item {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 14px 0;
		border-bottom: 1px solid #f0ece4;

		&:last-child {
			border-bottom: none;
		}

		.benefit_ico {
			font-size: 1.5rem;
			width: 36px;
			text-align: center;
			flex-shrink: 0;
		}

		.benefit_txt {
			display: flex;
			flex-direction: column;
			gap: 3px;

			strong {
				font-size: 0.95rem;
				font-weight: 600;
				color: #2d2015;
			}

			span {
				font-size: 0.8rem;
				color: #8b7355;
			}
		}
	}
}

.subscribe_card {
	background: #fff;
	border-radius: 16px;
	padding: 24px 20px;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

	.price_info {
		display: flex;
		align-items: baseline;
		gap: 4px;
		margin-bottom: 8px;

		.price_amount {
			font-size: 1.8rem;
			font-weight: 700;
			color: #2d2015;
		}

		.price_unit {
			font-size: 0.95rem;
			color: #8b7355;
		}
	}

	.price_desc {
		font-size: 0.82rem;
		color: #8b7355;
		margin-bottom: 20px;
		line-height: 1.4;
	}

	.btn_subscribe {
		width: 100%;
		padding: 15px 0;
		background: #5c4033;
		color: #fff;
		border: none;
		border-radius: 12px;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		transition: background 300ms;
		letter-spacing: -0.3px;

		&:hover:not(:disabled) {
			background: #7a5a48;
		}

		&:disabled {
			opacity: 0.6;
			cursor: not-allowed;
		}
	}

	.already_subscribed {
		text-align: center;

		.already_txt {
			font-size: 0.95rem;
			color: #065f46;
			margin-bottom: 14px;
			font-weight: 600;
		}

		.btn_go_app {
			width: 100%;
			padding: 14px 0;
			background: #5c4033;
			color: #fff;
			border: none;
			border-radius: 12px;
			font-size: 0.95rem;
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

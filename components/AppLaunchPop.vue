<template>
	<Teleport to="body">
		<Transition name="m_fade">
			<div v-if="show" class="page_pop">
				<div class="bg" @click="show = false"></div>
				<div class="r_wrap">
					<div class="r_top">
						<h3>📱 앱 출시 안내</h3>
						<button class="btn_close" @click="show = false"><span>닫기</span></button>
					</div>
					<div class="r_cont">
						<!-- 홍보 배너 -->
						<div class="app_promo_banner">
							<div class="promo_emoji">🎉</div>
							<p class="promo_title">수비학타로 앱 정식 출시!</p>
							<p class="promo_desc">
								안드로이드 앱으로 더 빠르고 편리하게<br>
								부자사관학교 타로를 경험해보세요
							</p>
							<p class="promo_sub_desc">
								더 좋은 서비스 제공과 지속적인 성장을 위해 앱 구독제를 도입하였습니다.<br>
								보내주시는 응원은 더 좋은 콘텐츠와 안정적인 서비스로 보답하겠습니다.<br>
								최고의 파트너가 될 수 있도록 정성을 다해 관리하겠습니다.
							</p>
							<div class="promo_tags">
								<span class="tag">📱 안드로이드</span>
								<span class="tag"><img src="/img/icon_ball.png" class="ico_ball" alt="" /> 수비학 타로</span>
								<span class="tag">✨ 월 3,900원</span>
							</div>
						</div>

						<!-- 구독 카드 -->
						<div class="subscription_card">
							<div class="sub_header">
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#8b7355" viewBox="0 0 16 16">
									<path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1m3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z"/>
								</svg>
								<span class="sub_title">월 구독</span>
								<span class="sub_badge" :class="subStatus.isTrial ? 'trial' : subStatus.isActive ? 'active' : 'inactive'">
									{{ subStatus.isTrial ? '체험 중' : subStatus.isActive ? '구독 중' : '미구독' }}
								</span>
							</div>

							<!-- 체험 중 -->
							<div class="sub_info" v-if="subStatus.isActive && subStatus.isTrial">
								<p class="sub_desc">1일 무료 체험 기간</p>
								<p class="sub_expiry">~ {{ subStatus.expiryText }}</p>
								<p v-if="subStatus.isCancelled" class="sub_cancelled_note">체험이 취소되었습니다. 만료일까지 이용 가능합니다.</p>
								<p v-else class="sub_trial_note">체험 종료 후 월 3,900원 자동 결제</p>
							</div>
							<!-- 구독 중 -->
							<div class="sub_info" v-else-if="subStatus.isActive">
								<p class="sub_desc">어플 이용 가능 기간</p>
								<p class="sub_expiry">~ {{ subStatus.expiryText }}</p>
								<p v-if="subStatus.isCancelled" class="sub_cancelled_note">구독이 취소되었습니다. 만료일까지 이용 가능합니다.</p>
							</div>
							<!-- 미구독 -->
							<div class="sub_info" v-else>
								<p class="sub_desc" v-if="!subStatus.trialUsed">1일 무료 체험 후 월 3,900원 · 언제든 취소 가능</p>
								<p class="sub_desc" v-else>월 3,900원 · 자동결제 · 언제든 취소 가능</p>
							</div>

							<button
								v-if="!subStatus.isActive"
								class="btn_subscribe"
								@click="fnSubscribe"
								:disabled="subscribing"
							>
								{{ subscribing ? '처리 중...' : (subStatus.trialUsed ? '앱 구독하기' : '1일 무료체험 후 앱 구독하기') }}
							</button>
							<button
								v-else-if="!subStatus.isCancelled"
								class="btn_cancel_sub"
								@click="fnCancelSub"
								:disabled="cancelling"
							>
								{{ cancelling ? '처리 중...' : (subStatus.isTrial ? '체험 취소' : '구독 취소') }}
							</button>
						</div>
					</div>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useTarotStore } from '~/stores/tarot';
import { doc, getDoc } from 'firebase/firestore';

const store = useTarotStore();

const show = ref(false);
const subscribing = ref(false);
const cancelling = ref(false);
const subData = ref({
	isSubscribed: false,
	subscriptionExpiry: null,
	subscriptionCancelled: false,
	isTrial: false,
	trialUsed: false,
});

const subStatus = computed(() => {
	const now = new Date();
	const expiry = subData.value.subscriptionExpiry ? new Date(subData.value.subscriptionExpiry) : null;
	const isActive = subData.value.isSubscribed && expiry && expiry > now;
	const expiryText = expiry ? `${expiry.getFullYear()}년 ${expiry.getMonth() + 1}월 ${expiry.getDate()}일` : '';
	return {
		isActive,
		expiryText,
		isCancelled: subData.value.subscriptionCancelled || false,
		isTrial: subData.value.isTrial || false,
		trialUsed: subData.value.trialUsed || false,
	};
});

const open = async () => {
	show.value = true;
	if (!store.user?.uid) return;
	try {
		const { $db } = useNuxtApp();
		const snap = await getDoc(doc($db, 'users', store.user.uid));
		if (snap.exists()) {
			const d = snap.data();
			subData.value = {
				isSubscribed: d.isSubscribed || false,
				subscriptionExpiry: d.subscriptionExpiry || null,
				subscriptionCancelled: d.subscriptionCancelled || false,
				isTrial: d.isTrial || false,
				trialUsed: d.trialUsed || false,
			};
		}
	} catch (e) {
		console.error('구독 정보 조회 실패:', e);
	}
};

const fnSubscribe = async () => {
	if (subscribing.value) return;
	subscribing.value = true;
	try {
		const config = useRuntimeConfig();
		if (!window.TossPayments) {
			store.showAlert({ message: '결제 모듈 로딩 중입니다. 잠시 후 다시 시도해주세요.', icon: '⏳' });
			subscribing.value = false;
			return;
		}
		const tossPayments = window.TossPayments(config.public.tossClientKey);
		// 체험 미사용 사용자는 trial=true 파라미터 포함한 URL로 이동
		const isTrial = !subStatus.value.trialUsed;
		const successUrl = isTrial
			? `${window.location.origin}/payment/success?trial=true`
			: `${window.location.origin}/payment/success`;
		await tossPayments.requestBillingAuth('카드', {
			customerKey: store.user.uid,
			successUrl,
			failUrl: `${window.location.origin}/payment/fail`,
			customerEmail: store.user.email || '',
			customerName: store.user.name || '사용자',
		});
	} catch (e) {
		if (e.code !== 'USER_CANCEL') {
			store.showAlert({ message: '결제 요청 중 오류가 발생했습니다.', icon: '❌' });
		}
		subscribing.value = false;
	}
};

const fnCancelSub = () => {
	const isTrial = subStatus.value.isTrial;
	store.showConfirm({
		title: isTrial ? '체험 취소' : '구독 취소',
		message: isTrial
			? '무료 체험을 취소하시겠습니까?\n만료일까지는 계속 이용 가능합니다.'
			: '구독을 취소하시겠습니까?\n만료일까지는 계속 이용 가능합니다.',
		icon: '📋',
		confirmText: '취소하기',
		cancelText: '닫기',
		onConfirm: async () => {
			cancelling.value = true;
			try {
				const config = useRuntimeConfig();
				const res = await fetch(`${config.public.workerUrl}/api/billing/cancel`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ uid: store.user.uid, customerKey: store.user.uid }),
				});
				if (res.ok) {
					subData.value.subscriptionCancelled = true;
					store.showAlert({
						message: isTrial
							? '체험이 취소되었습니다.\n만료일까지 이용 가능합니다.'
							: '구독이 취소되었습니다.\n만료일까지 이용 가능합니다.',
						icon: '✅',
					});
				} else {
					store.showAlert({ message: '취소 처리 중 오류가 발생했습니다.', icon: '❌' });
				}
			} catch {
				store.showAlert({ message: '취소 처리 중 오류가 발생했습니다.', icon: '❌' });
			} finally {
				cancelling.value = false;
			}
		}
	});
};

defineExpose({ open });
</script>
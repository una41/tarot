<template>
	<div class="mypage">
		<div class="wrap_mypage">
			<div class="my_profile">
				<div class="avatar">
					<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#6b5a3e" viewBox="0 0 16 16">
						<path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
					</svg>
				</div>
				<p class="my_name">{{ userData.name || '-' }}</p>
				<span class="my_badge" :class="gradeClass">{{ store.userGrade || '일반' }}</span>
			</div>

			<div class="my_info_card">
				<!-- 이메일 (수정 불가) -->
				<dl class="my_info_item">
					<dt>
						<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="#8b7355" viewBox="0 0 16 16">
							<path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586zm3.436-.586L16 11.801V4.697z"/>
						</svg>
						<span>이메일</span>
					</dt>
					<dd>{{ userData.email || '-' }}</dd>
				</dl>
				<!-- 기수 (수정 불가) -->
				<dl class="my_info_item">
					<dt>
						<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="#8b7355" viewBox="0 0 16 16">
							<path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5l2.404.961L10.404 2zm3.564 1.426L5.596 5 8 5.961 14.154 3.5zm3.25 1.7-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464z"/>
						</svg>
						<span>기수</span>
					</dt>
					<dd>{{ userData.class || '-' }}</dd>
				</dl>
				<!-- 상호명 -->
				<dl class="my_info_item">
					<dt>
						<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="#8b7355" viewBox="0 0 16 16">
							<path d="M4 16s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-5.95a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>
							<path d="M2 1a2 2 0 0 0-2 2v9.5A1.5 1.5 0 0 0 1.5 14h.653a5.4 5.4 0 0 1 1.066-2H1V3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v9h-2.219c.554.654.89 1.373 1.066 2h.653A1.5 1.5 0 0 0 16 12.5V3a2 2 0 0 0-2-2z"/>
						</svg>
						<span>상호명</span>
					</dt>
					<dd v-if="!isEditing">{{ userData.corpName || '-' }}</dd>
					<dd v-else><input v-model="editForm.corpName" type="text" class="ipt_edit" placeholder="상호명 입력" /></dd>
				</dl>
				<!-- 전화번호 -->
				<dl class="my_info_item">
					<dt>
						<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="#8b7355" viewBox="0 0 16 16">
							<path fill-rule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z"/>
						</svg>
						<span>전화번호</span>
					</dt>
					<dd v-if="!isEditing">{{ encodedPhone }}</dd>
					<dd v-else>
						<input v-model="editForm.phone" type="tel" class="ipt_edit" placeholder="010-0000-0000" maxlength="13" @input="onPhoneInput" />
						<p v-if="phoneError" class="txt_error">{{ phoneError }}</p>
					</dd>
				</dl>

				<div v-if="!isEditing">
					<button class="btn_edit" @click="fnStartEdit">
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#8b7355" viewBox="0 0 16 16">
							<path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
							<path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
						</svg>
						<span>회원정보 수정</span>
					</button>
				</div>
				<div v-else class="btn_edit_group">
					<button class="btn_cancel" @click="fnCancelEdit">취소</button>
					<button class="btn_save" @click="fnSaveEdit">저장</button>
				</div>
			</div>
			<!-- 구독 카드 -->
			<!-- <div class="subscription_card" v-if="subscriptionStatus.isActive">
				<div class="sub_header">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#8b7355" viewBox="0 0 16 16">
						<path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1m3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z"/>
					</svg>
					<span class="sub_title">앱 월구독</span>
					<span class="sub_badge" :class="subscriptionStatus.isActive ? 'active' : 'inactive'">
						{{ subscriptionStatus.isActive ? '정기 구독 중' : '미구독' }}
					</span>
				</div>
				<div class="sub_info" v-if="subscriptionStatus.isActive">
					<p class="sub_desc">{{ subscriptionStatus.isCancelled ? '이용 가능 기간' : '다음 결제일' }}</p>
					<p class="sub_expiry">~ {{ subscriptionStatus.expiryText }}</p>
					<p v-if="subscriptionStatus.isCancelled" class="sub_cancelled_note">구독이 취소되었습니다. 만료일까지 이용 가능합니다.</p>
				</div>
				<div class="sub_info" v-else>
					<p class="sub_desc">월 3,900원 · 자동결제 · 언제든 취소 가능</p>
				</div>
				<button v-if="!subscriptionStatus.isActive" class="btn_subscribe" @click="fnStartSubscription" :disabled="isSubscribing">
					{{ isSubscribing ? '처리 중...' : '앱 구독하기' }}
				</button>
				<button v-else-if="!subscriptionStatus.isCancelled" class="btn_cancel_sub" @click="fnCancelSubscription" :disabled="isCancelling">
					{{ isCancelling ? '처리 중...' : '구독 취소' }}
				</button>
			</div> -->

			<button class="btn_logout" @click="fnLogout">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#c53030" viewBox="0 0 16 16">
					<path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
					<path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
				</svg>
				<span>로그아웃</span>
			</button>
			<div class="withdraw_area">
				<button class="btn_withdraw" @click="showWithdrawModal = true">회원 탈퇴</button>
			</div>
			<p class="txt_contact">문의사항은 <a href="mailto:runanumerologytarot@gmail.com">runanumerologytarot@gmail.com</a>으로 보내주세요.</p>
		</div>
	</div>

	<!-- 회원 탈퇴 모달 -->
	<Transition name="m_fade">
		<div v-if="showWithdrawModal" class="modal withdraw_modal" @click="closeWithdrawModal">
			<div class="m_container" @click.stop>
				<div class="m_header">
					<h2 class="m_title">회원 탈퇴</h2>
					<button type="button" class="btn_close" @click="closeWithdrawModal">✕</button>
				</div>
				<div class="m_body">
					<p class="withdraw_warning">탈퇴 요청 후 관리자 승인 시 처리됩니다.<br>탈퇴 요청 중에는 로그인이 불가합니다.</p>
					<div class="ipt_wrap">
						<label class="ipt_label">비밀번호 확인</label>
						<input
							type="password"
							class="ipt_pw"
							v-model="withdrawPassword"
							placeholder="현재 비밀번호를 입력하세요"
							@keyup.enter="fnConfirmWithdraw"
						/>
						<p v-if="withdrawError" class="txt_error">{{ withdrawError }}</p>
					</div>
					<div class="withdraw_btns">
						<button type="button" class="btn_cancel_edit" @click="closeWithdrawModal">취소</button>
						<button type="button" class="btn_withdraw_confirm" @click="fnConfirmWithdraw" :disabled="isWithdrawing">
							{{ isWithdrawing ? '처리 중...' : '탈퇴하기' }}
						</button>
					</div>
				</div>
			</div>
		</div>
	</Transition>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useTarotStore } from '~/stores/tarot';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { encryptPhone, decryptPhone, decryptData } from '~/utils/phoneEncrypt';


const store = useTarotStore();

const isEditing = ref(false);
const isSaving = ref(false);
// const isSubscribing = ref(false);
// const isCancelling = ref(false);

const userData = ref({
	name: store.user?.name || '',
	email: store.user?.email || '',
	phone: '',
	corpName: '',
	class: '',
	// isSubscribed: false,
	// subscriptionExpiry: null,
	// subscriptionCancelled: false,
	// isTrial: false,
	// trialUsed: false,
});

const editForm = ref({
	corpName: '',
	phone: '',
});

const config = useRuntimeConfig();
const cryptoKey = config.public.cryptoKey;

// 복호화된 전화번호 (async 처리 → ref + watch 패턴)
const decodedPhone = ref('');
watch(() => userData.value.phone, async (encoded) => {
	decodedPhone.value = await decryptPhone(encoded, cryptoKey);
}, { immediate: true });

// 전화번호 마스킹 표시 (복호화 후 010-****-4017 형태)
const encodedPhone = computed(() => {
	const decoded = decodedPhone.value;
	if (!decoded) return '-';
	const clean = decoded.replace(/[^0-9]/g, '');
	if (!clean || clean.length < 8) return '-';
	if (clean.length === 11) {
		return `${clean.slice(0, 3)}-****-${clean.slice(7)}`;
	}
	if (clean.length === 10) {
		return `${clean.slice(0, 3)}-***-${clean.slice(6)}`;
	}
	return `${clean.slice(0, 3)}-${'*'.repeat(clean.length - 7)}-${clean.slice(-4)}`;
});

const phoneError = ref('');
const phonePattern = /^\d{3}-\d{3,4}-\d{4}$/;

// 전화번호 입력 시 숫자+하이픈만 허용
const onPhoneInput = (e) => {
	editForm.value.phone = e.target.value.replace(/[^0-9-]/g, '');
	if (editForm.value.phone && !phonePattern.test(editForm.value.phone)) {
		phoneError.value = '010-0000-0000 형식으로 입력해주세요';
	} else {
		phoneError.value = '';
	}
};

const loadUserData = async () => {
	if (!store.user?.uid) return;
	try {
		const { $db } = useNuxtApp();
		const userDoc = await getDoc(doc($db, 'users', store.user.uid));
		if (userDoc.exists()) {
			const data = userDoc.data();
			userData.value = {
				name: await decryptData(data.name, cryptoKey) || '',
				email: data.email || '',
				phone: data.phone || '',
				corpName: data.corpName || '',
				class: data.class || '',
				// isSubscribed: data.isSubscribed || false,
				// subscriptionExpiry: data.subscriptionExpiry || null,
				// subscriptionCancelled: data.subscriptionCancelled || false,
				// isTrial: data.isTrial || false,
				// trialUsed: data.trialUsed || false,
			};
		}
	} catch (e) {
		console.error('사용자 정보 조회 실패:', e);
	}
};

const route = useRoute();

onMounted(async () => {
	// 앱에서 URL 쿼리로 로그인 정보 전달 시 처리
	const { type, uid, email, token } = route.query;
	if (type === 'login' && uid && email && token) {
		store.user = { uid, email };
		store.token = token;
		store.isLoggedIn = true;
	}
	await loadUserData();
});

// const subscriptionStatus = computed(() => {
// 	const now = new Date();
// 	const expiry = userData.value.subscriptionExpiry ? new Date(userData.value.subscriptionExpiry) : null;
// 	const isActive = userData.value.isSubscribed && expiry && expiry > now;
// 	const expiryText = expiry ? `${expiry.getFullYear()}년 ${expiry.getMonth() + 1}월 ${expiry.getDate()}일` : '';
// 	return {
// 		isActive,
// 		expiryText,
// 		isCancelled: userData.value.subscriptionCancelled || false,
// 		isTrial: userData.value.isTrial || false,
// 		trialUsed: userData.value.trialUsed || false,
// 	};
// });

const gradeClass = computed(() => {
	const grade = store.userGrade;
	if (grade === '마스터') return 'master';
	if (grade === '프로') return 'pro';
	return 'normal';
});

const fnStartEdit = () => {
	editForm.value = {
		corpName: userData.value.corpName,
		phone: decodedPhone.value,
	};
	phoneError.value = '';
	isEditing.value = true;
};

const fnCancelEdit = () => {
	isEditing.value = false;
};

const fnSaveEdit = async () => {
	if (isSaving.value) return;
	isSaving.value = true;

	try {
		const { $db } = useNuxtApp();
		const userRef = doc($db, 'users', store.user.uid);
		const phone = editForm.value.phone.trim();
		if (!phonePattern.test(phone)) {
			phoneError.value = '010-0000-0000 형식으로 입력해주세요';
			isSaving.value = false;
			return;
		}
		const encrypted = await encryptPhone(phone, cryptoKey);

		await updateDoc(userRef, {
			corpName: editForm.value.corpName,
			phone: encrypted,
		});

		userData.value.corpName = editForm.value.corpName;
		userData.value.phone = encrypted;

		isEditing.value = false;
		store.showAlert({
			message: '회원정보가 수정되었습니다.',
			icon: '✅'
		});
	} catch (e) {
		console.error('회원정보 수정 실패:', e);
		store.showAlert({
			message: '수정에 실패했습니다. 다시 시도해주세요.',
			icon: '❌'
		});
	} finally {
		isSaving.value = false;
	}
};

const fnStartSubscription = async () => {
	if (isSubscribing.value) return
	isSubscribing.value = true
	store.setPaymentLoading(true)

	try {
		const config = useRuntimeConfig()
		const PortOne = await import('@portone/browser-sdk/v2')
		const result = await PortOne.requestIssueBillingKey({
			storeId: config.public.portoneStoreId,
			channelKey: config.public.portoneChannelKey,
			billingKeyMethod: 'CARD',
			issueId: `BILL-${store.user.uid.slice(0, 8)}-${Date.now()}`,
			issueName: '수비학타로 월 구독',
			customer: {
				customerId: store.user.uid,
				fullName: store.user.name || '사용자',
				email: store.user.email || '',
				phoneNumber: decodedPhone.value || '',
			},
			redirectUrl: `${window.location.origin}/payment/success`,
		})
		store.setPaymentLoading(false)
		if (result?.code) {
			console.error('[결제오류] code:', result.code, '/ message:', result.message)
			if (result.code !== 'PORTONE_USER_CANCEL') {
				store.showAlert({ message: result.message || '결제 중 오류가 발생했습니다.', icon: '❌' })
			}
			isSubscribing.value = false
		}
	} catch (e) {
		store.setPaymentLoading(false)
		console.error('[결제오류] catch:', e)
		store.showAlert({ message: '결제 요청 중 오류가 발생했습니다.', icon: '❌' })
		isSubscribing.value = false
	}
}

// const fnCancelSubscription = () => {
// 	const isTrial = subscriptionStatus.value.isTrial;
// 	store.showConfirm({
// 		title: isTrial ? '체험 취소' : '구독 취소',
// 		message: isTrial
// 			? '무료 체험을 취소하시겠습니까?\n만료일까지는 계속 이용 가능합니다.'
// 			: '구독을 취소하시겠습니까?\n만료일까지는 계속 이용 가능합니다.',
// 		icon: '📋',
// 		confirmText: '취소하기',
// 		cancelText: '닫기',
// 		onConfirm: async () => {
// 			isCancelling.value = true;
// 			try {
// 				const config = useRuntimeConfig();
// 				const workerUrl = config.public.workerUrl;

				const res = await fetch(`${workerUrl}/api/billing/cancel`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ uid: store.user.uid }),
				})

// 				if (res.ok) {
// 					userData.value.subscriptionCancelled = true;
// 					store.showAlert({
// 						message: isTrial
// 							? '체험이 취소되었습니다.\n만료일까지 이용 가능합니다.'
// 							: '구독이 취소되었습니다.\n만료일까지 이용 가능합니다.',
// 						icon: '✅',
// 					});
// 				} else {
// 					store.showAlert({ message: '취소 처리 중 오류가 발생했습니다.', icon: '❌' });
// 				}
// 			} catch (e) {
// 				store.showAlert({ message: '취소 처리 중 오류가 발생했습니다.', icon: '❌' });
// 			} finally {
// 				isCancelling.value = false;
// 			}
// 		}
// 	});
// };

const fnLogout = () => {
	store.showConfirm({
		title: '로그아웃',
		message: '로그아웃 하시겠습니까?',
		icon: '👋',
		onConfirm: async () => {
			await store.fnLogout();
			// 앱에 로그아웃 상태 전송
			window.ReactNativeWebView?.postMessage(JSON.stringify({ login: false }));
			navigateTo('/');
		}
	});
};

// 회원 탈퇴
const showWithdrawModal = ref(false);
const withdrawPassword = ref('');
const withdrawError = ref('');
const isWithdrawing = ref(false);

const closeWithdrawModal = () => {
	showWithdrawModal.value = false;
	withdrawPassword.value = '';
	withdrawError.value = '';
};

const fnConfirmWithdraw = async () => {
	if (!withdrawPassword.value.trim()) {
		withdrawError.value = '비밀번호를 입력해주세요.';
		return;
	}
	isWithdrawing.value = true;
	withdrawError.value = '';
	const result = await store.fnWithdraw(withdrawPassword.value);
	isWithdrawing.value = false;
	if (result.success) {
		closeWithdrawModal();
		store.showAlert({ message: '탈퇴 요청이 접수되었습니다.\n관리자 승인 후 처리됩니다.', icon: '📋' });
		navigateTo('/');
	} else {
		withdrawError.value = result.error;
	}
};
</script>

<style lang="scss" scoped>
.mypage {
	width: 100%;
	min-height: 100vh;
	background: #f5f0e8;
	margin: 0 auto;
	.wrap_mypage{
		width: 100%;
		height: 100%;
		padding: 20px 20px 20px;
	}
	.my_profile {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0 0 20px;

		.avatar {
			width: 60px;
			height: 60px;
			border-radius: 50%;
			background: #fbdf70;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-bottom: 10px;
		}

		.my_name {
			font-size: 16px;
			font-weight: 700;
			color: #2d2015;
			margin-bottom: 10px;
		}

		.my_badge {
			display: inline-block;
			padding: 4px 18px;
			border-radius: 20px;
			font-size: 12px;
			font-weight: 600;
			color: #fff;
			letter-spacing: 1px;

			&.normal {
				background: #6b7280;
			}
			&.pro {
				background: #7c3aed;
			}
			&.master {
				background: #5c4033;
			}
		}
	}

	.my_info_card {
		background: #fff;
		border-radius: 16px;
		padding: 22px 23px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

		.my_info_item {
			padding: 10px 0;
			border-bottom: 1px solid #e8e2d8;

			&:first-child {
				padding-top: 0;
			}
			&:last-of-type {
				border-bottom: none;
				padding-bottom: 15px;
			}

			dt {
				display: flex;
				align-items: center;
				gap: 10px;
				margin-bottom: 6px;

				span {
					font-size: 0.8rem;
					color: #999;
					font-weight: 400;
				}
			}

			dd {
				font-size: 15px;
				color: #2d2015;
				font-weight: 500;
				padding-left: 32px;

				.ipt_edit {
					width: 100%;
					padding: 8px 12px;
					border: 1.5px solid #c4b698;
					border-radius: 8px;
					font-size: 0.95rem;
					color: #2d2015;
					background: #faf8f4;
					outline: none;
					transition: border-color 200ms;

					&:focus {
						border-color: #8b7355;
					}

					&::placeholder {
						color: #c4b698;
					}
				}

				.txt_error {
					font-size: 0.75rem;
					color: #c53030;
					margin-top: 5px;
				}
			}
		}

		.btn_edit {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 8px;
			width: 100%;
			padding: 10px 0;
			border: 1.5px solid #c4b698;
			border-radius: 10px;
			background: transparent;
			cursor: pointer;
			transition: all 300ms;

			span {
				font-size: 14px;
				color: #5c4a34;
				font-weight: 500;
			}

			&:hover {
				background: #faf6ee;
			}
			&:active {
				background: #f0eadd;
			}
		}

		.btn_edit_group {
			display: flex;
			gap: 10px;

			button {
				flex: 1;
				padding: 14px 0;
				border-radius: 10px;
				font-size: 0.95rem;
				font-weight: 500;
				cursor: pointer;
				transition: all 300ms;
			}

			.btn_cancel {
				border: 1.5px solid #d1ccc3;
				background: #fff;
				color: #888;

				&:hover {
					background: #f5f5f5;
				}
			}

			.btn_save {
				border: none;
				background: #5c4033;
				color: #fff;

				&:hover {
					background: #7a5a48;
				}
			}
		}
	}

	.subscription_card {
		background: #fff;
		border-radius: 16px;
		padding: 20px 23px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
		margin-top: 16px;

		.sub_header {
			display: flex;
			align-items: center;
			gap: 8px;
			margin-bottom: 14px;

			.sub_title {
				font-size: 0.95rem;
				font-weight: 600;
				color: #2d2015;
				flex: 1;
			}

			.sub_badge {
				font-size: 0.75rem;
				font-weight: 600;
				padding: 3px 10px;
				border-radius: 20px;
				letter-spacing: 0.5px;

				&.active {
					background: #d1fae5;
					color: #065f46;
				}

				&.inactive {
					background: #f3f4f6;
					color: #6b7280;
				}

				&.trial {
					background: #fef3c7;
					color: #92400e;
				}
			}
		}

		.sub_info {
			margin-bottom: 0;
			.sub_desc {
				font-size: 0.85rem;
				color: #8b7355;
				margin-bottom: 15px;
			}

			.sub_expiry {
				font-size: 1rem;
				font-weight: 600;
				color: #2d2015;
			}

			.sub_trial_note {
				font-size: 0.8rem;
				color: #92400e;
				margin-top: 6px;
			}

			.sub_cancelled_note {
				font-size: 0.8rem;
				color: #9ca3af;
				margin-top: 6px;
			}
		}

		.btn_subscribe {
			width: 100%;
			padding: 13px 0;
			background: #5c4033;
			color: #fff;
			border: none;
			border-radius: 10px;
			font-size: 0.95rem;
			font-weight: 600;
			cursor: pointer;
			transition: all 300ms;

			&:hover:not(:disabled) {
				background: #7a5a48;
			}

			&:disabled {
				opacity: 0.6;
				cursor: not-allowed;
			}
		}

		.btn_cancel_sub {
			width: 100%;
			padding: 13px 0;
			margin-top: 12px;
			background: transparent;
			color: #9ca3af;
			border: 1.5px solid #e5e7eb;
			border-radius: 10px;
			font-size: 0.9rem;
			font-weight: 500;
			cursor: pointer;
			transition: all 300ms;

			&:hover:not(:disabled) {
				background: #f9fafb;
				color: #6b7280;
			}

			&:disabled {
				opacity: 0.6;
				cursor: not-allowed;
			}
		}
	}

	.btn_logout {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		width: 100%;
		padding: 10px 0;
		margin-top: 20px;
		border: 1.5px solid #e8bcbc;
		border-radius: 12px;
		background: #fff;
		cursor: pointer;
		transition: all 300ms;

		span {
			font-size: 14px;
			color: #c53030;
			font-weight: 500;
		}

		&:hover {
			background: #fef2f2;
		}
		&:active {
			background: #fde8e8;
		}
	}

	.withdraw_area {
		display: flex;
		justify-content: center;
		margin-top: 14px;

		.btn_withdraw {
			font-size: 12px;
			color: #bbb;
			text-decoration: underline;
			transition: color 200ms;

			&:hover {
				color: #ef4444;
			}
		}
	}

	.txt_contact {
		margin-top: 16px;
		padding-bottom: 10px;
		text-align: center;
		font-size: 12px;
		color: #bbb;

		a {
			color: #a89070;
			text-decoration: underline;

			&:hover {
				color: #5c4033;
			}
		}
	}
}
</style>

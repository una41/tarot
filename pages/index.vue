<template>
	<div class="wrap">
		<header class="header">
			<div class="left">
				<h1 class="l_logo">numerologyTarot</h1>
				<p>부자사관학교 타로</p>
			</div>
			<div class="right">
				<div class="user_menu" :class="{ on: isUserMenuOpen }">
					<button type="button" class="btn_user" @click="isUserMenuOpen = !isUserMenuOpen"></button>
					
					<div class="user_dropdown">
						<div class="user_info">{{ userName }}님 <span class="user_grade" :class="gradeClass">{{ store.userGrade }}</span></div>
						<!-- <div class="user_info">{{ userName }}님 <span class="user_grade" :class="gradeClass">{{ store.userGrade }}</span> <span class="user_state_subscribe trial" v-if="popSubStatus.isActive && popSubStatus.isTrial">체험 중</span><span class="user_state_subscribe active" v-else-if="popSubStatus.isActive">앱 구독중</span></div> -->
						<button type="button" class="btn_myinfo" @click.stop="openProfileModal">내정보</button>
						<button type="button" class="btn_logout" @click.stop="showLogoutModal">로그아웃</button>
					</div>
				</div>
			</div>
		</header>
		<div class="main">
			<div class="f_wrap">
				<Tabs/>
				<Input/>
			</div>
		</div>
		<!-- <TarotProResult v-if="store.result !== null && !store.isReading" :data="store.picked === 'r1'? proBirthData : proYearData"/> -->
		<!-- <ReadingBirthResult v-else-if="store.result !== null" :data="store.picked === 'r1'? birthData : yearData"/> -->
		<transition name="fade">
			<TalkBirthResult
				v-if="store.result !== null && store.picked === 'r1' && store.isTalk"
				:data="proBirthData"
			/>
			<TalkYearResult
				v-else-if="store.result !== null && store.picked === 'r2' && store.isTalk"
				:data="proYearData"
			/>

			<ProBirthResult
				v-else-if="store.result !== null && store.picked === 'r1' && !store.isReading"
				:data="proBirthData"
			/>
			<ReadingBirthResult
				v-else-if="store.result !== null && store.picked === 'r1' && store.isReading"
				:data="birthData"
			/>

			<ProYearResult
				v-else-if="store.result !== null && store.picked === 'r2' && !store.isReading"
				:data="proYearData"
			/>
			<ReadingYearResult
				v-else-if="store.result !== null && store.picked === 'r2' && store.isReading"
				:data="yearData"
			/>
		</transition>

	</div>
	<!-- 마스터/프로 전용 위키 플로팅 버튼 -->
	<div v-if="['마스터', '프로'].includes(store.userGrade)" class="wiki-floating-btn" @click="store.goToWikiMain">
		<span>Wiki→</span>
	</div>		
	<!-- <div v-if="['마스터', '프로'].includes(store.userGrade)" class="floating_app web_only" @click="appPop.open()">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="22" height="22">
			<path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C14.15 1.23 13.11 1 12 1c-1.11 0-2.15.23-3.09.63L7.43.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.3 1.3C6.55 3.07 5.55 4.51 5.55 6H18.45c0-1.49-1-2.93-2.92-3.84zM10 4H9V3h1v1zm5 0h-1V3h1v1z"/>
		</svg>
		<span>앱 출시</span>
	</div> -->

	<!-- 앱 출시 팝업 컴포넌트 -->
	<AppLaunchPop ref="appPop" :sub-status="popSubStatus" @action="fnPopAction" />


	<!-- 약관 레이어 팝업 -->
	<LegalModal :show="legalModal.show" :type="legalModal.type" @close="legalModal.show = false" />

	<!-- 내정보 모달 -->
	<Transition name="m_fade">
		<div v-if="showProfileModal" class="modal myinfo_modal" @click="closeProfileModal">
			<div class="m_container" @click.stop>
				<div class="m_header">
					<h2 class="m_title">내정보</h2>
					<button type="button" class="btn_close" @click="closeProfileModal">✕</button>
				</div>
				<div class="m_body">
					<!-- 보기 모드 -->
					<template v-if="!editMode">
						<ul class="info_list">
							<li class="info_row">
								<span class="info_label">이메일</span>
								<span class="info_val">{{ store.user?.email || '' }}</span>
							</li>
							<li class="info_row">
								<span class="info_label">이름</span>
								<span class="info_val">{{ store.user?.name || '' }}</span>
							</li>
							<li class="info_row">
								<span class="info_label">핸드폰</span>
								<span class="info_val">{{ store.user?.phone || '-' }}</span>
							</li>
							<li class="info_row">
								<span class="info_label">상호명</span>
								<span class="info_val">{{ store.userCorpName || '-' }}</span>
							</li>
						</ul>
						<button type="button" class="btn_edit" @click="editMode = true">내정보 수정</button>
					</template>
					<!-- 수정 모드 -->
					<template v-else>
						<ul class="info_list">
							<li class="info_row">
								<span class="info_label">이메일</span>
								<span class="info_val">{{ store.user?.email || '' }}</span>
							</li>
							<li class="info_row">
								<span class="info_label">이름</span>
								<span class="info_val">{{ store.user?.name || '' }}</span>
							</li>
							<li class="info_row">
								<span class="info_label">핸드폰</span>
								<input type="tel" class="ipt" v-model="editPhone" placeholder="010-0000-0000" />
							</li>
							<li class="info_row">
								<span class="info_label">상호명</span>
								<input type="text" class="ipt" v-model="editCorpName" placeholder="상호명을 입력하세요" />
							</li>
						</ul>
						<div class="edit_btns">
							<button type="button" class="btn_save" @click="saveProfile" :disabled="profileSaving">{{ profileSaving ? '저장 중...' : '저장' }}</button>
							<button type="button" class="btn_cancel_edit" @click="editMode = false">취소</button>
						</div>
					</template>
					<!-- 구독 정보 -->
					<div class="sub_info_bx">
						<template v-if="popSubStatus.isActive">
							<strong class="sub_tit">{{ popSubStatus.isTrial ? '체험 정보' : '구독 정보' }}</strong>
							<div class="sub_row">
								<span class="sub_badge" :class="popSubStatus.isTrial ? 'trial' : 'active'">{{ popSubStatus.isTrial ? '체험 중' : '정기 구독 중' }}</span>
								<span class="sub_expiry">{{ popSubStatus.isTrial ? '체험 종료일' : (popSubStatus.isCancelled ? '이용 가능 기간' : '다음 결제일') }} {{ popSubStatus.expiryText }}</span>
							</div>
							<p v-if="popSubStatus.isCancelled" class="sub_note">{{ popSubStatus.isTrial ? '체험 취소됨' : '해지 신청됨' }} · 만료일까지 이용 가능합니다</p>
							<p v-else-if="popSubStatus.isTrial" class="sub_note">체험 종료 후 월 3,900원 자동 결제</p>
							<button v-if="!popSubStatus.isCancelled" type="button" class="btn_sub_cancel" @click="fnPopCancelSub">{{ popSubStatus.isTrial ? '체험 취소' : '구독 해지' }}</button>
						</template>
						<template v-else>
							<button type="button" class="btn_sub_start" @click="fnPopSubscribe">{{ popSubStatus.trialUsed ? '앱 구독하기' : '1일 무료체험 후 앱 구독하기' }}</button>
						</template>
					</div>
					<!-- 약관 링크 -->
					<div class="legal_links">
						<button type="button" class="link_legal" @click="openLegal('terms')">이용약관</button>
						<span class="divider">·</span>
						<button type="button" class="link_legal" @click="openLegal('privacy')">개인정보처리방침</button>
					</div>
					<!-- 회원 탈퇴 -->
					<div class="withdraw_area">
						<button type="button" class="btn_withdraw" @click="openWithdrawModal">회원 탈퇴</button>
					</div>
				</div>
			</div>
		</div>
	</Transition>

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
							class="ipt ipt_pw"
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
	//Store
	import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
	import { useTarotStore } from '~/stores/tarot';	import { doc, getDoc } from 'firebase/firestore';

	const store = useTarotStore();
	// 데이터 가져오기 (GET)
	const { data: proBirthData } = await useFetch('/data/pro_birth.json');
	const { data: proYearData } = await useFetch('/data/pro_year.json');
	const { data: birthData } = await useFetch('/data/birth.json');
	const { data: yearData } = await useFetch('/data/year.json');

	// 유저 메뉴 토글
	const isUserMenuOpen = ref(false);

	// 약관 레이어 팝업
	const legalModal = ref({ show: false, type: 'terms' });
	const openLegal = (type) => {
		isUserMenuOpen.value = false;
		showProfileModal.value = false;
		editMode.value = false;
		legalModal.value = { show: true, type };
	};

	// 유저 이름 (Firestore에서 가져온 이름)
	const userName = computed(() => {
		return store.user?.name || '사용자';
	});

	// 회원 등급에 따른 클래스
	const gradeClass = computed(() => {
		const grade = store.userGrade;
		if (grade === '마스터') return 'master';
		if (grade === '프로') return 'pro';
		return 'normal';
	});

	// 바깥 클릭 시 유저 메뉴 닫기
	const closeUserMenu = (e) => {
		if (!e.target.closest('.user_menu')) {
			isUserMenuOpen.value = false;
		}
	};

	// 앱에서 로그아웃 메시지 수신 처리
	const handleAppMessage = async (event) => {
		try {
			const data = JSON.parse(event.data)
			if (data.login === false) {
				await store.fnLogout()
			}
		} catch {
			// JSON 파싱 실패 시 무시
		}
	}

	onMounted(() => {
		// 바깥 클릭 이벤트 등록
		document.addEventListener('click', closeUserMenu);
		// 앱 → 웹뷰 메시지 수신
		window.addEventListener('message', handleAppMessage);
	});

	onUnmounted(() => {
		document.removeEventListener('click', closeUserMenu);
		window.removeEventListener('message', handleAppMessage);
	});

	// 내정보 모달
	const showProfileModal = ref(false);
	const editMode = ref(false);
	const editPhone = ref('');
	const editCorpName = ref('');
	const profileSaving = ref(false);

	const openProfileModal = () => {
		isUserMenuOpen.value = false;
		editPhone.value = store.user?.phone || '';
		editCorpName.value = store.userCorpName || '';
		editMode.value = false;
		showProfileModal.value = true;
	};

	const closeProfileModal = () => {
		showProfileModal.value = false;
		editMode.value = false;
	};

	const saveProfile = async () => {
		profileSaving.value = true;
		const result = await store.updateMyProfile({
			phone: editPhone.value,
			corpName: editCorpName.value
		});
		profileSaving.value = false;

		if (result.success) {
			editMode.value = false;
			store.showAlert({ title: '저장 완료', message: '내정보가 수정되었습니다.', icon: '✅' });
		} else {
			store.showAlert({ title: '저장 실패', message: result.error || '다시 시도해주세요.', icon: '❌' });
		}
	};
	// ── 앱 출시 팝업 & 구독 ──────────────────────────────────
	const appPop = ref(null);
	const popSubscribing = ref(false);
	const popCancelling = ref(false);
	const popSubData = ref({ isSubscribed: false, subscriptionExpiry: null, subscriptionCancelled: false, isTrial: false, trialUsed: false });

	const popSubStatus = computed(() => {
		const now = new Date();
		const expiry = popSubData.value.subscriptionExpiry ? new Date(popSubData.value.subscriptionExpiry) : null;
		const isActive = popSubData.value.isSubscribed && expiry && expiry > now;
		const expiryText = expiry ? `${expiry.getFullYear()}년 ${expiry.getMonth() + 1}월 ${expiry.getDate()}일` : '';
		return { isActive, expiryText, isCancelled: popSubData.value.subscriptionCancelled || false, isTrial: popSubData.value.isTrial || false, trialUsed: popSubData.value.trialUsed || false };
	});

	const fetchSubData = async () => {
		if (store.user?.uid) {
			try {
				const { $db } = useNuxtApp();
				const snap = await getDoc(doc($db, 'users', store.user.uid));
				if (snap.exists()) {
					const d = snap.data();
					popSubData.value = {
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
		} else {
			popSubData.value = { isSubscribed: false, subscriptionExpiry: null, subscriptionCancelled: false };
		}
	};

	watch(() => store.user, fetchSubData, { immediate: true });

	// 인증 확인 완료 후 앱(WebView)으로 로그인 상태 전송
	watch(() => store.authChecked, async (checked) => {
		if (!checked) return
		if (store.isLoggedIn) {
			await fetchSubData()
			window.ReactNativeWebView?.postMessage(JSON.stringify({
				type: 'auth',
				login: true,
				uid: store.user?.uid || '',
				email: store.user?.email || '',
				token: store.token || '',
				name: store.user?.name || '',
				isSubscribed: popSubData.value.isSubscribed,
				subscriptionExpiry: popSubData.value.subscriptionExpiry,
				subscriptionCancelled: popSubData.value.subscriptionCancelled,
				isTrial: popSubData.value.isTrial,
			}))
		} else {
			// 비로그인 상태 → 앱에 로그인 안 된 상태 전달
			window.ReactNativeWebView?.postMessage(JSON.stringify({ login: false }))
		}
	}, { immediate: true });

	const fnPopAction = () => {
		if (popSubStatus.value.isActive) {
			navigateTo('/app/my');
		} else {
			fnPopSubscribe();
		}
	};

	const fnPopSubscribe = async () => {
		if (popSubscribing.value) return;
		popSubscribing.value = true;
		try {
			const cfg = useRuntimeConfig();
			const clientKey = cfg.public.tossClientKey;
			if (!window.TossPayments) {
				store.showAlert({ message: '결제 모듈 로딩 중입니다. 잠시 후 다시 시도해주세요.', icon: '⏳' });
				return;
			}
			const tossPayments = window.TossPayments(clientKey);
			const isTrial = !popSubStatus.value.trialUsed;
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
			popSubscribing.value = false;
		}
	};

	const fnPopCancelSub = () => {
		const isTrial = popSubStatus.value.isTrial;
		store.showConfirm({
			title: isTrial ? '체험 취소' : '구독 해지',
			message: isTrial
				? '무료 체험을 취소하시겠습니까?\n만료일까지는 계속 이용 가능합니다.'
				: '정말 구독을 해지하시겠습니까?\n\n해지 즉시 자동 결제가 중단되며,\n현재 만료일까지는 앱을 계속 이용하실 수 있습니다.\n만료일 이후에는 앱 기능이 제한됩니다.',
			icon: '⚠️',
			confirmText: isTrial ? '취소하기' : '해지하기',
			cancelText: '닫기',
			onConfirm: async () => {
				popCancelling.value = true;
				try {
					const cfg = useRuntimeConfig();
					const res = await fetch(`${cfg.public.workerUrl}/api/billing/cancel`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ uid: store.user.uid, customerKey: store.user.uid }),
					});
					if (res.ok) {
						popSubData.value.subscriptionCancelled = true;
						store.showAlert({ message: isTrial ? '체험이 취소되었습니다.\n만료일까지 이용 가능합니다.' : '구독이 취소되었습니다.\n만료일까지 이용 가능합니다.', icon: '✅' });
					} else {
						store.showAlert({ message: '취소 처리 중 오류가 발생했습니다.', icon: '❌' });
					}
				} catch {
					store.showAlert({ message: '취소 처리 중 오류가 발생했습니다.', icon: '❌' });
				} finally {
					popCancelling.value = false;
				}
			}
		});
	};


	// 회원 탈퇴 모달
	const showWithdrawModal = ref(false);
	const withdrawPassword = ref('');
	const withdrawError = ref('');
	const isWithdrawing = ref(false);

	const openWithdrawModal = () => {
		showProfileModal.value = false;
		withdrawPassword.value = '';
		withdrawError.value = '';
		showWithdrawModal.value = true;
	};

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

	// 로그아웃 모달 표시
	const showLogoutModal = () => {
		isUserMenuOpen.value = false;
		store.showConfirm({
			title: '운명의 길을 닫으시겠습니까?',
			icon: '🌙',
			confirmText: '로그아웃',
			cancelText: '취소',
			onConfirm: () => {
				store.fnLogout();
			}
		});
	};
</script>

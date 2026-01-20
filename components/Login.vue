<template>
	<div class="login">
		<div class="l_wrap">
			<div class="icon">🔮</div>
			<p class="l_logo">numerologyTarot</p>
			<Transition name="l_fade" mode="out-in">
				<h2 class="tit" :key="currentMode">{{ modeTitle }}</h2>
			</Transition>

			<!-- 이메일 인증 안내 화면 -->
			<Transition name="l_fade" mode="out-in">
				<div v-if="store.pendingVerificationEmail" class="verification_notice" key="verification">
					<p class="notice_icon">✉️</p>
					<p class="notice_tit">인증 메일을 발송했습니다</p>
					<p class="txt_notice">{{ store.pendingVerificationEmail }}로 전송된 인증 링크를 클릭해주세요.</p>
					<p class="txt_alert">메일이 보이지 않으면 스팸함을 확인해주세요.</p>
					<button class="btn" @click="goToLogin">로그인하러 가기</button>
				</div>

				<!-- 비밀번호 찾기 폼 -->
				<div v-else-if="isForgotPassword" key="forgot">
					<div class="l_form">
						<input class="ipt" v-model="email" type="email" placeholder="이메일" @keyup.enter="handleResetPassword" />
						<button class="btn" @click="handleResetPassword" :disabled="store.authLoading">
							{{ store.authLoading ? '처리 중...' : '비밀번호 재설정 메일 발송' }}
						</button>
					</div>
					<div class="bx_member">
						<button class="link_member" @click="goToLogin">로그인으로 돌아가기</button>
					</div>
				</div>

				<!-- 로그인/회원가입 폼 -->
				<div v-else :key="isSignUp ? 'signup' : 'login'">
					<div class="l_form">
						<input class="ipt" v-model="email" type="email" placeholder="이메일" @keyup.enter="handleSubmit" />
						<div class="ipt_pw_wrap">
							<input class="ipt" v-model="pw" :type="showPw ? 'text' : 'password'" placeholder="비밀번호" @keyup.enter="handleSubmit" />
							<button type="button" class="btn_eye" :class="{ on: showPw }" @click="showPw = !showPw" tabindex="-1"></button>
						</div>
						<div v-if="isSignUp" class="ipt_pw_wrap">
							<input class="ipt" v-model="pwConfirm" :type="showPwConfirm ? 'text' : 'password'" placeholder="비밀번호 확인" @keyup.enter="handleSubmit" />
							<button type="button" class="btn_eye" :class="{ on: showPwConfirm }" @click="showPwConfirm = !showPwConfirm" tabindex="-1"></button>
						</div>
						<input v-if="isSignUp" class="ipt" v-model="userName" type="text" placeholder="이름" @keyup.enter="handleSubmit" />
						<input v-if="isSignUp" class="ipt" v-model="userPhone" type="tel" placeholder="연락처 (010-0000-0000)" @keyup.enter="handleSubmit" />
						<div v-if="isSignUp" ref="slctRef" class="slct" :class="{ on: isSlctOpen, selected: isStartup }">
							<button type="button" class="slct_tit" @click="isSlctOpen = !isSlctOpen">
								{{ isStartup || '창업반' }}
							</button>
							<div class="slct_cont">
								<button type="button" @click="selectStartup('Y')">Y</button>
								<button type="button" @click="selectStartup('N')">N</button>
							</div>
						</div>
						<button class="btn" @click="handleSubmit" :disabled="store.authLoading">
							{{ store.authLoading ? '처리 중...' : (isSignUp ? '가입하기' : '운명 확인하기') }}
						</button>
					</div>
					<div v-if="isSignUp" class="bx_member">
						<span>이미 계정이 있으신가요?</span> <button class="link_member" @click="toggleMode">로그인</button>
					</div>
					<div v-else class="bx_member">
						<span>계정이 없으신가요?</span> <button class="link_member" @click="toggleMode">회원가입</button>
						<span class="divider">|</span>
						<button class="link_member" @click="goToForgotPassword">비밀번호 찾기</button>
					</div>
				</div>
			</Transition>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useTarotStore } from '~/stores/tarot';

const store = useTarotStore();
const slctRef = ref(null);

const email = ref('');
const pw = ref('');
const pwConfirm = ref('');
const userName = ref('');
const userPhone = ref('');
const isStartup = ref('');
const isSlctOpen = ref(false);
const isSignUp = ref(false);
const isForgotPassword = ref(false);
const showPw = ref(false);
const showPwConfirm = ref(false);

const currentMode = computed(() => {
	if (isForgotPassword.value) return 'forgot';
	return isSignUp.value ? 'signup' : 'login';
});

const modeTitle = computed(() => {
	if (isForgotPassword.value) return 'Reset Password';
	return isSignUp.value ? 'Join' : 'Login';
});

const selectStartup = (value) => {
	isStartup.value = value;
	isSlctOpen.value = false;
};

// 셀렉트 박스 바깥 클릭 시 닫기
const handleClickOutside = (event) => {
	if (slctRef.value && !slctRef.value.contains(event.target)) {
		isSlctOpen.value = false;
	}
};

onMounted(() => {
	document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
	document.removeEventListener('click', handleClickOutside);
});

const toggleMode = () => {
	isSignUp.value = !isSignUp.value;
	pw.value = '';
	pwConfirm.value = '';
	userName.value = '';
	userPhone.value = '';
	isStartup.value = '';
	isSlctOpen.value = false;
	showPw.value = false;
	showPwConfirm.value = false;
};

const goToLogin = () => {
	store.clearPendingVerification();
	isSignUp.value = false;
	isForgotPassword.value = false;
	pw.value = '';
	pwConfirm.value = '';
	userName.value = '';
	userPhone.value = '';
	isStartup.value = '';
	isSlctOpen.value = false;
	showPw.value = false;
	showPwConfirm.value = false;
};

const goToForgotPassword = () => {
	isForgotPassword.value = true;
	pw.value = '';
	pwConfirm.value = '';
};

const handleResetPassword = async () => {
	if (!email.value) {
		store.showAlert({
			title: '',
			message: '이메일을 입력해주세요.',
			icon: '🌙'
		});
		return;
	}

	const result = await store.fnResetPassword(email.value);
	if (result.success) {
		store.showAlert({
			title: '메일 발송 완료',
			message: '비밀번호 재설정 링크를 이메일로 발송했습니다.',
			icon: '✉️'
		});
		goToLogin();
	} else {
		store.showAlert({
			title: '발송 실패',
			message: result.error,
			icon: '🌙'
		});
	}
};

const handleSubmit = async () => {
	if (!email.value || !pw.value) {
		store.showAlert({
			title: '',
			message: '이메일과 비밀번호를 입력해주세요.',
			icon: '🌙'
		});
		return;
	}

	if (isSignUp.value) {
		// 회원가입
		if (!userName.value || !userPhone.value || !isStartup.value) {
			store.showAlert({
				title: '',
				message: '모든 항목을 입력해주세요.',
				icon: '🌙'
			});
			return;
		}

		// 전화번호 형식 검증 (010-0000-0000)
		const phoneRegex = /^01[0-9]-[0-9]{4}-[0-9]{4}$/;
		if (!phoneRegex.test(userPhone.value)) {
			store.showAlert({
				title: '',
				message: '연락처 형식을 확인해주세요. (010-0000-0000)',
				icon: '🌙'
			});
			return;
		}

		if (pw.value !== pwConfirm.value) {
			store.showAlert({
				title: '',
				message: '비밀번호가 일치하지 않습니다.',
				icon: '🌙'
			});
			return;
		}

		const result = await store.fnSignUp(email.value, pw.value, userName.value, userPhone.value, isStartup.value);
		if (!result.success) {
			store.showAlert({
				title: '회원가입 실패',
				message: result.error,
				icon: '🌙'
			});
		}
		// 성공 시 store.pendingVerificationEmail이 설정되어 자동으로 안내 화면 표시
	} else {
		// 로그인
		const result = await store.fnLogin(email.value, pw.value);
		if (!result.success) {
			let title = '로그인 실패';
			let icon = '🌙';
			if (result.needVerification) {
				title = '이메일 인증 필요';
				icon = '✉️';
			} else if (result.needApproval) {
				title = '승인 대기';
				icon = '⏳';
			}
			store.showAlert({
				title,
				message: result.error,
				icon
			});
			pw.value = '';
		}
	}
};
</script>

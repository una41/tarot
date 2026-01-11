import { defineStore } from 'pinia'
import Cookies from 'js-cookie';

export const useTarotStore = defineStore('tarot', {
	state: () => ({
		ipt_birth8: '',
		ipt_birth4: '',
		ipt_year: '',
		result: null,
		// y_result: null,
		calc: ['', '', ''],
		y_calc: ['', '', ''],
		picked: 'r1',
        isReading: false,
		radio: [
			{ text: '생일카드', id: 'r1' },
			{ text: '해운카드', id: 'r2' },
		],
        // 관리자 확인을 위한 임시 계정 정보 (Base64 인코딩)
        // ID: admin -> 'YWRtaW4='
        // PW: tarot123! -> 'dGFyb3QxMjMh'
        adminUser: {
            account: 'YWRtaW4=', 
            secret: 'dGFyb3QxMjMh' 
        },
        user: null,
        isLoggedIn: false,
        token: null,
        // --- 커스텀 모달 상태 추가 ---
        alertData: {
            isVisible: false,
            title: '',
            message: '',
            icon: '🔮',
            confirmText: '확인'
        },
        confirmData: {
            isVisible: false,
            title: '',
            message: '',
            icon: '🔮',
            confirmText: '확인',
            cancelText: '취소',
            onConfirm: null,
            onCancel: null
        }
	}),
	actions: {
        setReading(status) {
            this.isReading = status
        },
        
        // 페이지 이동 함수 추가
        fnGo(data) {
            // 이 함수가 컴포넌트 내부가 아니므로 useRouter() 대신 
            // 프로젝트 설정에 맞는 라우터 이동 방식을 사용합니다.
            // Nuxt라면 바로 navigateTo(`/${pathName}`) 등을 사용할 수 있습니다.
            data == 'result' ? this.setReading(false) : this.setReading(true);
        },
        fnBirthCalc() {
            this.calc = ['', '', ''];
            if (/[^0-9]/.test(this.ipt_birth8)) {
                this.showAlert({
                    message: '숫자만 입력해주세요!',
                    icon: '🔮'
                });
                this.ipt_birth8 = "";
                return;
            }
            if (this.ipt_birth8.length !== 8) {
                this.showAlert({
                    message: '생년월일 8자리를 정확히 입력해주세요 (예: 19900219)',
                    icon: '🔮'
                });
                return;
            }
            const digits = this.ipt_birth8.split('');
            let sum = digits.reduce((acc, curr) => acc + Number(curr), 0);
            this.calc[0] = digits.join(' + ');
            if (sum > 21) {
                this.calc[1] = sum;
                const temp = sum.toString().split('');
                sum = temp.reduce((acc, curr) => acc + Number(curr), 0);
                this.calc[2] = temp.join(' + ');
            }
            this.result = sum;
        },
        fnComingSoon() {
            this.showAlert({
                message: '현재 준비 중인 서비스입니다.',
                icon: '😊'
            });
        },
        fnYearCalc() {
            this.calc = ['', '', ''];
            if (/[^0-9]/.test(this.ipt_year) || /[^0-9]/.test(this.ipt_birth4)) {
                this.showAlert({
                    message: '숫자만 입력해주세요!',
                    icon: '🔮'
                });
                if (/[^0-9]/.test(this.ipt_year)) this.ipt_year = "";
                if (/[^0-9]/.test(this.ipt_birth4)) this.ipt_birth4 = "";
                return;
            }
            if (this.ipt_year.length !== 4) {
                this.showAlert({
                    message: '연도 4자리를 정확히 입력해주세요 (예: 1999)',
                    icon: '🔮'
                });
                this.ipt_year = "";
                return;
            }
            if (this.ipt_birth4.length !== 4) {
                this.showAlert({
                    message: '생일 4자리를 정확히 입력해주세요 (예: 0130)',
                    icon: '🔮'
                });
                this.ipt_birth4 = "";
                return;
            }
            // 3. 연도, 월, 일 분리 및 1차 합산
            const year = Number(this.ipt_year);
            const month = Number(this.ipt_birth4.substring(0, 2)); // 앞 2자리 (월)
            const day = Number(this.ipt_birth4.substring(2, 4));   // 뒤 2자리 (일)
            
            const i_sum = year + month + day; // 예: 2026 + 12 + 24 = 2062
            // 계산 과정 저장 (화면 표시용)
            this.y_calc[0] = `${year} + ${month} + ${day} = ${i_sum}`;
            // 4. 결과값의 각 자릿수 더하기 (2차 합산)
            const digits = i_sum.toString().split(''); // ['2', '0', '6', '2']
            let sum = digits.reduce((acc, curr) => acc + Number(curr), 0);
            this.y_calc[1] = digits.join(' + '); // "2 + 0 + 6 + 2"
            
            if (sum > 21) {
                this.y_calc[1] = sum;
                const temp = sum.toString().split('');
                sum = temp.reduce((acc, curr) => acc + Number(curr), 0);
                this.y_calc[2] = temp.join(' + ');
				if(sum == 22) sum = 0;
            }
            this.result = sum;
        },

        fnReset() {
            this.ipt_birth8 = '';
            this.ipt_birth4 = '';
            this.ipt_year = '';
            this.result = null;
            // this.y_result = null;
            this.calc = ['', '', ''];
            this.y_calc = ['', '', ''];
        },

        fnClose() {
            this.fnReset();
        },
        
        // 1. 실제 로그인 처리 (상태 변경 + 쿠키 저장)
        loginProcess(userData, token) {
            this.user = userData;
            this.token = token;
            this.isLoggedIn = true;

            // 쿠키 저장 (7일 유지)
            Cookies.set('user_token', token, { expires: 7 });
            Cookies.set('user_info', JSON.stringify(userData), { expires: 7 });
        },

        // 2. 관리자 로그인 시도 함수
        fnLogin(id, pw) {
            const encodedId = btoa(id);
            const encodedPw = btoa(pw);

            if (encodedId === this.adminUser.account && encodedPw === this.adminUser.secret) {
                // 로그인 성공 시 세션용 토큰 생성 (여기선 간단히 ID/PW 조합)
                const dummyToken = btoa(`${encodedId}:${encodedPw}`);
                
                const userData = {
                    id: id,
                    role: 'admin',
                    name: '타로 마스터',
                    loginAt: new Date().toLocaleString()
                };

                // 통합된 로그인 처리 함수 호출
                this.loginProcess(userData, dummyToken);
                return true;
            }
            return false;
        },

        // 3. 로그아웃 (상태 초기화 + 쿠키 삭제)
        fnLogout() {
            this.user = null;
            this.token = null;
            this.isLoggedIn = false;

            Cookies.remove('user_token');
            Cookies.remove('user_info');
        },

        // 4. 인증 체크 (새로고침 시 호출)
        checkAuth() {
            const token = Cookies.get('user_token');
            const userInfo = Cookies.get('user_info');

            if (token && userInfo) {
                try {
                    this.token = token;
                    this.user = JSON.parse(userInfo);
                    this.isLoggedIn = true;
                } catch (error) {
                    console.error('쿠키 파싱 오류:', error);
                    this.fnLogout();
                }
            } else {
                this.fnLogout();
            }
        },

        // 5. Alert 모달 제어
        showAlert(options = {}) {
            this.alertData = {
                isVisible: true,
                title: options.title || '',
                message: options.message || '',
                icon: options.icon || '🔮',
                confirmText: options.confirmText || '확인'
            };
        },

        closeAlert() {
            this.alertData.isVisible = false;
        },

        // 6. Confirm 모달 제어
        showConfirm(options = {}) {
            this.confirmData = {
                isVisible: true,
                title: options.title || '',
                message: options.message || '',
                icon: options.icon || '🔮',
                confirmText: options.confirmText || '확인',
                cancelText: options.cancelText || '취소',
                onConfirm: options.onConfirm || null,
                onCancel: options.onCancel || null
            };
        },

        handleConfirm() {
            if (this.confirmData.onConfirm) {
                this.confirmData.onConfirm();
            }
            this.closeConfirm();
        },

        handleCancel() {
            if (this.confirmData.onCancel) {
                this.confirmData.onCancel();
            }
            this.closeConfirm();
        },

        closeConfirm() {
            this.confirmData.isVisible = false;
        },
	}
})
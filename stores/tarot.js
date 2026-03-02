import { defineStore } from 'pinia'
import Cookies from 'js-cookie';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { encryptPhone, decryptPhone, encryptData, decryptData } from '~/utils/phoneEncrypt';

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
        isTalk: false,
		radio: [
			{ text: '생일카드', id: 'r1' },
			{ text: '해운카드', id: 'r2' },
		],
        // [임시 계정 - Firebase 연동 전 사용]
        // 관리자 확인을 위한 임시 계정 정보 (Base64 인코딩)
        // ID: admin -> 'YWRtaW4='
        // PW: tarot123! -> 'dGFyb3QxMjMh'
        // adminUser: {
        //     account: 'YWRtaW4=',
        //     secret: 'dGFyb3QxMjMh'
        // },

        // Firebase 인증 상태
        user: null,
        userGrade: null, // 회원 등급 (일반, 프로, 마스터)
        userCorpName: '', // 상호명
        isLeading: false, // leading 컬렉션에 이메일 존재 여부
        isLoggedIn: false,
        token: null,
        authLoading: false, // 인증 처리 중 로딩 상태
        authChecked: false, // 인증 상태 확인 완료 여부
        pendingVerificationEmail: null, // 이메일 인증 대기 중인 이메일
        // --- 커스텀 모달 상태 추가 ---
        alertData: {
            isVisible: false,
            title: '',
            message: '',
            icon: '🔮',
            confirmText: '확인',
            type: '' // 'success' | 'error' | ''
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
        },
        // --- 글로벌 로딩 상태 ---
        loader: {
            isAppLoading: true,    // 앱 초기 로딩
            isPdfLoading: false,   // PDF 생성 로딩
        },
        // --- 구독 상태 ---
        subscription: {
            isSubscribed: false,
            subscriptionExpiry: null,
            isTrial: false,
            trialUsed: false,
            subscriptionCancelled: false,
        },
        subscriptionLoaded: false,
        // 페이월에서 '서비스 이용하기' 클릭 후 세션 내 재진입 여부
        paywallAccepted: false,
	}),
	actions: {
        setReading(status) {
            this.isReading = status;
            if (status) this.isTalk = false;
        },

        // 페이지 이동 함수 추가
        fnGo(data) {
            this.isReading = (data === 'reading');
            this.isTalk = (data === 'talk');
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
        
        // [임시 계정용 로그인 - Firebase 연동 전 사용]
        // // 1. 실제 로그인 처리 (상태 변경 + 쿠키 저장)
        // loginProcess(userData, token) {
        //     this.user = userData;
        //     this.token = token;
        //     this.isLoggedIn = true;
        //     Cookies.set('user_token', token);
        //     Cookies.set('user_info', JSON.stringify(userData));
        // },
        //
        // // 2. 관리자 로그인 시도 함수
        // fnLogin(id, pw) {
        //     const encodedId = btoa(id);
        //     const encodedPw = btoa(pw);
        //     if (encodedId === this.adminUser.account && encodedPw === this.adminUser.secret) {
        //         const dummyToken = btoa(`${encodedId}:${encodedPw}`);
        //         const userData = {
        //             id: id,
        //             role: 'admin',
        //             name: '타로 마스터',
        //             loginAt: new Date().toLocaleString()
        //         };
        //         this.loginProcess(userData, dummyToken);
        //         return true;
        //     }
        //     return false;
        // },

        // ========== Firebase 인증 함수 ==========

        // 1. Firebase 회원가입 (이메일 인증 포함)
        async fnSignUp(email, password, userName, userPhone, userCorpName = '') {
            const { $auth, $db } = useNuxtApp();
            const config = useRuntimeConfig();
            const cryptoKey = config.public.cryptoKey;
            this.authLoading = true;

            // 먼저 pendingVerificationEmail 설정 (onAuthStateChanged에서 무시하도록)
            this.pendingVerificationEmail = email;

            try {
                // 1. Firebase Auth에 계정 생성
                const userCredential = await createUserWithEmailAndPassword($auth, email, password);
                const user = userCredential.user;

                // 2. 이메일 인증 발송
                await sendEmailVerification(user);

                // 3. Firestore에 초기 권한 정보 저장 (핵심 로직)
                await setDoc(doc($db, 'users', user.uid), {
                    email: email,
                    name: await encryptData(userName, cryptoKey),
                    phone: await encryptPhone(userPhone, cryptoKey),
                    corpName: userCorpName || '',
                    isApproved: false, // 기본값: 승인 대기
                    grade: '일반',      // 기본값: 일반 등급 일반, 프로, 마스터
                    createdAt: new Date()
                });

                // 4. 자동 로그인 상태 해제 (가입 후 자동 로그인 방지)
                await signOut($auth);

                return { success: true };

            } catch (error) {
                console.error("가입 에러 상세:", error.code);
                this.pendingVerificationEmail = null; // 실패 시 초기화
                return { success: false, error: this.getFirebaseErrorMessage(error.code) };
            } finally {
                this.authLoading = false;
            }
        },

        // 인증 안내 화면 닫기
        clearPendingVerification() {
            this.pendingVerificationEmail = null;
        },

        // 인증 이메일 재발송
        async fnResendVerification() {
            const { $auth } = useNuxtApp();
            const user = $auth.currentUser;
            if (user && !user.emailVerified) {
                try {
                    await sendEmailVerification(user);
                    return { success: true };
                } catch (error) {
                    return { success: false, error: this.getFirebaseErrorMessage(error.code) };
                }
            }
            return { success: false, error: '재발송할 수 없습니다.' };
        },

        // 비밀번호 재설정 이메일 발송
        async fnResetPassword(email) {
            const { $auth } = useNuxtApp();
            this.authLoading = true;
            try {
                await sendPasswordResetEmail($auth, email);
                this.authLoading = false;
                return { success: true };
            } catch (error) {
                this.authLoading = false;
                return { success: false, error: this.getFirebaseErrorMessage(error.code) };
            }
        },

        // 2. Firebase 로그인 (이메일 인증 + 승인 확인)
        async fnLogin(email, password) {
            const { $auth, $db } = useNuxtApp();
            const config = useRuntimeConfig();
            const cryptoKey = config.public.cryptoKey;
            this.authLoading = true;
            try {
                const userCredential = await signInWithEmailAndPassword($auth, email, password);
                const user = userCredential.user;

                // 1. 이메일 인증 확인
                if (!user.emailVerified) {
                    await signOut($auth);
                    this.authLoading = false;
                    return { success: false, needVerification: true, error: '이메일 인증이 필요합니다. 메일함을 확인해주세요.' };
                }

                // 2. Firestore에서 승인 여부 확인
                const userDoc = await getDoc(doc($db, 'users', user.uid));
                if (!userDoc.exists()) {
                    await signOut($auth);
                    this.authLoading = false;
                    return { success: false, error: '사용자 정보를 찾을 수 없습니다.' };
                }

                const userData = userDoc.data();

                // 탈퇴 완료 회원
                if (userData.withdrawn) {
                    await signOut($auth);
                    this.authLoading = false;
                    return { success: false, error: '탈퇴한 회원입니다.' };
                }

                // 탈퇴 요청 중인 회원
                if (userData.withdrawalRequested) {
                    await signOut($auth);
                    this.authLoading = false;
                    return { success: false, error: '탈퇴를 요청하여 로그인이 불가합니다.' };
                }

                if (!userData.isApproved) {
                    await signOut($auth);
                    this.authLoading = false;
                    return { success: false, needApproval: true, error: '관리자 승인 대기 중입니다. 승인 후 이용 가능합니다.' };
                }

                // 3. 모든 조건 통과 시 로그인 처리
                this.user = {
                    uid: user.uid,
                    email: user.email,
                    name: await decryptData(userData.name, cryptoKey),
                    phone: await decryptPhone(userData.phone, cryptoKey),
                    emailVerified: user.emailVerified,
                    loginAt: new Date().toLocaleString()
                };
                this.userGrade = userData.grade || '일반';
                this.userCorpName = userData.corpName || '';
                this.token = await user.getIdToken();
                this.isLoggedIn = true;

                // 쿠키 저장 (1일간 유지)
                Cookies.set('user_token', this.token, { expires: 1 });
                Cookies.set('user_info', JSON.stringify(this.user), { expires: 1 });
                Cookies.set('user_grade', this.userGrade, { expires: 1 });
                Cookies.set('user_corp', this.userCorpName, { expires: 1 });

                // leading 컬렉션 체크
                this.checkLeading(user.email);

                // 로그인 성공 시 로더 표시 (메인 페이지 로드 동안)
                this.setAppLoading(true);
                setTimeout(() => {
                    this.setAppLoading(false);
                }, 600);

                this.authLoading = false;
                return { success: true };
            } catch (error) {
                this.authLoading = false;
                return { success: false, error: this.getFirebaseErrorMessage(error.code) };
            }
        },

        // 3. Firebase 로그아웃
        async fnLogout() {
            const { $auth } = useNuxtApp();
            try {
                await signOut($auth);
            } catch (error) {
                console.error('로그아웃 오류:', error);
            }
            this.user = null;
            this.userGrade = null;
            this.userCorpName = '';
            this.isLeading = false;
            this.token = null;
            this.isLoggedIn = false;
            Cookies.remove('user_token');
            Cookies.remove('user_info');
            Cookies.remove('user_grade');
            Cookies.remove('user_corp');
        },

        // 4. 회원 탈퇴 요청 (관리자 승인 후 처리)
        async fnWithdraw(password) {
            const { $auth } = useNuxtApp();
            const config = useRuntimeConfig();
            try {
                const { EmailAuthProvider, reauthenticateWithCredential } = await import('firebase/auth');

                const user = $auth.currentUser;
                if (!user) return { success: false, error: '로그인 정보를 찾을 수 없습니다.' };

                // 비밀번호 재인증
                const credential = EmailAuthProvider.credential(user.email, password);
                await reauthenticateWithCredential(user, credential);

                // Worker에 탈퇴 요청 (Firestore 플래그 설정 + 관리자 이메일 발송)
                const res = await fetch(`${config.public.workerUrl}/api/withdrawal/request`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        uid: user.uid,
                        name: this.user?.name || '',
                        email: user.email,
                    }),
                });

                if (!res.ok) {
                    return { success: false, error: '탈퇴 요청 처리 중 오류가 발생했습니다.' };
                }

                // 로그아웃 처리
                this.resetAndClear();
                return { success: true };
            } catch (error) {
                if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                    return { success: false, error: '비밀번호가 올바르지 않습니다.' };
                }
                return { success: false, error: '탈퇴 요청 처리 중 오류가 발생했습니다.' };
            }
        },

        // 5. 인증 상태 체크 (앱 시작 시 호출)
       checkAuth() {
            // 1. 서버 사이드 렌더링(SSR) 중에는 실행 방지
            if (!process.client) return;

            const { $auth, $db } = useNuxtApp();
            const config = useRuntimeConfig();
            const cryptoKey = config.public.cryptoKey;

            // URL 쿼리 파라미터에서 인증 정보 복원 (앱 웹뷰 window.open 대응)
            const urlParams = new URLSearchParams(window.location.search);
            const urlToken = urlParams.get('token');
            const urlUser = urlParams.get('user');
            const urlGrade = urlParams.get('grade');
            const urlCorp = urlParams.get('corp');

            if (urlToken) {
                // 쿼리 파라미터로 전달된 인증 정보를 쿠키에 저장
                const cookieOptions = { expires: 1, path: '/' };
                Cookies.set('user_token', urlToken, cookieOptions);
                if (urlUser) {
                    try { Cookies.set('user_info', decodeURIComponent(urlUser), cookieOptions); } catch {}
                }
                if (urlGrade) Cookies.set('user_grade', urlGrade, cookieOptions);
                if (urlCorp) Cookies.set('user_corp', urlCorp, cookieOptions);
            }

            // [변경] 쿠키에서 데이터 가져오기
            const savedToken = Cookies.get('user_token');
            const savedUserInfo = Cookies.get('user_info');
            const savedGrade = Cookies.get('user_grade');
            const savedCorp = Cookies.get('user_corp');

            // 유효성 체크 헬퍼
            const isValid = (val) => val && val !== 'undefined' && val !== 'false' && val !== 'null';

            console.group('🍪 [Auth] 쿠키 복원 프로세스');
            console.log('데이터 확인:', { savedToken: !!savedToken, savedUserInfo: !!savedUserInfo, savedGrade });

            // 2. [즉시 복원] Firebase 응답 전, 쿠키가 있다면 즉시 로그인 상태로 표시
            if (isValid(savedToken) || isValid(savedUserInfo)) {
                try {
                    if (isValid(savedUserInfo)) {
                        this.user = JSON.parse(savedUserInfo);
                    }
                    this.userGrade = isValid(savedGrade) ? savedGrade : '일반';
                    this.userCorpName = isValid(savedCorp) ? savedCorp : '';
                    this.token = savedToken;
                    this.isLoggedIn = true;
                    
                    // 핵심: 쿠키 데이터가 있다면 즉시 true로 설정하여 '검정 화면' 방지
                    this.authChecked = true; 
                    // console.log('✅ [Step 1] 쿠키 데이터로 즉시 복원 성공');
                } catch (e) {
                    console.error('❌ 쿠키 데이터 파싱 실패:', e);
                }
            } else {
                // console.log('ℹ️ 쿠키 데이터 없음: Firebase 인증 대기 중...');
            }
            console.groupEnd();

            // 3. [Firebase 검증] 백그라운드에서 실제 세션 확인
            onAuthStateChanged($auth, async (user) => {
                if (this.pendingVerificationEmail) return;

                if (user) {
                    if (!user.emailVerified) {
                        this.resetAndClear();
                        return;
                    }

                    try {
                        const userDoc = await getDoc(doc($db, 'users', user.uid));
                        if (userDoc.exists()) {
                            const userData = userDoc.data();

                            // 탈퇴 완료 또는 탈퇴 요청 회원 → 강제 로그아웃
                            if (userData.withdrawn || userData.withdrawalRequested) {
                                await signOut($auth);
                                this.resetAndClear();
                                return;
                            }

                            if (!userData.isApproved) {
                                await signOut($auth);
                                this.resetAndClear();
                                return;
                            }

                            // 상태 업데이트
                            this.user = {
                                uid: user.uid,
                                email: user.email,
                                name: await decryptData(userData.name, cryptoKey),
                                phone: await decryptPhone(userData.phone, cryptoKey),
                                emailVerified: user.emailVerified,
                                loginAt: new Date().toLocaleString()
                            };
                            this.userGrade = userData.grade || '일반';
                            this.userCorpName = userData.corpName || '';
                            this.token = await user.getIdToken();
                            this.isLoggedIn = true;
                            // [변경] 쿠키 저장 (path: '/' 필수 설정)
                            const cookieOptions = { expires: 1, path: '/' };
                            Cookies.set('user_token', this.token, cookieOptions);
                            Cookies.set('user_info', JSON.stringify(this.user), cookieOptions);
                            Cookies.set('user_grade', this.userGrade, cookieOptions);
                            Cookies.set('user_corp', this.userCorpName, cookieOptions);

                            // 구독 상태 저장
                            this.subscription = {
                                isSubscribed: userData.isSubscribed || false,
                                subscriptionExpiry: userData.subscriptionExpiry || null,
                                isTrial: userData.isTrial || false,
                                trialUsed: userData.trialUsed || false,
                                subscriptionCancelled: userData.subscriptionCancelled || false,
                            };
                            this.subscriptionLoaded = true;

                            // leading 컬렉션 체크
                            this.checkLeading(user.email);
                        }
                    } catch (error) {
                        console.error('Firestore 확인 오류:', error);
                        this.subscriptionLoaded = true; // 에러 시에도 로드 완료 처리
                    }
                } else {
                    // Firebase: 인증 세션 없음 → 쿠키 복원 상태와 무관하게 Firebase를 신뢰하고 초기화
                    // (쿠키가 남아있어도 Firebase가 null이면 로그아웃 처리)
                    this.resetAndClear();
                }
                
                // 최종적으로 체크 완료 처리
                this.authChecked = true; 
            });
        },
        // 5. Firebase 에러 메시지 변환
        getFirebaseErrorMessage(code) {
            const messages = {
                'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
                'auth/invalid-email': '유효하지 않은 이메일 형식입니다.',
                'auth/operation-not-allowed': '이메일/비밀번호 로그인이 비활성화되어 있습니다.',
                'auth/weak-password': '비밀번호는 6자 이상이어야 합니다.',
                'auth/user-disabled': '비활성화된 계정입니다.',
                'auth/user-not-found': '등록되지 않은 이메일입니다.',
                'auth/wrong-password': '비밀번호가 일치하지 않습니다.',
                'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다.',
                'auth/too-many-requests': '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
            };
            return messages[code] || '인증 오류가 발생했습니다.';
        },

        // 5. Alert 모달 제어
        showAlert(options = {}) {
            this.alertData = {
                isVisible: true,
                title: options.title || '',
                message: options.message || '',
                icon: options.icon || '🔮',
                confirmText: options.confirmText || '확인',
                type: options.type || ''
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

        // 인증 상태 초기화 및 쿠키 삭제
        resetAndClear() {
            this.user = null;
            this.userGrade = null;
            this.userCorpName = '';
            this.isLeading = false;
            this.token = null;
            this.isLoggedIn = false;
            this.subscription = {
                isSubscribed: false,
                subscriptionExpiry: null,
                isTrial: false,
                trialUsed: false,
                subscriptionCancelled: false,
            };
            this.subscriptionLoaded = false;
            this.paywallAccepted = false;
            Cookies.remove('user_token');
            Cookies.remove('user_info');
            Cookies.remove('user_grade');
            Cookies.remove('user_corp');
        },

        // 7. 로더 제어
        setAppLoading(status) {
            this.loader.isAppLoading = status;
        },
        setPdfLoading(status) {
            this.loader.isPdfLoading = status;
        },

        // 8-1. PDF 캡처 전 이미지 처리 (img → background-image 임시 전환)
        prepareImagesForPDF(element) {
            const imgElements = element.querySelectorAll('.bx_img img');
            const saved = [];
            imgElements.forEach(img => {
                const parent = img.parentElement;
                saved.push({
                    img,
                    parent,
                    parentBg: parent.style.backgroundImage,
                    parentBgSize: parent.style.backgroundSize,
                    parentBgPos: parent.style.backgroundPosition,
                    imgDisplay: img.style.display
                });
                parent.style.backgroundImage = `url(${img.src})`;
                parent.style.backgroundSize = 'cover';
                parent.style.backgroundPosition = 'center';
                img.style.display = 'none';
            });
            return saved;
        },

        // 8-2. PDF 캡처 후 이미지 복원
        restoreImagesAfterPDF(saved) {
            if (!saved) return;
            saved.forEach(({ img, parent, parentBg, parentBgSize, parentBgPos, imgDisplay }) => {
                parent.style.backgroundImage = parentBg;
                parent.style.backgroundSize = parentBgSize;
                parent.style.backgroundPosition = parentBgPos;
                img.style.display = imgDisplay;
            });
        },

        // 8. PDF 다운로드
        async downloadPDF(options) {
            const { pdfContent, html2canvas, jsPDF, filename } = options;
            if (!pdfContent) return;

            const element = pdfContent;
            const savedImgs = this.prepareImagesForPDF(element);
            try {
                this.setPdfLoading(true);
                element.classList.add('pdf_print');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const imgWidth = 210;

                const sectionSelectors = [
                    '.pdf_section1',
                    '.pdf_section2',
                    '.pdf_section3',
                    '.pdf_section4',
                    '.pdf_section5',
                ];

                const captureElement = async (el) => {
                    const canvas = await html2canvas(el, {
                        scale: 3,
                        useCORS: true,
                        backgroundColor: '#ffffff',
                        logging: false,
                    });
                    return {
                        data: canvas.toDataURL('image/jpeg', 1.0),
                        width: canvas.width,
                        height: (canvas.height * imgWidth) / canvas.width
                    };
                };

                const headerEl = element.querySelector('.pdf_only_header');
                headerEl.style.display = 'block';
                const headerImg = await captureElement(headerEl);
                headerEl.style.display = 'none';

                let pageCount = 0;
                for (let i = 0; i < sectionSelectors.length; i++) {
                    const target = element.querySelector(sectionSelectors[i]);
                    if (!target) continue;

                    // 숨겨진 섹션 건너뛰기
                    if (target.style.display === 'none') continue;

                    // 섹션 내 보이는 .item이 없으면 건너뛰기
                    const visibleItems = target.querySelectorAll('.item');
                    if (visibleItems.length > 0) {
                        const hasVisible = Array.from(visibleItems).some(item => item.style.display !== 'none');
                        if (!hasVisible) continue;
                    }

                    const originalDisplay = target.style.display;
                    target.style.display = 'block';
                    const sectionImg = await captureElement(target);
                    target.style.display = originalDisplay;

                    // 캔버스가 유효하지 않으면 건너뛰기
                    if (!sectionImg.width || sectionImg.height <= 0) continue;

                    if (pageCount > 0) pdf.addPage();

                    const sideMargin = 20;
                    const contentWidth = imgWidth - (sideMargin * 2);
                    const contentHeight = (sectionImg.height * contentWidth) / imgWidth;

                    let currentY = 0;

                    if (pageCount === 0) {
                        pdf.addImage(headerImg.data, 'JPEG', 0, 0, imgWidth, headerImg.height);
                        currentY = headerImg.height + 5;
                    } else {
                        currentY = 15;
                    }

                    pdf.addImage(sectionImg.data, 'JPEG', sideMargin, currentY, contentWidth, contentHeight);

                    pdf.setFontSize(10);
                    pdf.setTextColor(150);
                    pdf.text('- ' + String(pageCount + 1) + ' -', 105, 287, { align: 'center' });
                    pageCount++;
                }

                pdf.save(filename);
                element.classList.remove('pdf_print');
                this.restoreImagesAfterPDF(savedImgs);
                this.setPdfLoading(false);

            } catch (error) {
                console.error('PDF 생성 에러:', error);
                element.classList.remove('pdf_print');
                this.restoreImagesAfterPDF(savedImgs);
                this.setPdfLoading(false);
                alert('PDF 저장 중 오류가 발생했습니다.');
            }
        },

        // 9. 위키 페이지로 이동 (새 탭에서 열기)
        goToWiki(cardNum = null, category = 'majors') {
            const num = cardNum ?? this.result;
            if (num === null || num === undefined) return;
            
            const url = `/wiki/${category}/${num}`;
            // 새 탭에서 열기
            window.open(url, '_blank');
        },

        // 10. 위키 메인 페이지로 이동 (새 탭에서 열기)
        goToWikiMain() {
            const url = '/wiki';
            window.open(url, '_blank');
        },

        // ========== leading 컬렉션 체크 ==========
        async checkLeading(email) {
            if (!email) { this.isLeading = false; return; }
            try {
                const { $db } = useNuxtApp();
                const { collection, query, where, getDocs } = await import('firebase/firestore');
                const q = query(collection($db, 'leading'), where('email', '==', email));
                const snapshot = await getDocs(q);
                this.isLeading = !snapshot.empty;
            } catch (error) {
                console.error('leading 체크 실패:', error);
                this.isLeading = false;
            }
        },

        // ========== 내정보 수정 ==========

        // 13. 내 프로필 수정 (핸드폰, 상호명)
        async updateMyProfile({ phone, corpName }) {
            const { $db } = useNuxtApp();
            const config = useRuntimeConfig();
            const cryptoKey = config.public.cryptoKey;
            if (!this.user?.uid) return { success: false, error: '로그인이 필요합니다.' };
            try {
                const userRef = doc($db, 'users', this.user.uid);
                await updateDoc(userRef, { phone: await encryptPhone(phone, cryptoKey), corpName });

                // 스토어 업데이트 (디코딩된 값 유지)
                this.user.phone = phone;
                this.userCorpName = corpName;

                // 쿠키 갱신
                const cookieOptions = { expires: 1, path: '/' };
                Cookies.set('user_info', JSON.stringify(this.user), cookieOptions);
                Cookies.set('user_corp', corpName, cookieOptions);

                return { success: true };
            } catch (error) {
                console.error('프로필 수정 실패:', error);
                return { success: false, error: error.message };
            }
        },

        // ========== 회원 관리 함수 (Admin 전용) ==========

        // 11. 전체 회원 목록 조회
        async fetchAllUsers() {
            const { $auth, $db } = useNuxtApp();
            const config = useRuntimeConfig();
            const cryptoKey = config.public.cryptoKey;
            try {
                // Firebase Auth 초기화 대기 (쿠키 복원 후 바로 호출 시 auth가 아직 null일 수 있음)
                if (!$auth.currentUser) {
                    const user = await new Promise((resolve) => {
                        const unsubscribe = onAuthStateChanged($auth, (user) => {
                            unsubscribe();
                            resolve(user);
                        });
                    });
                    if (!user) {
                        this.resetAndClear();
                        return [];
                    }
                }

                const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
                const usersRef = collection($db, 'users');
                const q = query(usersRef, orderBy('createdAt', 'desc'));
                const snapshot = await getDocs(q);

                const rawUsers = [];
                snapshot.forEach(doc => {
                    rawUsers.push({
                        uid: doc.id,
                        ...doc.data()
                    });
                });

                // 어드민에서 원문으로 표시/검색할 수 있도록 복호화
                const users = await Promise.all(rawUsers.map(async (user) => ({
                    ...user,
                    name: await decryptData(user.name, cryptoKey),
                    phone: await decryptPhone(user.phone, cryptoKey)
                })));

                return users;
            } catch (error) {
                // 프로덕션 디버깅용 (console이 제거되므로 alert 사용)
                alert('회원 목록 조회 실패: ' + error.message);
                console.error('회원 목록 조회 실패:', error);
                return [];
            }
        },

        // 12. 회원 정보 수정 (등급, 승인 상태 + 민감 정보 재암호화)
        async updateUserInfo(uid, updateData) {
            const { $db } = useNuxtApp();
            const config = useRuntimeConfig();
            const cryptoKey = config.public.cryptoKey;
            try {
                const { doc, updateDoc } = await import('firebase/firestore');
                const userRef = doc($db, 'users', uid);

                // 민감 정보(이름, 전화번호) 암호화 처리
                const dataToSave = { ...updateData };
                if (dataToSave.name !== undefined) {
                    dataToSave.name = await encryptData(dataToSave.name, cryptoKey);
                }
                if (dataToSave.phone !== undefined) {
                    dataToSave.phone = await encryptPhone(dataToSave.phone, cryptoKey);
                }

                await updateDoc(userRef, dataToSave);
                return { success: true };
            } catch (error) {
                console.error('회원 정보 수정 실패:', error);
                return { success: false, error: error.message };
            }
        },
	}
})

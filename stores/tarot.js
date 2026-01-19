import { defineStore } from 'pinia'
import Cookies from 'js-cookie';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
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
        isLoggedIn: false,
        token: null,
        authLoading: false, // 인증 처리 중 로딩 상태
        pendingVerificationEmail: null, // 이메일 인증 대기 중인 이메일
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
        },
        // --- 글로벌 로딩 상태 ---
        loader: {
            isAppLoading: true,    // 앱 초기 로딩
            isPdfLoading: false,   // PDF 생성 로딩
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
        async fnSignUp(email, password, userName, userPhone, isStartup) {
            const { $auth, $db } = useNuxtApp();
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
                    name: userName,
                    phone: userPhone,
                    isStartup: isStartup,
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
                if (!userData.isApproved) {
                    await signOut($auth);
                    this.authLoading = false;
                    return { success: false, needApproval: true, error: '관리자 승인 대기 중입니다. 승인 후 이용 가능합니다.' };
                }

                // 3. 모든 조건 통과 시 로그인 처리
                this.user = {
                    uid: user.uid,
                    email: user.email,
                    name: userData.name || '',
                    emailVerified: user.emailVerified,
                    loginAt: new Date().toLocaleString()
                };
                this.userGrade = userData.grade || '일반';
                this.token = await user.getIdToken();
                this.isLoggedIn = true;

                // 쿠키 저장
                Cookies.set('user_token', this.token);
                Cookies.set('user_info', JSON.stringify(this.user));
                Cookies.set('user_grade', this.userGrade);

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
            this.token = null;
            this.isLoggedIn = false;
            Cookies.remove('user_token');
            Cookies.remove('user_info');
            Cookies.remove('user_grade');
        },

        // 4. 인증 상태 체크 (앱 시작 시 호출)
        checkAuth() {
            const { $auth, $db } = useNuxtApp();

            onAuthStateChanged($auth, async (user) => {
                // 이메일 인증 대기 중이면 상태 변경 무시
                if (this.pendingVerificationEmail) {
                    return;
                }

                if (user) {
                    // 1. 이메일 인증 확인
                    if (!user.emailVerified) {
                        // 이메일 미인증 사용자는 로그인 상태로 전환하지 않음
                        this.user = null;
                        this.token = null;
                        this.isLoggedIn = false;
                        return;
                    }

                    // 2. Firestore에서 승인 여부 확인
                    let userGrade = '일반';
                    let userName = '';
                    try {
                        const userDoc = await getDoc(doc($db, 'users', user.uid));
                        if (userDoc.exists()) {
                            const userData = userDoc.data();
                            if (!userData.isApproved) {
                                // 승인되지 않은 사용자는 로그인 상태로 전환하지 않음
                                await signOut($auth);
                                this.user = null;
                                this.userGrade = null;
                                this.token = null;
                                this.isLoggedIn = false;
                                return;
                            }
                            userGrade = userData.grade || '일반';
                            userName = userData.name || '';
                        } else {
                            // 사용자 문서가 없으면 로그인 불가
                            await signOut($auth);
                            this.user = null;
                            this.userGrade = null;
                            this.token = null;
                            this.isLoggedIn = false;
                            return;
                        }
                    } catch (error) {
                        console.error('사용자 정보 확인 오류:', error);
                        this.user = null;
                        this.userGrade = null;
                        this.token = null;
                        this.isLoggedIn = false;
                        return;
                    }

                    // 3. 모든 조건 통과 시 로그인 처리
                    this.user = {
                        uid: user.uid,
                        email: user.email,
                        name: userName,
                        emailVerified: user.emailVerified,
                        loginAt: new Date().toLocaleString()
                    };
                    this.userGrade = userGrade;
                    this.token = await user.getIdToken();
                    this.isLoggedIn = true;
                } else {
                    // Firebase 세션이 없으면 로그아웃 상태로 설정
                    // 쿠키가 남아있어도 Firebase 인증이 없으면 로그인 불가
                    this.user = null;
                    this.userGrade = null;
                    this.token = null;
                    this.isLoggedIn = false;
                    Cookies.remove('user_token');
                    Cookies.remove('user_info');
                    Cookies.remove('user_grade');
                }
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

        // 7. 로더 제어
        setAppLoading(status) {
            this.loader.isAppLoading = status;
        },
        setPdfLoading(status) {
            this.loader.isPdfLoading = status;
        },

        // 8. PDF 다운로드
        async downloadPDF(options) {
            const { pdfContent, html2canvas, jsPDF, filename } = options;
            if (!pdfContent) return;

            try {
                this.setPdfLoading(true);
                const element = pdfContent;
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
                        height: (canvas.height * imgWidth) / canvas.width
                    };
                };

                const headerEl = element.querySelector('.pdf_only_header');
                headerEl.style.display = 'block';
                const headerImg = await captureElement(headerEl);
                headerEl.style.display = 'none';

                for (let i = 0; i < sectionSelectors.length; i++) {
                    const target = element.querySelector(sectionSelectors[i]);
                    if (!target) continue;

                    const originalDisplay = target.style.display;
                    target.style.display = 'block';
                    const sectionImg = await captureElement(target);
                    target.style.display = originalDisplay;

                    if (i > 0) pdf.addPage();

                    const sideMargin = 20;
                    const contentWidth = imgWidth - (sideMargin * 2);
                    const contentHeight = (sectionImg.height * contentWidth) / imgWidth;

                    let currentY = 0;

                    if (i === 0) {
                        pdf.addImage(headerImg.data, 'JPEG', 0, 0, imgWidth, headerImg.height);
                        currentY = headerImg.height + 5;
                    } else {
                        currentY = 15;
                    }

                    pdf.addImage(sectionImg.data, 'JPEG', sideMargin, currentY, contentWidth, contentHeight);

                    pdf.setFontSize(10);
                    pdf.setTextColor(150);
                    pdf.text('- ' + String(i + 1) + ' -', 105, 287, { align: 'center' });
                }

                pdf.save(filename);
                element.classList.remove('pdf_print');
                this.setPdfLoading(false);

            } catch (error) {
                console.error('PDF 생성 에러:', error);
                element.classList.remove('pdf_print');
                this.setPdfLoading(false);
                alert('PDF 저장 중 오류가 발생했습니다.');
            }
        },
	}
})
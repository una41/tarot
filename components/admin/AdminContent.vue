<template>
	<main class="wrap_admin">
		<Transition name="fade" mode="out-in">
			<div v-if="selectedUser" :key="selectedUser.uid" class="container">
				<div class="bx_navigation">
					<span class="txt_cate">회원 정보</span>
				</div>
				<h2>{{ selectedUser.name || '이름 없음' }}</h2>

				<div class="contents">
					<!-- 기본 정보 -->
					<div class="info_section">
						<h3>기본 정보</h3>
						<dl class="info_list">
							<div class="info_item">
								<dt>이메일</dt>
								<dd>{{ selectedUser.email }}</dd>
							</div>
							<div class="info_item">
								<dt>이름</dt>
								<dd>
									<input
										type="text"
										class="ipt_info"
										:value="selectedUser.name || ''"
										disabled
									/>
								</dd>
							</div>
							<div class="info_item">
								<dt>연락처</dt>
								<dd>
									<input
										type="text"
										class="ipt_info"
										:value="selectedUser.phone || ''"
										disabled
									/>
								</dd>
							</div>
							<div class="info_item">
								<dt>상호명</dt>
								<dd>
									<input
										type="text"
										class="ipt_info"
										v-model="editData.corpName"
										placeholder="상호명 입력 (PDF 워터마크/헤더에 사용)"
									/>
								</dd>
							</div>
							<div class="info_item">
								<dt>가입일</dt>
								<dd>{{ formatDate(selectedUser.createdAt) }}</dd>
							</div>
							<div class="info_item">
								<dt>창업반</dt>
								<dd>
									<input
										type="text"
										class="ipt_info"
										v-model="editData.class"
										placeholder="창업반 정보 입력"
									/>
								</dd>
							</div>
							<div class="info_item memo">
								<dt>메모</dt>
								<dd>
									<textarea
										class="txa_info"
										v-model="editData.memo"
										placeholder="메모 입력"
									></textarea>
								</dd>
							</div>
						</dl>
					</div>

					<!-- 구독 정보 -->
				<div class="info_section">
					<h3>앱 구독 정보</h3>
					<dl class="info_list">
						<div class="info_item">
							<dt>구독 상태</dt>
							<dd>
								<span :class="['sub_badge', subStatus.isActive ? 'active' : 'inactive']">
									{{ subStatus.isActive ? '구독 중' : '미구독' }}
								</span>
								<span v-if="subStatus.isCancelled && subStatus.isActive" class="sub_cancelled_tag">취소 예정</span>
							</dd>
						</div>
						<div class="info_item" v-if="selectedUser.subscriptionExpiry">
							<dt>이용 만료일</dt>
							<dd>{{ formatDate(selectedUser.subscriptionExpiry) }}</dd>
						</div>
						<div class="info_item" v-if="selectedUser.subscriptionStart">
							<dt>구독 시작일</dt>
							<dd>{{ formatDate(selectedUser.subscriptionStart) }}</dd>
						</div>
					</dl>
					<div class="btn_wrap" v-if="subStatus.isActive">
						<button class="btn_admin_cancel" :disabled="adminCancelling" @click="handleAdminCancel">
							{{ adminCancelling ? '처리 중...' : '즉시 해지 (환불)' }}
						</button>
					</div>

					<!-- 구독 히스토리 -->
					<div class="history_section">
						<button class="btn_history_toggle" @click="toggleHistory">
							구독 히스토리
							<span class="ico_arr" :class="{ open: showHistory }">▾</span>
						</button>
						<div v-if="showHistory" class="history_list">
							<div v-if="historyLoading" class="history_loading">불러오는 중...</div>
							<template v-else-if="history.length > 0">
								<div v-for="(item, idx) in history" :key="idx" class="history_item">
									<span class="history_badge" :class="item.type">{{ historyLabel(item.type) }}</span>
									<span class="history_date">{{ formatDate(item.date) }}</span>
									<span v-if="item.amount" class="history_amount">{{ item.amount.toLocaleString() }}원</span>
									<span v-if="item.expiry" class="history_expiry">~ {{ formatDateShort(item.expiry) }}</span>
								</div>
							</template>
							<div v-else class="history_empty">히스토리가 없습니다.</div>
						</div>
					</div>
				</div>

				<!-- 권한 설정 -->
					<div class="info_section">
						<h3>권한 설정</h3>
						<div class="control_group">
							<!-- 승인 상태 -->
							<div class="control_item">
								<label class="control_label">승인 상태</label>
								<div class="toggle_wrap">
									<button
										class="toggle_btn"
										:class="{ active: editData.isApproved }"
										@click="toggleApproval"
									>
										<span class="toggle_slider"></span>
									</button>
									<span class="toggle_text">{{ editData.isApproved ? '승인됨' : '대기중' }}</span>
								</div>
							</div>

							<!-- 등급 선택 -->
							<div class="control_item">
								<label class="control_label">회원 등급</label>
								<div class="grade_btns">
									<button
										v-for="grade in grades"
										:key="grade"
										:class="{ active: editData.grade === grade }"
										@click="selectGrade(grade)"
									>
										{{ grade }}
									</button>
								</div>
							</div>
							<div class="control_item">
								<label class="control_label">회원 탈퇴</label>
								<button
									v-if="!selectedUser.withdrawn"
									class="btn_withdraw_direct"
									:disabled="withdrawProcessing"
									@click="handleWithdraw"
								>
									{{ withdrawProcessing ? '처리 중...' : '탈퇴' }}
								</button>
								<button
									v-else
									class="btn_withdraw_restore"
									:disabled="withdrawProcessing"
									@click="handleRestoreUser"
								>
									{{ withdrawProcessing ? '처리 중...' : '복구' }}
								</button>
							</div>
						</div>

						<!-- 저장 / 탈퇴 버튼 -->
						<div class="btn_wrap">
							<button
								class="btn_save"
								:disabled="!hasChanges || saving"
								@click="saveChanges"
							>
								{{ saving ? '저장 중...' : '변경사항 저장' }}
							</button>
						</div>
					</div>
				</div>
			</div>
			<div v-else class="contents empty">
				<p class="icon">👥</p>
				<p class="txt">왼쪽 목록에서 회원을 선택해주세요</p>
			</div>
		</Transition>
	</main>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useTarotStore } from '~/stores/tarot';

const store = useTarotStore();

const props = defineProps({
	selectedUser: {
		type: Object,
		default: null
	},
	saving: {
		type: Boolean,
		default: false
	}
});

const emit = defineEmits(['update-user', 'admin-cancel-sub', 'withdraw-user', 'restore-user', 'cancel-withdraw-request']);

const grades = ['일반', '프로', '마스터'];

const adminCancelling = ref(false);
const withdrawProcessing = ref(false);

const showHistory = ref(false);
const history = ref([]);
const historyLoading = ref(false);

const toggleHistory = async () => {
	showHistory.value = !showHistory.value;
	if (showHistory.value && history.value.length === 0) {
		await fetchHistory();
	}
};

const fetchHistory = async () => {
	if (!props.selectedUser?.uid) return;
	historyLoading.value = true;
	try {
		const config = useRuntimeConfig();
		const res = await fetch(`${config.public.workerUrl}/api/billing/history`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ customerKey: props.selectedUser.uid }),
		});
		if (res.ok) {
			const data = await res.json();
			history.value = data.history;
		}
	} finally {
		historyLoading.value = false;
	}
};

const historyLabel = (type) => {
	const labels = {
		subscribed: '구독 시작',
		renewed: '결제 갱신',
		cancelled: '구독 취소',
		admin_cancelled: '관리자 해지',
		renewal_failed: '결제 실패',
	};
	return labels[type] || type;
};

const subStatus = computed(() => {
	if (!props.selectedUser) return { isActive: false, isCancelled: false };
	const now = new Date();
	const expiry = props.selectedUser.subscriptionExpiry ? new Date(props.selectedUser.subscriptionExpiry) : null;
	const isActive = !!(props.selectedUser.isSubscribed && expiry && expiry > now);
	return { isActive, isCancelled: props.selectedUser.subscriptionCancelled || false };
});

const handleAdminCancel = () => {
	store.showConfirm({
		title: '즉시 해지 (환불)',
		message: `${props.selectedUser.name}님의 구독을 즉시 해지하고 마지막 결제금액을 환불하시겠습니까?`,
		icon: '⚠️',
		confirmText: '즉시 해지',
		cancelText: '취소',
		onConfirm: async () => {
			adminCancelling.value = true;
			try {
				const config = useRuntimeConfig();
				const res = await fetch(`${config.public.workerUrl}/api/billing/admin-cancel`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						uid: props.selectedUser.uid,
						customerKey: props.selectedUser.uid,
					}),
				});
				if (res.ok) {
					emit('admin-cancel-sub', props.selectedUser.uid);
					// 히스토리 갱신
					history.value = [];
					if (showHistory.value) await fetchHistory();
					store.showAlert({ message: '즉시 해지 및 환불 처리가 완료되었습니다.', icon: '✅' });
				} else {
					const data = await res.json();
					store.showAlert({ message: data.error || '처리 중 오류가 발생했습니다.', icon: '❌' });
				}
			} catch {
				store.showAlert({ message: '서버 연결 오류가 발생했습니다.', icon: '❌' });
			} finally {
				adminCancelling.value = false;
			}
		}
	});
};

// 탈퇴 처리 (withdrawn: true)
const handleWithdraw = () => {
	store.showConfirm({
		title: '탈퇴 처리',
		message: `${props.selectedUser.name}님을 탈퇴 처리하시겠습니까?\n탈퇴 후 해당 계정으로 로그인이 불가합니다.`,
		icon: '⚠️',
		confirmText: '탈퇴 처리',
		cancelText: '취소',
		onConfirm: async () => {
			withdrawProcessing.value = true;
			try {
				emit('withdraw-user', props.selectedUser.uid);
			} finally {
				withdrawProcessing.value = false;
			}
		}
	});
};

// 탈퇴 계정 복구 (withdrawn: false)
const handleRestoreUser = () => {
	store.showConfirm({
		title: '계정 복구',
		message: `${props.selectedUser.name}님의 계정을 복구하시겠습니까?`,
		icon: '🔄',
		confirmText: '복구',
		cancelText: '취소',
		onConfirm: async () => {
			withdrawProcessing.value = true;
			try {
				emit('restore-user', props.selectedUser.uid);
			} finally {
				withdrawProcessing.value = false;
			}
		}
	});
};

// 수정 데이터
const editData = ref({
	isApproved: false,
	grade: '일반',
	class: '',
	corpName: '',
	memo: ''
});

// 선택된 유저가 변경되면 editData 업데이트 + 히스토리 초기화
watch(() => props.selectedUser, (newUser) => {
	showHistory.value = false;
	history.value = [];
	if (newUser) {
		editData.value = {
			isApproved: newUser.isApproved || false,
			grade: newUser.grade || '일반',
			class: newUser.class || '',
			corpName: newUser.corpName || '',
			memo: newUser.memo || ''
		};
	}
}, { immediate: true });

// 변경사항 있는지 확인
const hasChanges = computed(() => {
	if (!props.selectedUser) return false;
	return (
		editData.value.isApproved !== props.selectedUser.isApproved ||
		editData.value.grade !== props.selectedUser.grade ||
		editData.value.class !== (props.selectedUser.class || '') ||
		editData.value.corpName !== (props.selectedUser.corpName || '') ||
		editData.value.memo !== (props.selectedUser.memo || '')
	);
});

// 승인 상태 토글
const toggleApproval = () => {
	editData.value.isApproved = !editData.value.isApproved;
};

// 등급 선택
const selectGrade = (grade) => {
	editData.value.grade = grade;
};

// 저장 (기존 민감 정보 재암호화를 위해 name, phone도 함께 전달)
const saveChanges = () => {
	emit('update-user', {
		isApproved: editData.value.isApproved,
		grade: editData.value.grade,
		class: editData.value.class,
		corpName: editData.value.corpName,
		memo: editData.value.memo,
		name: props.selectedUser.name,
		phone: props.selectedUser.phone,
	});
};

// 날짜 포맷팅
const formatDate = (date) => {
	if (!date) return '-';
	// Firestore Timestamp 객체 처리
	const d = date.toDate ? date.toDate() : new Date(date);
	return d.toLocaleDateString('ko-KR', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
};

// 날짜 포맷팅 (간략)
const formatDateShort = (date) => {
	if (!date) return '-';
	const d = new Date(date);
	return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
};
</script>

<style lang="scss" scoped>
.sub_badge {
	font-size: 0.78rem;
	font-weight: 600;
	padding: 3px 10px;
	border-radius: 20px;
	&.active { background: #d1fae5; color: #065f46; }
	&.inactive { background: #f3f4f6; color: #6b7280; }
}
.sub_cancelled_tag {
	font-size: 0.75rem;
	color: #d97706;
	background: #fef3c7;
	padding: 2px 8px;
	border-radius: 12px;
	margin-left: 6px;
}
.btn_admin_cancel {
	padding: 9px 18px;
	background: #c53030;
	color: #fff;
	border: none;
	border-radius: 8px;
	font-size: 0.88rem;
	font-weight: 600;
	cursor: pointer;
	transition: background 200ms;
	&:hover:not(:disabled) { background: #9b2c2c; }
	&:disabled { opacity: 0.6; cursor: not-allowed; }
}
.history_section {
	margin-top: 14px;
	padding-top: 12px;
	border-top: 1px solid #e5e7eb;
}
.btn_history_toggle {
	display: flex;
	align-items: center;
	gap: 6px;
	background: none;
	border: 1px solid #d1d5db;
	border-radius: 6px;
	padding: 6px 14px;
	font-size: 0.83rem;
	color: #374151;
	cursor: pointer;
	transition: background 150ms;
	&:hover { background: #f3f4f6; }
	.ico_arr {
		display: inline-block;
		transition: transform 200ms;
		&.open { transform: rotate(180deg); }
	}
}
.history_list {
	margin-top: 10px;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
	overflow: hidden;
}
.history_item {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 9px 14px;
	font-size: 0.82rem;
	border-bottom: 1px solid #f3f4f6;
	&:last-child { border-bottom: none; }
}
.history_badge {
	font-size: 0.75rem;
	font-weight: 600;
	padding: 2px 8px;
	border-radius: 10px;
	white-space: nowrap;
	&.subscribed { background: #d1fae5; color: #065f46; }
	&.renewed { background: #dbeafe; color: #1e40af; }
	&.cancelled { background: #f3f4f6; color: #6b7280; }
	&.admin_cancelled { background: #fee2e2; color: #991b1b; }
	&.renewal_failed { background: #fef3c7; color: #92400e; }
}
.history_date { color: #6b7280; flex: 1; }
.history_amount { color: #374151; font-weight: 600; }
.history_expiry { color: #9ca3af; font-size: 0.78rem; }
.history_loading,
.history_empty {
	padding: 16px;
	text-align: center;
	color: #9ca3af;
	font-size: 0.83rem;
}
.btn_withdraw_direct {
	padding: 9px 16px;
	background: #991b1b;
	color: #fff;
	border: none;
	border-radius: 8px;
	font-size: 0.88rem;
	font-weight: 600;
	cursor: pointer;
	transition: background 200ms;
	&:hover:not(:disabled) { background: #7f1d1d; }
	&:disabled { opacity: 0.6; cursor: not-allowed; }
}
.btn_withdraw_restore {
	padding: 8px 16px;
	background: #1d4ed8;
	color: #fff;
	border: none;
	border-radius: 7px;
	font-size: 0.86rem;
	font-weight: 600;
	cursor: pointer;
	transition: background 200ms;
	&:hover:not(:disabled) { background: #1e40af; }
	&:disabled { opacity: 0.6; cursor: not-allowed; }
}
</style>

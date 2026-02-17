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
						</div>

						<!-- 저장 버튼 -->
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

const emit = defineEmits(['update-user']);

const grades = ['일반', '프로', '마스터'];

// 수정 데이터
const editData = ref({
	isApproved: false,
	grade: '일반',
	class: '',
	corpName: '',
	memo: ''
});

// 선택된 유저가 변경되면 editData 업데이트
watch(() => props.selectedUser, (newUser) => {
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

// 저장
const saveChanges = () => {
	emit('update-user', {
		isApproved: editData.value.isApproved,
		grade: editData.value.grade,
		class: editData.value.class,
		corpName: editData.value.corpName,
		memo: editData.value.memo
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
</script>

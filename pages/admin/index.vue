<template>
	<div class="com admin">
		<!-- 마스터 권한 체크 -->
		<div v-if="!isMaster" class="denied">
			<p class="icon">🔒</p>
			<p class="tit">접근 권한이 없습니다</p>
			<p class="txt">이 페이지는 마스터 회원만 열람할 수 있습니다.</p>
			<button class="btn_back" @click="goBack">돌아가기</button>
		</div>

		<template v-else>
			<!-- 헤더 -->
			<AdminHeader @go-back="goBack" />

			<!-- 바디 -->
			<div class="body">
				<!-- 모바일 오버레이 -->
				<div class="overlay" :class="{ on: isMenuOpen }" @click="closeMenu"></div>

				<!-- 사이드바 -->
				<AdminSidebar
					:users="filteredUsers"
					:all-users="users"
					:selected-user="selectedUser"
					:selected-grade="selectedGrade"
					:selected-approval="selectedApproval"
					:is-menu-open="isMenuOpen"
					:loading="loading"
					@select-user="selectUser"
					@filter-grade="filterGrade"
					@filter-approval="filterApproval"
					@toggle-menu="toggleMenu"
					@close-menu="closeMenu"
				/>

				<!-- 컨텐츠 -->
				<AdminContent
					:selected-user="selectedUser"
					:saving="saving"
					@update-user="handleUpdateUser"
				/>
			</div>
		</template>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useTarotStore } from '~/stores/tarot';

// 컴포넌트 임포트
import AdminHeader from '~/components/admin/AdminHeader.vue';
import AdminSidebar from '~/components/admin/AdminSidebar.vue';
import AdminContent from '~/components/admin/AdminContent.vue';

const store = useTarotStore();
const router = useRouter();

// 상태
const users = ref([]);
const selectedUser = ref(null);
const selectedGrade = ref('전체');
const selectedApproval = ref('전체');
const isMenuOpen = ref(false);
const loading = ref(false);
const saving = ref(false);

// 마스터 권한 체크
const isMaster = computed(() => {
	return store.userGrade === '마스터';
});

// 등급 우선순위 (마스터 > 프로 > 일반)
const gradeOrder = { '마스터': 0, '프로': 1, '일반': 2 };

// 등급 + 승인 상태 필터링 + 정렬
const filteredUsers = computed(() => {
	let result = users.value;

	// 등급 필터
	if (selectedGrade.value !== '전체') {
		result = result.filter(user => user.grade === selectedGrade.value);
	}

	// 승인 상태 필터
	if (selectedApproval.value !== '전체') {
		const isApproved = selectedApproval.value === '승인';
		result = result.filter(user => user.isApproved === isApproved);
	}

	// 정렬: 등급순 → 가나다순
	result = [...result].sort((a, b) => {
		const gradeA = gradeOrder[a.grade] ?? 3;
		const gradeB = gradeOrder[b.grade] ?? 3;
		if (gradeA !== gradeB) return gradeA - gradeB;
		return (a.name || '').localeCompare(b.name || '', 'ko');
	});

	return result;
});

// 등급 필터 변경
const filterGrade = (grade) => {
	selectedGrade.value = grade;
	selectedUser.value = null;
};

// 승인 상태 필터 변경
const filterApproval = (status) => {
	selectedApproval.value = status;
	selectedUser.value = null;
};

// 회원 선택
const selectUser = (user) => {
	selectedUser.value = { ...user };
	closeMenu();
};

// 회원 정보 수정
const handleUpdateUser = async (updateData) => {
	if (!selectedUser.value) return;

	saving.value = true;
	const result = await store.updateUserInfo(selectedUser.value.uid, updateData);
	saving.value = false;

	if (result.success) {
		// 목록 업데이트
		const index = users.value.findIndex(u => u.uid === selectedUser.value.uid);
		if (index !== -1) {
			users.value[index] = { ...users.value[index], ...updateData };
			selectedUser.value = { ...users.value[index] };
		}
		store.showAlert({
			message: '회원 정보가 수정되었습니다.',
			icon: '✅'
		});
	} else {
		store.showAlert({
			message: '수정 중 오류가 발생했습니다.',
			icon: '❌'
		});
	}
};

// 메뉴 토글
const toggleMenu = () => {
	isMenuOpen.value = !isMenuOpen.value;
};

// 메뉴 닫기
const closeMenu = () => {
	isMenuOpen.value = false;
};

// 뒤로가기
const goBack = () => {
	router.push('/');
};

// 데이터 로드
const loadUsers = async () => {
	if (!isMaster.value) return;

	loading.value = true;
	users.value = await store.fetchAllUsers();
	loading.value = false;
};

// 인증 상태 확인 완료 감지
watch(() => store.authChecked, (checked) => {
	if (checked && isMaster.value && users.value.length === 0) {
		loadUsers();
	}
});

// 마스터 권한 변경 감지
watch(isMaster, (newValue) => {
	if (newValue && users.value.length === 0) {
		loadUsers();
	}
});

// 데이터 로드
onMounted(() => {
	loadUsers();
});
</script>

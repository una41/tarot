<template>
	<aside class="sidebar" :class="{ on: isMenuOpen }">
		<button class="btn_toggle" @click="$emit('toggle-menu')"></button>
		<!-- 필터 영역 -->
		<div class="side_header">
			<div class="tit">필터 & 검색</div>
			<div class="filter">
				<div class="filter_selects">
					<!-- 등급 셀렉트박스 -->
					<div class="slct" :class="{ on: isGradeOpen, selected: selectedGrade !== '전체' }">
						<button class="slct_tit" @click="toggleGradeSelect">
							{{ selectedGrade }} ({{ getGradeCount(selectedGrade) }})
						</button>
						<div class="slct_cont">
							<button
								v-for="grade in grades"
								:key="grade"
								@click="selectGrade(grade)"
							>
								{{ grade }} ({{ getGradeCount(grade) }})
							</button>
						</div>
					</div>

					<!-- 승인 상태 셀렉트박스 -->
					<div class="slct" :class="{ on: isApprovalOpen, selected: selectedApproval !== '전체' }">
						<button class="slct_tit" @click="toggleApprovalSelect">
							{{ selectedApproval }}
						</button>
						<div class="slct_cont">
							<button
								v-for="status in approvalStatuses"
								:key="status"
								@click="selectApproval(status)"
							>
								{{ status }}
							</button>
						</div>
					</div>
				</div>
			</div>
			<!-- 검색 -->
			<div class="search">
				<input
					type="text"
					:value="searchQuery"
					@input="$emit('update:search-query', $event.target.value)"
					placeholder="이름, 이메일, 업체명, 전화번호 검색"
					class="ipt_search"
				/>
			</div>

		</div>
		<!-- 회원 목록 -->
		<nav class="nav">
			<div v-if="loading" class="nav_loading">
				<span>로딩 중...</span>
			</div>
			<div v-else-if="users.length === 0" class="nav_empty">
				<p>{{ searchQuery.trim() ? '검색 결과가 없습니다.' : '회원이 없습니다.' }}</p>
			</div>
			<ul v-else class="nav_list">
				<li
					v-for="user in users"
					:key="user.uid"
					:class="{ active: selectedUser?.uid === user.uid }"
					@click="$emit('select-user', user)"
				>
					<div class="user_info">
						<span class="user_name">{{ user.name || '이름 없음' }}</span>
						<span class="user_grade" :class="getGradeClass(user.grade)">{{ user.grade }}</span>
					</div>
					<div class="user_email">{{ user.email }}</div>
					<div class="user_status">
						<span class="status_badge" :class="{ approved: user.isApproved }">
							{{ user.isApproved ? '승인됨' : '대기중' }}
						</span>
						<span v-if="user.withdrawalRequested && !user.withdrawn" class="withdraw_request_badge">탈퇴요청</span>
						<span v-else-if="user.withdrawn" class="withdrawn_badge">탈퇴됨</span>
					</div>
				</li>
			</ul>
		</nav>
	</aside>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
	users: {
		type: Array,
		required: true
	},
	allUsers: {
		type: Array,
		required: true
	},
	selectedUser: {
		type: Object,
		default: null
	},
	selectedGrade: {
		type: String,
		default: '전체'
	},
	selectedApproval: {
		type: String,
		default: '전체'
	},
	searchQuery: {
		type: String,
		default: ''
	},
	isMenuOpen: {
		type: Boolean,
		default: false
	},
	loading: {
		type: Boolean,
		default: false
	}
});

const emit = defineEmits(['select-user', 'filter-grade', 'filter-approval', 'update:search-query', 'toggle-menu', 'close-menu']);

const grades = ['전체', '일반', '프로', '마스터'];
const approvalStatuses = ['전체', '승인', '미승인'];

// 셀렉트박스 열림 상태
const isGradeOpen = ref(false);
const isApprovalOpen = ref(false);

// 등급 셀렉트 토글
const toggleGradeSelect = () => {
	isGradeOpen.value = !isGradeOpen.value;
	isApprovalOpen.value = false;
};

// 승인 상태 셀렉트 토글
const toggleApprovalSelect = () => {
	isApprovalOpen.value = !isApprovalOpen.value;
	isGradeOpen.value = false;
};

// 등급 선택
const selectGrade = (grade) => {
	emit('filter-grade', grade);
	isGradeOpen.value = false;
};

// 승인 상태 선택
const selectApproval = (status) => {
	emit('filter-approval', status);
	isApprovalOpen.value = false;
};

// 등급별 회원 수 (전체 목록 기준)
const getGradeCount = (grade) => {
	if (grade === '전체') return props.allUsers.length;
	return props.allUsers.filter(u => u.grade === grade).length;
};

// 등급별 클래스
const getGradeClass = (grade) => {
	const mapping = {
		'일반': 'normal',
		'프로': 'pro',
		'마스터': 'master'
	};
	return mapping[grade] || 'normal';
};
</script>

<style lang="scss" scoped>
.withdraw_request_badge {
	font-size: 0.7rem;
	font-weight: 600;
	padding: 2px 7px;
	border-radius: 10px;
	background: #fef3c7;
	color: #92400e;
	margin-left: 5px;
}
.withdrawn_badge {
	font-size: 0.7rem;
	font-weight: 600;
	padding: 2px 7px;
	border-radius: 10px;
	background: #fee2e2;
	color: #991b1b;
	margin-left: 5px;
}
</style>

<template>
	<div class="wiki">
		<!-- 마스터 권한 체크 -->
		<div v-if="!isMaster" class="denied">
			<p class="icon">🔒</p>
			<p class="tit">접근 권한이 없습니다</p>
			<p class="txt">이 페이지는 마스터 회원만 열람할 수 있습니다.</p>
			<button class="btn_back" @click="goBack">돌아가기</button>
		</div>

		<template v-else>
			<!-- 헤더 -->
			<header class="header">
				<h1 class="logo">타로 Wiki</h1>
				<button class="btn_back" @click="goBack">돌아가기</button>
			</header>

			<!-- 바디 -->
			<div class="body">
				<!-- 모바일 오버레이 -->
				<div class="overlay" :class="{ on: isMenuOpen }" @click="closeMenu"></div>

				<!-- 사이드바 -->
				<aside class="sidebar" :class="{ on: isMenuOpen }">
					<button class="btn_toggle" @click="toggleMenu"></button>
					<!-- 검색 -->
					<div class="search">
						<input
							type="text"
							v-model="searchQuery"
							placeholder="검색어를 입력하세요"
							class="ipt_search"
						/>
					</div>

					<!-- 네비게이션 -->
					<nav class="nav">
						<div
							v-for="(items, category) in filteredGroupedList"
							:key="category"
							class="nav_group"
						>
							<p class="nav_category">{{ category }}</p>
							<ul class="nav_list">
								<li
									v-for="item in items"
									:key="item.id"
									:class="{ active: selectedItem?.id === item.id }"
									@click="selectItem(item)"
								>
									{{ item.title }}
								</li>
							</ul>
						</div>
						<p v-if="Object.keys(filteredGroupedList).length === 0" class="nav_empty">
							검색 결과가 없습니다.
						</p>
					</nav>
				</aside>

				<!-- 컨텐츠 -->
				<main class="contents">
					<Transition name="fade" mode="out-in">
						<div v-if="selectedItem" :key="selectedItem.id" class="cont_inner">
							<span class="cont_category">{{ selectedItem.category }}</span>
							<h2 class="cont_title">{{ selectedItem.title }}</h2>
							<div class="cont_body" v-html="formatContent(selectedItem.content)"></div>
						</div>
						<div v-else class="cont_empty">
							<p class="icon">📖</p>
							<p class="txt">왼쪽 목록에서 항목을 선택해주세요</p>
						</div>
					</Transition>
				</main>
			</div>
		</template>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useTarotStore } from '~/stores/tarot';

const store = useTarotStore();
const router = useRouter();

// 위키 데이터
const wikiList = ref([]);
const selectedItem = ref(null);
const searchQuery = ref('');
const isMenuOpen = ref(false);

// 마스터 권한 체크
const isMaster = computed(() => {
	return store.userGrade === '마스터';
});

// 카테고리별 그룹핑
const groupedList = computed(() => {
	const groups = {};
	wikiList.value.forEach(item => {
		if (!groups[item.category]) {
			groups[item.category] = [];
		}
		groups[item.category].push(item);
	});
	return groups;
});

// 검색 필터링
const filteredGroupedList = computed(() => {
	if (!searchQuery.value.trim()) {
		return groupedList.value;
	}

	const query = searchQuery.value.toLowerCase();
	const filtered = {};

	Object.entries(groupedList.value).forEach(([category, items]) => {
		const matchedItems = items.filter(item =>
			item.title.toLowerCase().includes(query) ||
			item.content.toLowerCase().includes(query) ||
			item.category.toLowerCase().includes(query)
		);

		if (matchedItems.length > 0) {
			filtered[category] = matchedItems;
		}
	});

	return filtered;
});

// 항목 선택
const selectItem = (item) => {
	selectedItem.value = item;
	closeMenu();
};

// 메뉴 토글
const toggleMenu = () => {
	isMenuOpen.value = !isMenuOpen.value;
};

// 메뉴 닫기
const closeMenu = () => {
	isMenuOpen.value = false;
};

// 컨텐츠 포맷팅 (줄바꿈 처리)
const formatContent = (content) => {
	return content.replace(/\n/g, '<br>');
};

// 뒤로가기
const goBack = () => {
	router.push('/');
};

// 데이터 로드
onMounted(async () => {
	if (!isMaster.value) return;

	try {
		const { data } = await useFetch('/data/wiki.json');
		if (data.value) {
			wikiList.value = data.value;
		}
	} catch (error) {
		console.error('위키 데이터 로드 실패:', error);
	}
});
</script>

<template>
	<div class="common wiki">
		<!-- 마스터 권한 체크 -->
		<div v-if="!isMaster" class="denied">
			<p class="icon">🔒</p>
			<p class="tit">접근 권한이 없습니다</p>
			<p class="txt">이 페이지는 마스터 회원만 열람할 수 있습니다.</p>
			<button class="btn_back" @click="goBack">돌아가기</button>
		</div>

		<template v-else>
			<!-- 헤더 -->
			<WikiHeader @go-back="goBack" />

			<!-- 바디 -->
			<div class="body">
				<!-- 모바일 오버레이 -->
				<div class="overlay" :class="{ on: isMenuOpen }" @click="closeMenu"></div>
    
				<!-- 사이드바 -->
				<WikiSidebar
					:filtered-grouped-list="filteredGroupedList"
					:selected-item="selectedItem"
					:open-categories="openCategories"
					:search-query="searchQuery"
					:is-menu-open="isMenuOpen"
					@update:search-query="searchQuery = $event"
					@select-item="selectItem"
					@toggle-category="toggleCategory"
					@toggle-menu="toggleMenu"
					@close-menu="closeMenu"
				/>

				<!-- 컨텐츠 -->
				<WikiContent
					:selected-item="selectedItem"
					:format-content="formatContent"
				/>
			</div>
		</template>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTarotStore } from '~/stores/tarot';

// 컴포넌트 임포트
import WikiHeader from '~/components/wiki/WikiHeader.vue';
import WikiSidebar from '~/components/wiki/WikiSidebar.vue';
import WikiContent from '~/components/wiki/WikiContent.vue';

const store = useTarotStore();
const route = useRoute();
const router = useRouter();

// 위키 데이터
const wikiList = ref([]);
const selectedItem = ref(null);
const searchQuery = ref('');
const isMenuOpen = ref(false);
const openCategories = ref(new Set()); // 아코디언 상태 관리

// 마스터/프로 권한 체크
const isMaster = computed(() => {
	return ['마스터', '프로'].includes(store.userGrade);
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

// URL 매개변수에서 카테고리와 식별자 추출
const getItemFromUrl = () => {
	// route.params.slug는 [...slug].vue를 통해 전달된 배열
	// 예: /wiki/majors/0 -> ['majors', '0'] (card_num 사용)
	// 예: /wiki/basic/1 -> ['basic', '1'] (id 사용)
	const slug = route.params.slug;
	
	console.log('getItemFromUrl - slug:', slug);
	
	if (!slug || !Array.isArray(slug) || slug.length < 2) {
		console.log('getItemFromUrl - slug 길이 부족 또는 없음');
		return null;
	}
	
	const category = slug[0];
	const identifier = parseInt(slug[1], 10);
	
	console.log('getItemFromUrl - category:', category, 'identifier:', identifier);
	
	if (!category || isNaN(identifier)) {
		console.log('getItemFromUrl - category 없거나 identifier NaN');
		return null;
	}
	
	// basic 카테고리는 id로 항목 찾기, 그 외 카테고리는 card_num으로 항목 찾기
	let foundItem;
	if (category.toLowerCase() === 'basic') {
		foundItem = wikiList.value.find(item => 
			item.category.toLowerCase() === category.toLowerCase() && 
			item.id === identifier
		);
	} else {
		foundItem = wikiList.value.find(item => 
			item.category.toLowerCase() === category.toLowerCase() && 
			item.card_num === identifier
		);
	}
	
	console.log('getItemFromUrl - foundItem:', foundItem);
	return foundItem;
};

// URL 업데이트
const updateUrl = (item) => {
	if (!item) return;
	
	console.log('updateUrl - item:', item);
	
	// basic 카테고리는 id를 사용, 다른 카테고리는 card_num을 사용
	if (item.category.toLowerCase() === 'basic') {
		// basic 카테고리는 항상 id로 라우팅
		router.push(`/wiki/${item.category.toLowerCase()}/${item.id}`);
	} else {
		// 다른 카테고리: card_num이 -1이면 기본 URL, 아니면 card_num으로 라우팅
		if (item.card_num === -1) {
			router.push('/wiki');
		} else {
			router.push(`/wiki/${item.category.toLowerCase()}/${item.card_num}`);
		}
	}
};

// 항목 선택
const selectItem = (item) => {
	selectedItem.value = item;
	updateUrl(item);
	
	// 선택된 항목의 카테고리 열기
	if (item && item.category) {
		openCategories.value.add(item.category);
	}
	
	closeMenu();
};

// 카테고리 토글 (아코디언)
const toggleCategory = (category) => {
	if (openCategories.value.has(category)) {
		openCategories.value.delete(category);
	} else {
		openCategories.value.add(category);
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

// 컨텐츠 포맷팅 (줄바꿈 처리)
const formatContent = (content) => {
	return content.replace(/\n/g, '<br>');
};

// 뒤로가기
const goBack = () => {
	router.push('/');
};

// 데이터 로드 및 항목 설정
const loadWikiData = async () => {
	if (!isMaster.value) return;

	try {
		const { data } = await useFetch('/data/wiki.json');
		if (data.value) {
			wikiList.value = data.value;
			
			// URL에서 항목 로드 시도
			const urlItem = getItemFromUrl();
			if (urlItem) {
				selectedItem.value = urlItem;
			} else {
				// 기본 항목 설정: "타로카드의 역사" (id: 1)
				const defaultItem = data.value.find(item => item.id === 1);
				if (defaultItem) {
					selectedItem.value = defaultItem;
					updateUrl(defaultItem);
				} else if (data.value.length > 0) {
					// 기본 항목이 없으면 첫 번째 항목 선택
					selectedItem.value = data.value[0];
					updateUrl(data.value[0]);
				}
			}
			
			// 기본적으로 모든 카테고리 닫힘
			// 선택된 항목이 속한 카테고리만 열기
			if (selectedItem.value) {
				openCategories.value.add(selectedItem.value.category);
			}
		}
	} catch (error) {
		console.error('위키 데이터 로드 실패:', error);
	}
};

// URL 변경 감지
watch(() => route.params, () => {
	if (wikiList.value.length > 0) {
		const urlItem = getItemFromUrl();
		if (urlItem && urlItem.id !== selectedItem.value?.id) {
			selectedItem.value = urlItem;
			// 선택된 항목의 카테고리 열기
			if (urlItem && urlItem.category) {
				openCategories.value.add(urlItem.category);
			}
		}
	}
});

// 검색어 변경 감지
watch(searchQuery, (newQuery) => {
	if (newQuery.trim()) {
		// 검색어가 있을 때: 검색 결과가 있는 모든 카테고리 열기
		const categories = Object.keys(filteredGroupedList.value);
		openCategories.value.clear();
		categories.forEach(category => {
			openCategories.value.add(category);
		});
	} else {
		// 검색어가 없을 때: 선택된 항목의 카테고리만 열기
		if (selectedItem.value && selectedItem.value.category) {
			const selectedCategory = selectedItem.value.category;
			openCategories.value.clear();
			openCategories.value.add(selectedCategory);
		} else {
			// 선택된 항목이 없으면 모든 카테고리 닫기
			openCategories.value.clear();
		}
	}
});

// 인증 상태 확인 완료 감지 (URL 직접 접근 또는 새 탭으로 열었을 때)
watch(() => store.authChecked, (checked) => {
	if (checked && isMaster.value && wikiList.value.length === 0) {
		loadWikiData();
	}
});

// 마스터 권한 변경 감지 (새 탭으로 열었을 때 인증 로드 후 데이터 로드)
watch(isMaster, (newValue) => {
	if (newValue && wikiList.value.length === 0) {
		loadWikiData();
	}
});

// 데이터 로드
onMounted(() => {
	loadWikiData();
});
</script>

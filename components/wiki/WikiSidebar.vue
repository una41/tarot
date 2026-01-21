<template>
	<aside class="sidebar" :class="{ on: isMenuOpen }">
		<button class="btn_toggle" @click="$emit('toggle-menu')"></button>
		
		<!-- 검색 -->
		<div class="search">
			<input
				type="text"
				:value="searchQuery"
				@input="$emit('update:search-query', $event.target.value)"
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
				<!-- 아코디언 카테고리 헤더 -->
				<div class="nav_category_header" @click="$emit('toggle-category', category)">
					<span class="nav_category">{{ getKoreanCategory(category) }}</span>
					<span class="nav_category_arrow">
						{{ openCategories.has(category) ? '▼' : '▶' }}
					</span>
				</div>
				
				<!-- 아코디언 컨텐츠 -->
				<Transition name="slide">
					<ul v-show="openCategories.has(category)" class="nav_list">
						<li
							v-for="item in items"
							:key="item.id"
							:class="{ active: selectedItem?.id === item.id }"
							@click="$emit('select-item', item)"
						>
							{{ item.title }}
						</li>
					</ul>
				</Transition>
			</div>
			<p v-if="Object.keys(filteredGroupedList).length === 0" class="nav_empty">
				검색 결과가 없습니다.
			</p>
		</nav>
	</aside>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
	filteredGroupedList: {
		type: Object,
		required: true
	},
	selectedItem: {
		type: Object,
		default: null
	},
	openCategories: {
		type: Set,
		required: true
	},
	searchQuery: {
		type: String,
		default: ''
	},
	isMenuOpen: {
		type: Boolean,
		default: false
	}
});

defineEmits([
	'update:search-query',
	'select-item',
	'toggle-category',
	'toggle-menu',
	'close-menu'
]);

// 카테고리 영어명을 한글명으로 변환
const getKoreanCategory = (category) => {
	const mapping = {
		'basic': '타로 기초',
		'majors': '메이저 아르카나',
		'wands': '마이너 - 완드',
		'cups': '마이너 - 컵',
		'swords': '마이너 - 소드',
		'pentacles': '마이너 - 동전 or 펜타클'
	};
	return mapping[category] || category;
};
</script>

<style scoped>
/* 기본 스타일은 _wiki.scss에서 정의 */
/* 컴포넌트 특화 스타일만 여기에 정의 */

/* 아코디언 애니메이션은 _wiki.scss에 정의되어 있으므로 제거 */
/* 반응형 스타일도 _wiki.scss에 정의되어 있으므로 제거 */

/* 다만, 컴포넌트에서만 필요한 스타일 보완 */
.nav_category_header {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.nav_category {
	flex: 1;
}

.nav_category_arrow {
	font-size: 10px;
	transition: transform 0.2s;
}

.nav_list li {
	border-left: 3px solid transparent;
}

.nav_list li.active {
	border-left-color: #6a4e9c;
}
</style>

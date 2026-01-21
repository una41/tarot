<template>
	<main :class="'wrap_wiki '+ (selectedItem?.category || '')">
		<Transition name="fade" mode="out-in">
			<div v-if="selectedItem" :key="selectedItem.id" class="container">
				<div class="bx_navigation">
					<span class="txt_cate">{{ getKoreanCategory(selectedItem.category) }}</span>
				</div>
				<h2>{{ selectedItem.title }}</h2>
				<div class="contents" >
					<div class="bx_img" v-if="selectedItem.card_num !== -1" :style="{ background: 'url(\'/img/card/'+(selectedItem?.category || '') + '/' + selectedItem.card_num + '.jpg\') no-repeat 50% -4px'}"></div>
					<div class="content" v-html="formatContent(selectedItem.content)"></div>
				</div>
			</div>
			<div v-else class="contents empty">
				<p class="icon">📖</p>
				<p class="txt">왼쪽 목록에서 항목을 선택해주세요</p>
			</div>
		</Transition>
	</main>
</template>

<script setup>
defineProps({
	selectedItem: {
		type: Object,
		default: null
	},
	formatContent: {
		type: Function,
		required: true
	}
});

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


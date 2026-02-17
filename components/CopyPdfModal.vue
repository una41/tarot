<template>
	<Transition name="m_fade">
		<div v-if="show" class="modal copy_modal" @click="$emit('update:show', false)">
			<div class="m_container" @click.stop>
				<h2 class="m_title">{{ mode === 'copy' ? '복사할' : 'PDF로 저장할' }} 항목 선택</h2>
				<div class="copy_check_list">
					<label class="copy_check_all">
						<input type="checkbox" :checked="isAllChecked" @change="toggleAll" />
						<span>전체 선택</span>
					</label>
					<label v-for="item in sections" :key="item.key" :class="{ 'copy_check_sub': item.group }">
						<input type="checkbox" v-model="item.checked" />
						<span>{{ item.label }}</span>
					</label>
				</div>
				<div v-if="mode === 'pdf'" class="pdf_options">
					<div class="pdf_opt_row">
						<input type="text" class="ipt" v-model="clientName" placeholder="내담자 이름을 입력하세요" />
					</div>
					<p class="pdf_opt_info">* {{ isAppRoute ? '상호명을 변경하려면 앱 마이페이지에서 정보 수정을 부탁드려요' : '상호명을 변경하려면 상단 오른쪽 사람 아이콘에서 내정보 수정을 이용해주세요' }}</p>
					<div class="pdf_opt_row">
						<label>헤더 배경 색상</label>
						<div class="color_palette">
							<button v-for="c in colors" :key="c" class="color_chip" :class="{ active: headerColor === c }" :style="{ backgroundColor: c }" @click="headerColor = c" />
						</div>
					</div>
				</div>
				<div class="m_buttons">
					<button class="btn-cancel" @click="$emit('update:show', false)">취소</button>
					<button class="btn-confirm" @click="handleConfirm">{{ mode === 'copy' ? '복사' : 'PDF 저장' }}</button>
				</div>
			</div>
		</div>
	</Transition>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
	show: Boolean,
	mode: { type: String, default: 'copy' },
	sections: { type: Array, required: true },
});

const emit = defineEmits(['update:show', 'confirm']);

const route = useRoute();
const isAppRoute = computed(() => route.path.startsWith('/app'));

const clientName = ref('');
const headerColor = ref('#fbdf70');
const colors = ['#fbdf70', '#f8c4c4', '#c4daf8', '#c4f8d5', '#e8c4f8', '#f8e4c4', '#c4f0f8', '#f8f4c4'];

const isAllChecked = computed(() => props.sections.every(s => s.checked));
const toggleAll = () => {
	const val = !isAllChecked.value;
	props.sections.forEach(s => s.checked = val);
};

const handleConfirm = () => {
	emit('confirm', {
		clientName: clientName.value,
		headerColor: headerColor.value,
	});
};
</script>

<template>
	<Transition name="lm_fade">
		<div v-if="show" class="legal_modal" @click.self="$emit('close')">
			<div class="bg" @click="$emit('close')"></div>
			<div class="lm_wrap">
				<div class="lm_top">
					<h2>{{ type === 'terms' ? '이용약관' : '개인정보 처리방침' }}</h2>
					<button class="btn_close" @click="$emit('close')"><span>닫기</span></button>
				</div>
				<div class="lm_cont">
					<LegalContent :type="type" />
				</div>
			</div>
		</div>
	</Transition>
</template>

<script setup>
defineProps({
	show: { type: Boolean, default: false },
	type: { type: String, default: 'terms' }
});
defineEmits(['close']);
</script>

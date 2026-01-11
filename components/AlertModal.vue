<template>
	<Transition name="m_fade">
		<div v-if="store.alertData.isVisible" class="modal" @click="handleClose">
			<div class="m_container" @click.stop>
				<div class="m_icon" v-if="store.alertData.icon !== ''" v-html="store.alertData.icon"></div>
				<h2 class="m_title" v-if="store.alertData.title !== ''" v-html="store.alertData.title"></h2>
				<p class="m_message" v-if="store.alertData.message !== ''" v-html="store.alertData.message"></p>
				<div class="m_buttons">
					<button class="btn-confirm" @click="handleClose">
						{{ store.alertData.confirmText }}
					</button>
				</div>
			</div>
		</div>
	</Transition>
</template>

<script setup>
import { useTarotStore } from '~/stores/tarot';
import { onMounted, onUnmounted, watch } from 'vue';

const store = useTarotStore();

const handleClose = () => {
	store.closeAlert();
};

const handleKeyDown = (event) => {
	if (!store.alertData.isVisible) return;

	if (event.key === 'Enter' || event.key === 'Escape') {
		event.preventDefault();
		handleClose();
	}
};

// 모달이 열릴 때 이벤트 리스너 추가
watch(() => store.alertData.isVisible, (isVisible) => {
	if (isVisible) {
		window.addEventListener('keydown', handleKeyDown);
	} else {
		window.removeEventListener('keydown', handleKeyDown);
	}
});

// 컴포넌트 언마운트 시 정리
onUnmounted(() => {
	window.removeEventListener('keydown', handleKeyDown);
});
</script>

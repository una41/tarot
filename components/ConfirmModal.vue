<template>
	<Transition name="m_fade">
		<div v-if="store.confirmData.isVisible" class="modal" @click="handleCancel">
			<div class="m_container" @click.stop>
				<div class="m_icon" v-html="store.confirmData.icon"></div>
				<h2 class="m_title" v-html="store.confirmData.title"></h2>
				<p class="m_message" v-if="store.confirmData.message !== ''" v-html="store.confirmData.message"></p>

				<div class="m_buttons">
					<button class="btn-cancel" @click="handleCancel">
						{{ store.confirmData.cancelText }}
					</button>
					<button class="btn-confirm" @click="handleConfirm">
						{{ store.confirmData.confirmText }}
					</button>
				</div>
			</div>
		</div>
	</Transition>
</template>

<script setup>
import { useTarotStore } from '~/stores/tarot';
import { onUnmounted, watch } from 'vue';

const store = useTarotStore();

const handleConfirm = () => {
	store.handleConfirm();
};

const handleCancel = () => {
	store.handleCancel();
};

const handleKeyDown = (event) => {
	if (!store.confirmData.isVisible) return;

	if (event.key === 'Enter') {
		event.preventDefault();
		handleConfirm();
	} else if (event.key === 'Escape') {
		event.preventDefault();
		handleCancel();
	}
};

// 모달이 열릴 때 이벤트 리스너 추가
watch(() => store.confirmData.isVisible, (isVisible) => {
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

<style lang="scss" scoped>
/* 모달 오버레이 */

</style>

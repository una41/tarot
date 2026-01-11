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

const store = useTarotStore();

const handleClose = () => {
	store.closeAlert();
};
</script>

<template>
	<div :class="['bx_radio', 'on_' + store.picked]">
		<div v-for="(item, i) in store.radio" :key="item.id + '_' + i" class="unit">
			<input 
				type="radio" 
				:id="item.id" 
				:value="item.id" 
				v-model="store.picked" 
				class="radio" 
			/>
			<label 
				:for="item.id" 
				class="label" 
				@click="store.fnReset"
			>
				{{ item.text }}
			</label>
		</div>
	</div>
</template>

<script setup>
	import { useTarotStore } from '~/stores/tarot'
	const store = useTarotStore();
</script>
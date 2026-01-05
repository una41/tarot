<template>
	<div class="wrap">
		<h1>tarot card</h1>
		<div class="main">
			<div class="f_wrap">
				<TarotTabs/>
				<TarotInput/>
			</div>
		</div>
		<TarotResult :data="store.picked === 'r1'? birthData : yearData" v-if="store.result !== null"/>
	</div>
</template>
<script setup>
	//Store
	import { useTarotStore } from '~/stores/tarot'
	const store = useTarotStore();
	// 데이터 가져오기 (GET)
	const { data: birthData } = await useFetch('/api/data?type=birth');
	const { data: yearData } = await useFetch('/api/data?type=year');
</script>
<template>
	<div class="wrap">
		<div class="header">
			<h1>tarot card</h1>
			<button class="logout-btn" @click="showLogoutModal">Logout</button>
		</div>
		<div class="main">
			<div class="f_wrap">
				<TarotTabs/>
				<TarotInput/>
			</div>
		</div>
		<!-- <TarotProResult v-if="store.result !== null && !store.isReading" :data="store.picked === 'r1'? proBirthData : proYearData"/> -->
		<!-- <TarotResult v-else-if="store.result !== null" :data="store.picked === 'r1'? birthData : yearData"/> -->
		<transition name="fade">
			<TarotProResult
				v-if="store.result !== null && store.picked === 'r1' && !store.isReading"
				:data="proBirthData"
			/>

			<TarotResult
				v-else-if="store.result !== null && store.picked === 'r1' && store.isReading"
				:data="birthData"
			/>

			<TarotProResultYear
				v-else-if="store.result !== null && store.picked === 'r2' && !store.isReading"
				:data="proYearData"
			/>
			<TarotResultYear
				v-else-if="store.result !== null && store.picked === 'r2' && store.isReading"
				:data="yearData"
			/>
		</transition>

	</div>
</template>
<script setup>
	//Store
	import { useTarotStore } from '~/stores/tarot'
	const store = useTarotStore();
	// 데이터 가져오기 (GET)
	const { data: proBirthData } = await useFetch('/data/pro_birth.json');
	const { data: proYearData } = await useFetch('/data/pro_year.json');
	const { data: birthData } = await useFetch('/data/birth.json');
	const { data: yearData } = await useFetch('/data/year.json');

	onMounted(() => {
		// 앱이 로드될 때 쿠키를 다시 확인
		store.checkAuth();
	});

	// 로그아웃 모달 표시
	const showLogoutModal = () => {
		store.showConfirm({
			title: '운명의 길을 닫으시겠습니까?',
			icon: '🌙',
			confirmText: '로그아웃',
			cancelText: '취소',
			onConfirm: () => {
				store.fnLogout();
			}
		});
	};
</script>

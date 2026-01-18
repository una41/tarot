<template>
	<div class="wrap">
		<header class="header">
			<div class="left">
				<h1 class="l_logo">numerologyTarot</h1>
				<p>수비학으로 보는 타로카드</p>
			</div>
			<div class="right">
				<span class="user_grade" :class="gradeClass">{{ store.userGrade }}</span>
				<button class="btn_logout" @click="showLogoutModal">Logout</button>
			</div>
		</header>
		<div class="main">
			<div class="f_wrap">
				<Tabs/>
				<Input/>
			</div>
		</div>
		<!-- <TarotProResult v-if="store.result !== null && !store.isReading" :data="store.picked === 'r1'? proBirthData : proYearData"/> -->
		<!-- <ReadingBirthResult v-else-if="store.result !== null" :data="store.picked === 'r1'? birthData : yearData"/> -->
		<transition name="fade">
			<ProBirthResult
				v-if="store.result !== null && store.picked === 'r1' && !store.isReading"
				:data="proBirthData"
			/>

			<ReadingBirthResult
				v-else-if="store.result !== null && store.picked === 'r1' && store.isReading"
				:data="birthData"
			/>

			<ProYearResult
				v-else-if="store.result !== null && store.picked === 'r2' && !store.isReading"
				:data="proYearData"
			/>
			<ReadingYearResult
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

	// 회원 등급에 따른 클래스
	const gradeClass = computed(() => {
		const grade = store.userGrade;
		if (grade === '마스터') return 'master';
		if (grade === '프로') return 'pro';
		return 'normal';
	});

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

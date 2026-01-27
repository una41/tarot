<template>
	<div class="wrap">
		<header class="header">
			<div class="left">
				<h1 class="l_logo">numerologyTarot</h1>
				<p>수비학으로 보는 타로카드</p>
			</div>
			<div class="right">
				<div class="user_menu" :class="{ on: isUserMenuOpen }">
					<button type="button" class="btn_user" @click="isUserMenuOpen = !isUserMenuOpen"></button>
					<div class="user_dropdown">
						<div class="user_info">{{ userName }}님 <span class="user_grade" :class="gradeClass">{{ store.userGrade }}</span></div>
						<button type="button" class="btn_logout" @click.stop="showLogoutModal">로그아웃</button>
					</div>
				</div>
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
	<!-- 마스터/프로 전용 위키 플로팅 버튼 -->
	<div v-if="['마스터', '프로'].includes(store.userGrade)" class="wiki-floating-btn" @click="store.goToWikiMain">
		<span>Wiki→</span>
	</div>
</template>
<script setup>
	//Store
	import { ref, computed, onMounted, onUnmounted } from 'vue';
	import { useTarotStore } from '~/stores/tarot'
	const store = useTarotStore();
	// 데이터 가져오기 (GET)
	const { data: proBirthData } = await useFetch('/data/pro_birth.json');
	const { data: proYearData } = await useFetch('/data/pro_year.json');
	const { data: birthData } = await useFetch('/data/birth.json');
	const { data: yearData } = await useFetch('/data/year.json');

	// 유저 메뉴 토글
	const isUserMenuOpen = ref(false);

	// 유저 이름 (Firestore에서 가져온 이름)
	const userName = computed(() => {
		return store.user?.name || '사용자';
	});

	// 회원 등급에 따른 클래스
	const gradeClass = computed(() => {
		const grade = store.userGrade;
		if (grade === '마스터') return 'master';
		if (grade === '프로') return 'pro';
		return 'normal';
	});

	// 바깥 클릭 시 유저 메뉴 닫기
	const closeUserMenu = (e) => {
		if (!e.target.closest('.user_menu')) {
			isUserMenuOpen.value = false;
		}
	};

	onMounted(() => {
		// 앱이 로드될 때 쿠키를 다시 확인
		store.checkAuth();
		// 바깥 클릭 이벤트 등록
		document.addEventListener('click', closeUserMenu);
	});

	onUnmounted(() => {
		document.removeEventListener('click', closeUserMenu);
	});

	// 로그아웃 모달 표시
	const showLogoutModal = () => {
		isUserMenuOpen.value = false;
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

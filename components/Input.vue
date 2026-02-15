<template>
	<div>
		<div class="wrap_chk">
				<div class="bx_chk">
					<input type="checkbox" id="chk1" class="chk" v-model="store.isReading" @change="store.isReading && (store.isTalk = false)">
					<label for="chk1">리딩용</label>
				</div>
				<div class="bx_chk"  v-if="store.isLeading">
					<input type="checkbox" id="chk2" class="chk" v-model="store.isTalk" @change="store.isTalk && (store.isReading = false)">
					<label for="chk2">톡상담</label>
				</div>
		</div>
		<div class="c_wrap" v-if="'r1' == store.picked">
			<form @submit.prevent="store.fnBirthCalc">
				<div class="bx_ipt">
					<input v-model="store.ipt_birth8" type="text" placeholder="예: 19990101" maxlength="8" class="ipt" />
				</div>
				<div class="bx_btn">
					<button class="btn"><b>생일카드 보기</b></button>
				</div>
			</form>
		</div>
		<div class="c_wrap c_year" v-else>
			<form @submit.prevent="store.fnYearCalc">
				<div class="bx_ipt">
					<input key="year" v-model="store.ipt_year" type="text" placeholder="연도(2026)" maxlength="4" class="ipt"/>
					<input key="birth" v-model="store.ipt_birth4" type="text" placeholder="생일(0130)" maxlength="4" class="ipt"/>
				</div>
				<p class="desc">💡 운세 볼 연도를 입력하세요</p>
				<div class="bx_btn">
					<button class="btn"><b>해운카드 보기</b></button>
				</div>
			</form>
		</div>
	</div>
</template>

<script setup>
	import { useTarotStore } from '~/stores/tarot'
	const store = useTarotStore()
</script>
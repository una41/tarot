<template>
	<div>
		<div class="bx_chk" v-if="store.picked === 'r1'">
			<input type="checkbox" id="chk1" class="chk" v-model="store.isReading">
			<label for="chk1">리딩용</label>
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
					<input v-model="store.ipt_year" type="text" placeholder="연도(2026)" maxlength="4" class="ipt"/>
					<input v-model="store.ipt_birth4" type="text" placeholder="생일(0130)" maxlength="4" class="ipt"/>
				</div>
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
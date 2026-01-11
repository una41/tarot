<template>
	<div class="login">
		<div class="l_wrap">
			<div class="icon">🔮</div>
			<h2 class="tit">운명의 문을 여세요</h2>
			<div class="l_form">
				<input class="ipt" v-model="id" type="text" placeholder="아이디" @keyup.enter="fnleLogin" />
				<input class="ipt" v-model="pw" type="password" placeholder="비밀번호" @keyup.enter="fnleLogin" />
				<button class="btn" @click="fnleLogin">운명 확인하기</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue';
import { useTarotStore } from '~/stores/tarot';

const store = useTarotStore();

const id = ref('');
const pw = ref('');

const fnleLogin = () => {
	if (!id.value || !pw.value) {
		store.showAlert({
			title: '',
			message: '아이디와 비밀번호를 입력해주세요.',
			icon: '🌙'
		});
		return;
	}

	const success = store.fnLogin(id.value, pw.value);
	if (success) {
		// 로그인 성공 시 자동으로 메인 페이지로 전환됨 (app.vue의 v-if 조건)
	} else {
		store.showAlert({
			title: '로그인 실패',
			message: '아이디 또는 비밀번호가 일치하지 않습니다.',
			icon: '🌙'
		});
		pw.value = ''; // 비밀번호 입력창 초기화
	}
};
</script>

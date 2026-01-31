<template>
	<header class="header">
		<h1><button class="logo" @click="goToAdmin">회원 관리</button></h1>
		<button class="btn_back" @click="goToMain">numerologyTarot→</button>
	</header>
</template>

<script setup>
const emit = defineEmits(['go-back']);

const goToAdmin = () => {
	location.href = '/admin';
};

const goToMain = () => {
	window.open('/', '_blank');
};
</script>

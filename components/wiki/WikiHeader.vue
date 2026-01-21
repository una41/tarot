<template>
	<header class="header">
		<h1><button class="logo" @click="goToWikiMain">타로 Wiki</button></h1>
		<button class="btn_back" @click="goToMain">numerologyTarot→</button>
	</header>
</template>

<script setup>
const goToWikiMain = () => {
	location.href = '/wiki';
};

const goToMain = () => {
	window.open('/', '_blank');
};
</script>

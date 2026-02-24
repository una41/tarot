<template>
	<div class="legal_page">
		<div class="legal_page_wrap">
			<div class="lp_top">
				<button class="btn-back" @click="$router.back()">← 돌아가기</button>
				<h1>이용약관</h1>
				<p class="update_date">최종 수정일: 2026년 2월 19일</p>
			</div>
			<div class="lp_cont">
				<LegalContent type="terms" />
			</div>
		</div>
	</div>
</template>

<script setup>
useHead({ title: '이용약관 | numerologyTarot' });
</script>

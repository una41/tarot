<template>
	<div class="legal_page">
		<div class="legal_page_wrap">
			<div class="lp_top">
				<button class="btn-back" @click="$router.back()">← 돌아가기</button>
				<h1>개인정보 처리방침</h1>
				<p class="update_date">최종 수정일: 2026년 2월 19일</p>
			</div>
			<div class="lp_cont">
				<LegalContent type="privacy" />
			</div>
		</div>
	</div>
</template>

<script setup>
useHead({ title: '개인정보 처리방침 | numerologyTarot' });
</script>

<template>
	<div class="page_paywall">
		<div class="bx_paywall">
			<div class="paywall_header">
				<div class="paywall_logo">
					<img src="https://img.numerologytarot.uk/web/img/icon_ball.png?v=260219" class="ico_ball" alt="" />
				</div>
				<h1 class="tit_paywall">앱 정기구독 안내</h1>
			</div>

			<div class="bx_paywall_desc">
				<p class="txt_paywall_desc">더 완벽한 서비스 유지와 지속적인 성장을 위해<br>구독제로 운영되고 있습니다.</p>
				<p class="txt_paywall_desc">보내주시는 응원은 더 좋은 콘텐츠와<br>안정적인 앱 환경으로 보답하겠습니다.</p>
				<p class="txt_paywall_desc">회원님과 함께 성장하는<br>부자사관학교 타로가 되겠습니다.</p>
			</div>

			<button class="btn_paywall_subscribe" @click="fnSubscribe">구독하기</button>

			<button class="btn_paywall_logout" @click="fnLogout">로그아웃</button>
		</div>
	</div>
</template>

<script setup>
import { useTarotStore } from '~/stores/tarot'

const store = useTarotStore()

const fnSubscribe = () => {
	window.ReactNativeWebView?.postMessage(JSON.stringify({
		type: 'subscribe',
		isTrial: false,
		uid: store.user?.uid || '',
		email: store.user?.email || '',
		name: store.user?.name || '',
	}))
}

const fnLogout = () => {
	store.showConfirm({
		title: '로그아웃',
		message: '로그아웃 하시겠습니까?',
		icon: '👋',
		onConfirm: async () => {
			await store.fnLogout()
			window.ReactNativeWebView?.postMessage(JSON.stringify({ login: false }))
			navigateTo('/')
		}
	})
}
</script>

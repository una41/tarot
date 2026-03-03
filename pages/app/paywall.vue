<template>
	<div class="page_paywall">
		<div class="bx_paywall">
			<div class="paywall_header">
				<div class="paywall_logo">
					<img src="/img/icon_ball.png" class="ico_ball" alt="" />
				</div>
				<h1 class="tit_paywall">앱 이용 안내</h1>
			</div>
			<div class="bx_paywall_desc">
				<p class="txt_paywall_desc">안녕하세요!! 현재 저희 앱은 테스트 기간입니다.</p>
				<p class="txt_paywall_desc">정식 오픈 시 좋은 서비스와 지속적인 성장을 위해 앱은 구독제로 운영될 예정입니다.</p>
				<p class="txt_paywall_desc">테스트 기간 보내주시는 소중한 의견은 더 좋은 콘텐츠와 안정적인 환경으로 보답하겠습니다.</p>
				<!-- <p class="txt_paywall_desc">서비스 유지와 지속적인 성장을 위해<br>저희 앱은 구독제로 운영되고 있습니다.</p> -->
				<!-- <p class="txt_paywall_desc">보내주시는 응원은 더 좋은 콘텐츠와<br>안정적인 앱 환경으로 보답하겠습니다.</p> -->
				<!-- <p class="txt_paywall_desc">함께 성장하는<br>부자사관학교 타로앱이 되겠습니다.</p> -->
			</div>

<!-- 
			<div class="bx_paywall_desc">
				<p class="txt_paywall_desc">더 완벽한 서비스 유지와 지속적인 성장을 위해<br>구독제로 운영되고 있습니다.</p>
				<p class="txt_paywall_desc">보내주시는 응원은 더 좋은 콘텐츠와<br>안정적인 앱 환경으로 보답하겠습니다.</p>
				<p class="txt_paywall_desc">함께 성장하는<br>부자사관학교 타로앱이 되겠습니다.</p>
			</div> -->
			<button class="btn_paywall_subscribe" @click="fnNavigateToMain">서비스 이용하기</button>
			<!-- <button class="btn_paywall_subscribe" @click="fnSubscribe">구독하기</button> -->

			<!-- <button class="btn_paywall_logout" @click="fnLogout">로그아웃</button> -->
		</div>
	</div>
</template>

<script setup>
import { useTarotStore } from '~/stores/tarot'
import Cookies from 'js-cookie'

const store = useTarotStore()

// 서비스 이용하기 클릭: 로그아웃 전까지 페이월 재진입 방지
const fnNavigateToMain = async () => {
	store.paywallAccepted = true
	Cookies.set('paywall_accepted', '1', { expires: 30, path: '/' })
	store.setAppLoading(true)
	await new Promise(resolve => setTimeout(resolve, 200))
	store.setAppLoading(false)
	navigateTo('/')
}

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

<template>
	<div class="pdf_page">
		<p class="env_info">{{ isWebView ? '앱 웹뷰 환경' : '브라우저 환경' }}</p>
		<div ref="pdfContent" class="pdf_area">
			<p class="pdf_text">test</p>
		</div>
		<button class="btn_download" @click="fnDownload" :disabled="isLoading">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#fff" viewBox="0 0 16 16">
				<path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
				<path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"/>
			</svg>
			<span>{{ isLoading ? 'PDF 생성 중...' : 'PDF 다운로드' }}</span>
		</button>
		<div v-if="logs.length" class="log_area">
			<p class="log_title">디버그 로그</p>
			<p v-for="(log, i) in logs" :key="i" class="log_item" :class="log.type">{{ log.msg }}</p>
		</div>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue';

const pdfContent = ref(null);
const isLoading = ref(false);
const logs = ref([]);

const isWebView = computed(() => !!window.ReactNativeWebView);

const addLog = (msg, type = 'info') => {
	logs.value.push({ msg: `[${type.toUpperCase()}] ${msg}`, type });
};

const fnDownload = async () => {
	if (isLoading.value) return;
	isLoading.value = true;
	logs.value = [];

	try {
		addLog('PDF 생성 시작');

		addLog('html2canvas 로딩...');
		const html2canvas = (await import('html2canvas')).default;
		addLog('html2canvas 로딩 완료');

		addLog('jsPDF 로딩...');
		const { jsPDF } = await import('jspdf');
		addLog('jsPDF 로딩 완료');

		const el = pdfContent.value;
		if (!el) {
			addLog('pdfContent ref가 없습니다', 'error');
			alert('[오류] pdfContent ref가 없습니다');
			return;
		}

		addLog('캔버스 캡처 중...');
		const canvas = await html2canvas(el, {
			scale: 3,
			useCORS: true,
			backgroundColor: '#ffffff',
		});
		addLog(`캔버스 캡처 완료 (${canvas.width}x${canvas.height})`);

		const imgData = canvas.toDataURL('image/jpeg', 1.0);
		addLog(`이미지 데이터 생성 완료 (${Math.round(imgData.length / 1024)}KB)`);

		const pdf = new jsPDF('p', 'mm', 'a4');
		const imgWidth = 210;
		const imgHeight = (canvas.height * imgWidth) / canvas.width;
		pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
		addLog('PDF 페이지 구성 완료');

		// 앱 웹뷰 환경
		if (window.ReactNativeWebView) {
			addLog('앱 웹뷰 감지 → base64로 전송 시도');
			try {
				const base64 = pdf.output('datauristring');
				addLog(`base64 생성 완료 (${Math.round(base64.length / 1024)}KB)`);

				window.ReactNativeWebView.postMessage(JSON.stringify({
					type: 'pdf',
					filename: 'test.pdf',
					data: base64,
				}));
				addLog('앱으로 PDF 데이터 전송 완료', 'success');
				alert('[성공] 앱으로 PDF 데이터를 전송했습니다.');
			} catch (e) {
				addLog(`앱 전송 실패: ${e.message}`, 'error');
				alert(`[오류] 앱 전송 실패: ${e.message}`);
			}
		} else {
			// 브라우저 환경
			addLog('브라우저 환경 → pdf.save() 시도');
			try {
				pdf.save('test.pdf');
				addLog('PDF 저장 완료', 'success');
				alert('[성공] PDF 다운로드 완료');
			} catch (e) {
				addLog(`브라우저 저장 실패: ${e.message}`, 'error');
				alert(`[오류] 브라우저 저장 실패: ${e.message}`);
			}
		}
	} catch (e) {
		addLog(`전체 오류: ${e.message}`, 'error');
		alert(`[오류] PDF 생성 실패\n${e.message}\n\n${e.stack || ''}`);
	} finally {
		isLoading.value = false;
	}
};
</script>

<style lang="scss" scoped>
.pdf_page {
	width: 100%;
	min-height: 100dvh;
	background: #f5f0e8;
	padding: 55px 20px 50px;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20px;

	.env_info {
		font-size: 0.8rem;
		color: #8b7355;
		background: #fff;
		padding: 6px 16px;
		border-radius: 20px;
	}

	.pdf_area {
		width: 100%;
		max-width: 500px;
		background: #fff;
		border-radius: 12px;
		padding: 40px 30px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
		text-align: center;

		.pdf_text {
			font-size: 2rem;
			font-weight: 700;
			color: #2d2015;
		}
	}

	.btn_download {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		width: 100%;
		max-width: 500px;
		padding: 16px 0;
		border: none;
		border-radius: 12px;
		background: #5c4033;
		cursor: pointer;
		transition: all 300ms;

		span {
			font-size: 1rem;
			color: #fff;
			font-weight: 500;
		}

		&:hover {
			background: #7a5a48;
		}
		&:active {
			background: #4a3228;
		}
		&:disabled {
			background: #a89888;
			cursor: not-allowed;
		}
	}

	.log_area {
		width: 100%;
		max-width: 500px;
		background: #1a1a1a;
		border-radius: 10px;
		padding: 16px;
		max-height: 300px;
		overflow-y: auto;

		.log_title {
			font-size: 0.75rem;
			color: #888;
			margin-bottom: 8px;
			text-transform: uppercase;
			letter-spacing: 1px;
		}

		.log_item {
			font-size: 0.8rem;
			color: #ccc;
			font-family: monospace;
			line-height: 1.6;
			word-break: break-all;

			&.error {
				color: #f87171;
			}
			&.success {
				color: #4ade80;
			}
		}
	}
}
</style>

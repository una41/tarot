<template>
	<main :class="'wrap_wiki '+ (selectedItem?.category || '')">
		<Transition name="fade" mode="out-in">
			<div v-if="selectedItem" :key="selectedItem.id" class="container" ref="pdfContent">
				<!-- PDF 전용 헤더 (화면에는 안보임) -->
				<div class="pdf_only_header" style="display: none;">
					<p class="corp">{{ (store.userCorpName || '').trim() || 'Numerology Tarot' }}</p>
					<p class="txt_sm">타로 위키</p>
					<h2>{{ selectedItem.title }}</h2>
					<div class="sub_tit">{{ getKoreanCategory(selectedItem.category) }}</div>
				</div>

				<div class="bx_navigation">
					<span class="txt_cate">{{ getKoreanCategory(selectedItem.category) }}</span>
				</div>
				<div class="wiki_gnb">
					<button class="btn_copy" @click="openModal('copy')">📋복사</button>
					<!-- <button class="btn_pdf" @click="openModal('pdf')">💾PDF</button> -->
				</div>
				<div class="wiki_com_top">
					<h2>{{ selectedItem.title }}</h2>
				</div>
				<div class="contents">
					<div class="bx_img" v-if="selectedItem.card_num !== -1" :style="{ background: 'url(\'/img/card/'+(selectedItem?.category || '') + '/' + selectedItem.card_num + '.jpg?v=1\') no-repeat 50% -4px'}"></div>
					<div class="content" v-html="formatContent(selectedItem.content)"></div>
				</div>
			</div>
			<div v-else class="contents empty">
				<p class="icon">📖</p>
				<p class="txt">왼쪽 목록에서 항목을 선택해주세요</p>
			</div>
		</Transition>

		<!-- 복사/PDF 모달 -->
		<CopyPdfModal v-model:show="showCopyModal" :mode="modalMode" :sections="copySections" @confirm="handleModalConfirm" />
	</main>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { useTarotStore } from '~/stores/tarot';

const store = useTarotStore();

const props = defineProps({
	selectedItem: {
		type: Object,
		default: null
	},
	formatContent: {
		type: Function,
		required: true
	}
});

// 카테고리 영어명을 한글명으로 변환
const getKoreanCategory = (category) => {
	const mapping = {
		'basic': '타로 기초',
		'majors': '메이저 아르카나',
		'wands': '마이너 - 완드',
		'cups': '마이너 - 컵',
		'swords': '마이너 - 소드',
		'pentacles': '마이너 - 동전 or 펜타클'
	};
	return mapping[category] || category;
};

// 복사/PDF 모달
const showCopyModal = ref(false);
const modalMode = ref('copy');
const copySections = reactive([]);
const clientName = ref('');
const headerColor = ref('#fbdf70');
const pdfContent = ref(null);

// selectedItem 변경 시 copySections 재구성
watch(() => props.selectedItem, (item) => {
	copySections.length = 0;
	if (!item?.content) return;

	const parser = new DOMParser();
	const doc = parser.parseFromString(item.content, 'text/html');
	const units = doc.querySelectorAll('.unit');

	units.forEach((unit, i) => {
		const h3 = unit.querySelector('h3');
		copySections.push({
			key: `unit_${i}`,
			label: h3?.textContent?.trim()?.replace(/^🪄\s*/, '') || `섹션 ${i + 1}`,
			checked: true,
		});
	});
}, { immediate: true });

const openModal = (mode) => {
	copySections.forEach(s => s.checked = true);
	modalMode.value = mode;
	showCopyModal.value = true;
};

const handleModalConfirm = ({ clientName: name, headerColor: color }) => {
	clientName.value = name;
	headerColor.value = color;
	showCopyModal.value = false;
	if (modalMode.value === 'copy') doCopy();
	else downloadPDFWithSelection();
};

const stripHtml = (html) => {
	if (!html) return '';
	const tmp = document.createElement('div');
	tmp.innerHTML = html;
	return tmp.textContent || '';
};

const doCopy = async () => {
	const item = props.selectedItem;
	if (!item) return;

	const lines = [];
	lines.push(`[${item.title}]`);
	lines.push(`카테고리: ${getKoreanCategory(item.category)}`);
	lines.push('');

	const parser = new DOMParser();
	const doc = parser.parseFromString(item.content, 'text/html');
	const units = doc.querySelectorAll('.unit');

	units.forEach((unit, i) => {
		if (!copySections[i]?.checked) return;
		const h3 = unit.querySelector('h3');
		const uCont = unit.querySelector('.u_cont');

		if (h3) lines.push(`[${h3.textContent.trim()}]`);
		if (uCont) lines.push(stripHtml(uCont.innerHTML));
		lines.push('');
	});

	try {
		await navigator.clipboard.writeText(lines.join('\n'));
		store.showAlert({ message: '선택한 항목이 복사되었습니다.', icon: '✅', type: 'success' });
	} catch (e) {
		console.error('복사 실패:', e);
		store.showAlert({ message: '복사에 실패했습니다.', icon: '❌', type: 'error' });
	}
};

const downloadPDFWithSelection = async () => {
	if (!pdfContent.value) return;

	const el = pdfContent.value;
	const hiddenEls = [];

	// 체크 안된 unit 숨기기
	const units = el.querySelectorAll('.content .unit');
	units.forEach((unit, i) => {
		if (!copySections[i]?.checked) {
			unit.style.display = 'none';
			hiddenEls.push(unit);
		}
	});

	// CSS 변수 설정
	const corpName = (store.userCorpName || '').trim();
	if (corpName) {
		el.style.setProperty('--watermark-text', `"${corpName}"`);
	}
	el.style.setProperty('--pdf-header-color', headerColor.value);

	try {
		const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
			import('html2canvas'),
			import('jspdf')
		]);

		// PDF 전용 헤더 표시, 화면용 요소 숨김
		const pdfHeader = el.querySelector('.pdf_only_header');
		const navigation = el.querySelector('.bx_navigation');
		const titleRow = el.querySelector('.wiki_com_top');
		if (pdfHeader) pdfHeader.style.display = 'block';
		if (navigation) { navigation.style.display = 'none'; hiddenEls.push(navigation); }
		if (titleRow) { titleRow.style.display = 'none'; hiddenEls.push(titleRow); }

		// PDF용 single column
		const contents = el.querySelector('.contents');
		const origColumnCount = contents?.style.columnCount;
		if (contents) contents.style.columnCount = '1';

		const originalScrollTop = window.pageYOffset;
		window.scrollTo(0, 0);
		await new Promise(resolve => setTimeout(resolve, 100));

		const canvas = await html2canvas(el, {
			scale: 2, useCORS: true, logging: false,
			scrollY: 0, scrollX: 0,
			height: el.scrollHeight, windowHeight: el.scrollHeight,
			allowTaint: true, backgroundColor: '#ffffff'
		});

		const imgData = canvas.toDataURL('image/jpeg', 0.98);
		const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
		const pdfWidth = 210, pdfHeight = 297, margin = 10;
		const imgWidth = pdfWidth - (margin * 2);
		const imgHeight = (canvas.height * imgWidth) / canvas.width;
		let heightLeft = imgHeight, position = margin;

		pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
		heightLeft -= (pdfHeight - margin);
		while (heightLeft > 0) {
			position = -(imgHeight - heightLeft) + margin;
			pdf.addPage();
			pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
			heightLeft -= (pdfHeight - margin);
		}

		const safeTitle = props.selectedItem.title.replace(/[/\\:*?"<>|]/g, '_');
		pdf.save(`위키_${safeTitle}.pdf`);

		// 복원
		if (pdfHeader) pdfHeader.style.display = 'none';
		if (contents) contents.style.columnCount = origColumnCount || '';
		window.scrollTo(0, originalScrollTop);
	} catch (error) {
		console.error('PDF 생성 오류:', error);
		store.showAlert({ message: 'PDF 생성 중 오류가 발생했습니다.', icon: '❌', type: 'error' });
	}

	// CSS 변수 제거 & 숨김 복원
	el.style.removeProperty('--watermark-text');
	el.style.removeProperty('--pdf-header-color');
	hiddenEls.forEach(e => e.style.display = '');
};
</script>

<template>
	<Transition name="fade">
		<div class="result result_reading_year"  @click.stop>
			<div class="bg" @click="store.fnClose"></div>
			<div v-if="store.result !== null" class="r_wrap result_birth" ref="pdfContent">
				<!-- PDF 전용 헤더 (화면에는 안보임) -->
				<div class="pdf_only_header" style="display: none;">
					<p class="corp">{{ (store.userCorpName || '').trim() || 'Numerology Tarot' }}</p>
					<p class="txt_sm">수비학 타로</p>
					<h2>
						<template v-if="clientName.trim()">{{ clientName.trim() }}님 </template>{{ store.ipt_year }}년 해운카드 리딩 리포트
					</h2>
					<div class="sub_tit">
						생년월일: {{ f_BirthMD }}
					</div>
				</div>
				<div class="r_top colb">
					<div class="c_left">
						<h3>{{ store.ipt_year + '년 해운카드' }} <b class="pc">결과</b> <span>(리딩)</span></h3>
					</div>
					<div class="c_right">
						<button class="btn_close" @click="store.fnClose"><span>닫기</span></button>
					</div>
					<div class="gnb">
						<!-- <button class="btn_copy" @click="openModal('copy')">📋복사</button>
						<button class="btn_pdf" @click="openModal('pdf')">💾PDF</button> -->
						<button class="link" @click="store.fnGo('result')">🔗 해석</button>
					</div>
				</div>
				<div class="r_cont">
					<h3 class="main_card_tit">
						{{ store.result }}번 - <div class="tit" v-html="data.list[store.result].name"></div>
					</h3>
					<div class="col2">
						<div class="left">
							<div class="bx_img">
								<img :src="'https://img.numerologytarot.uk/web/img/card/majors/' + store.result + '.jpg'" :alt="store.result + '번 ' + data.list[store.result].name" />
							</div>
							<button v-if="['마스터', '프로'].includes(store.userGrade)" class="btn hidden_app" @click="store.goToWiki(store.result, 'majors')">고유 설명 보기</button>
						</div>
						<div class="right">
							<div class="r_colb" v-if="data.list[store.result].lucky_group">
								<dl class="info_birth mt0">
									<dt>해운년도</dt>
									<dd>{{ store.ipt_year }}</dd>
								</dl>
								<dl class="mt0">
									<dt>운</dt>
									<dd><span :class="'txt_bg ' + data.list[store.result].lucky_group.grade">{{ data.list[store.result].lucky_group.grade }}</span></dd>
								</dl>
							</div>
							<div class="r_colb" v-if="data.list[store.result].lucky_group">
								<dl>
									<dt>생일</dt>
									<dd>{{ f_BirthMD }}</dd>
								</dl>
								<dl>
									<dt>좋은 분기</dt>
									<dd>{{ data.list[store.result].lucky_group.lucky_timing }}</dd>
								</dl>
							</div>
							<div class="summary_box hr">
								<h5 class="sub_tit">{{ store.ipt_year }}년 요약</h5>
								<ul class="cont">
									<li v-for="(item, i) in data.list[store.result].summary.cont" :key="i" v-html="item"></li>
								</ul>
							</div>
							<div class="bx_key">
								<span class="tag" v-for="word in data.list[store.result].keywords" :key="word">{{ word +" "}}</span>
							</div>
							<div class="bx_tip reading_tip">
								<h6>💡타로 리딩팁</h6>
								<ul class="t_cont">
									<li><b>질문하기</b> : 내담자가 직접 카드의 느낌을 말하게 유도하세요.</li>
									<li><b>연결하기</b> : 키워드를 내담자의 현실과 연결해 하나의 이야기로 만드세요.</li>
									<li><b>행동하기</b> : 고민 해결을 위한 구체적인 실천 방안을 함께 찾으세요.</li>
									<li><b>본질찾기</b> : 숨겨진 진짜 욕구와 고유한 기질을 짚어주세요.</li>
								</ul>
							</div>
						</div>
					</div>
					<div class="detail">
						<div class="area">
							<div class="item summary" v-if="data.list[store.result].total || data.list[store.result].summary">
								<h4 class="d_tit">내 삶의 전반적 흐름</h4>
								<div class="d_cont colb">
									<ul class="d_desc pc_half">
										<template v-if="data.list[store.result].total">
											<template v-if="data.list[store.result].total.cont">
												<li v-for="(item, i) in data.list[store.result].total.cont" :key="i" v-html="item"></li>
											</template>
											<template v-else-if="Array.isArray(data.list[store.result].total)">
												<li v-for="(item, i) in data.list[store.result].total" :key="i" v-html="item"></li>
											</template>
										</template>
									</ul>
									<div class="bx_tip soul_tip pc_half" v-if="data.list[store.result].soul">
										<h6><img src="https://img.numerologytarot.uk/web/img/icon_ball.png?v=260219" class="ico_ball" alt="" />소울카드 <span>- {{ data.list[store.result].soul.card }} </span></h6>
										<ul class="sl_cont">
											<li v-for="(item, i) in data.list[store.result].soul.cont" :key="i" v-html="item"></li>
										</ul>
									</div>
								</div>
							</div>
						</div>
						<div class="area">
							<div class="item" v-if="data.list[store.result].roadmap">
								<h5 class="d_tit">연간 로드맵</h5>
								<div class="d_cont">
									<ul class="d_desc">
										<li v-for="(item, i) in data.list[store.result].roadmap" :key="i" v-html="item"></li>
									</ul>
								</div>
							</div>
							<div class="item" v-if="data.list[store.result].advice || data.list[store.result].leading">
								<h4 class="d_tit">조언</h4>
								<div class="d_cont">
									<ul class="d_desc">
										<li v-for="(item, i) in data.list[store.result].advice.cont" :key="i" v-html="item"></li>
									</ul>
								</div>
							</div>
						</div>
						<div class="area wealth">
							<div class="item" v-if="data.list[store.result].wealth">
								<h4 class="d_tit">재물 흐름</h4>
								<div class="colb">
									<div class="d_cont">
										<ul class="d_desc">
											<li v-for="(item, i) in data.list[store.result].wealth.cont" :key="i" v-html="item"></li>
										</ul>
									</div>
									<div class="bx_tip special_tip" v-if="data.list[store.result].rich">
										<h6>💰경매 및 투자운 <em>부자사관학교 전용 가이드</em></h6>
										<ul class="t_cont">
											<li v-for="(item, i) in data.list[store.result].rich.cont" :key="i" v-html="item"></li>
										</ul>
									</div>
								</div>
							</div>
						</div>
						<div class="area">
							<div class="item" v-if="data.list[store.result].career">
								<h4 class="d_tit">직업과 사회적 성공</h4>
								<div class="d_cont">
									<ul class="d_desc">
										<li v-for="(item, i) in data.list[store.result].career.cont" :key="i" v-html="item"></li>
									</ul>
								</div>
							</div>
							<div class="item" v-if="data.list[store.result].study">
								<h4 class="d_tit">학업 및 자기개발</h4>
								<div class="d_cont">
									<ul class="d_desc">
										<li v-for="(item, i) in data.list[store.result].study.cont" :key="i" v-html="item"></li>
									</ul>
								</div>
							</div>
						</div>
						<div class="area love">
							<div class="item" v-if="data.list[store.result].love">
								<h4 class="d_tit">사랑과 인연</h4>
								<div class="d_cont">
									<ul class="d_desc">
										<li v-html="data.list[store.result].love.cont"></li>
									</ul>
								</div>
								<!-- 사랑과 인연 상세 (솔로/커플/결혼) -->
								<div class="love_details" v-if="data.list[store.result].love.solo || data.list[store.result].love.couple || data.list[store.result].love.married">
									<div class="love_item" v-if="data.list[store.result].love.solo">
										<h6 class="sub_tit">💫 솔로</h6>
										<ul class="love_desc">
											<li v-for="(item, i) in data.list[store.result].love.solo" :key="i" v-html="item"></li>
										</ul>
									</div>
									<div class="love_item" v-if="data.list[store.result].love.couple">
										<h6 class="sub_tit">💕 커플</h6>
										<ul class="love_desc">
											<li v-for="(item, i) in data.list[store.result].love.couple" :key="i" v-html="item"></li>
										</ul>
									</div>
									<div class="love_item" v-if="data.list[store.result].love.married">
										<h6 class="sub_tit">💍 결혼</h6>
										<ul class="love_desc">
											<li v-for="(item, i) in data.list[store.result].love.married" :key="i" v-html="item"></li>
										</ul>
									</div>
								</div>
							</div>
						</div>
						<div class="area">
							<div class="item" v-if="data.list[store.result].health">
								<h4 class="d_tit">건강과 에너지</h4>
								<div class="d_cont">
									<ul class="d_desc">
										<template v-if="data.list[store.result].health.cont">
											<li v-for="(item, i) in data.list[store.result].health.cont" :key="i" v-html="item"></li>
										</template>
										<template v-else-if="Array.isArray(data.list[store.result].health)">
											<li v-for="(item, i) in data.list[store.result].health" :key="i" v-html="item"></li>
										</template>
									</ul>
								</div>
							</div>
							<div class="item" v-if="data.list[store.result].lucky_tips">
								<h4 class="d_tit">운명의 가이드</h4>
								<div class="d_cont">
									<ul class="d_desc">
										<template v-if="data.list[store.result].lucky_tips.cont">
											<li v-for="(item, i) in data.list[store.result].lucky_tips.cont" :key="i" v-html="item"></li>
										</template>
										<template v-else-if="Array.isArray(data.list[store.result].lucky_tips)">
											<li v-for="(item, i) in data.list[store.result].lucky_tips" :key="i" v-html="item"></li>
										</template>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</Transition>

	<!-- 복사/PDF 모달 -->
	<CopyPdfModal v-model:show="showCopyModal" :mode="modalMode" :sections="copySections" @confirm="handleModalConfirm" />
</template>

<script setup>
	import { ref, reactive } from 'vue';
	import { useTarotStore } from '~/stores/tarot';

	const store = useTarotStore();
	const clientName = ref('');
	const headerColor = ref('#fbdf70');
	const props = defineProps(['data']);

	const f_BirthMD = store.ipt_birth4.replace(/(\d{2})(\d{2})/, '$1월 $2일');

	// 복사/PDF 모달
	const showCopyModal = ref(false);
	const modalMode = ref('copy');
	const copySections = reactive([
		{ key: 'basic', label: '기본 정보', checked: true },
		{ key: 'total', label: '내 삶의 전반적 흐름', checked: true },
		{ key: 'roadmap', label: '연간 로드맵', checked: true },
		{ key: 'advice', label: '조언', checked: true },
		{ key: 'wealth', label: '재물 흐름', checked: true },
		{ key: 'career', label: '직업과 사회적 성공', checked: true },
		{ key: 'study', label: '학업 및 자기개발', checked: true },
		{ key: 'love_solo', label: '사랑과 인연 - 솔로', checked: true, group: 'love' },
		{ key: 'love_couple', label: '사랑과 인연 - 커플', checked: true, group: 'love' },
		{ key: 'love_married', label: '사랑과 인연 - 결혼', checked: true, group: 'love' },
		{ key: 'health', label: '건강과 에너지', checked: true },
		{ key: 'lucky_tips', label: '운명의 가이드', checked: true },
	]);

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
		if (Array.isArray(html)) return html.map(h => stripHtml(h)).join('\n');
		const tmp = document.createElement('div');
		tmp.innerHTML = html;
		return tmp.textContent || '';
	};

	const doCopy = async () => {
		const card = props.data.list[store.result];
		const lines = [];
		const checked = (key) => copySections.find(s => s.key === key)?.checked;

		for (const section of copySections) {
			if (!section.checked || section.group) continue;

			if (section.key === 'basic') {
				lines.push(`[${store.result}번 - ${stripHtml(card.name)}]`);
				lines.push(`해운년도: ${store.ipt_year}`);
				lines.push(`생일: ${f_BirthMD}`);
				if (card.lucky_group) {
					if (card.lucky_group.grade) lines.push(`운: ${card.lucky_group.grade}`);
					if (card.lucky_group.lucky_timing) lines.push(`좋은 분기: ${card.lucky_group.lucky_timing}`);
				}
				if (card.keywords) lines.push(`키워드: ${card.keywords.join(' ')}`);
				if (card.summary?.cont) {
					lines.push(`${store.ipt_year}년 요약:`);
					if (Array.isArray(card.summary.cont)) {
						card.summary.cont.forEach(item => lines.push(stripHtml(item)));
					} else {
						lines.push(stripHtml(card.summary.cont));
					}
				}
				lines.push('');
				continue;
			}

			if (section.key === 'total') {
				if (card.total || card.summary) {
					lines.push(`[내 삶의 전반적 흐름]`);
					if (card.total) {
						const cont = card.total.cont || card.total;
						if (Array.isArray(cont)) cont.forEach(item => lines.push(stripHtml(item)));
						else lines.push(stripHtml(cont));
					}
					if (card.soul?.cont) {
						lines.push(`\n소울카드 - ${card.soul.card}`);
						if (Array.isArray(card.soul.cont)) card.soul.cont.forEach(item => lines.push(stripHtml(item)));
						else lines.push(stripHtml(card.soul.cont));
					}
					lines.push('');
				}
				continue;
			}

			if (section.key === 'roadmap') {
				if (card.roadmap) {
					lines.push(`[연간 로드맵]`);
					if (Array.isArray(card.roadmap)) card.roadmap.forEach(item => lines.push(stripHtml(item)));
					lines.push('');
				}
				continue;
			}

			if (section.key === 'advice') {
				const adv = card.advice || card.leading;
				if (adv) {
					lines.push(`[조언]`);
					const cont = adv.cont || adv;
					if (Array.isArray(cont)) cont.forEach(item => lines.push(stripHtml(item)));
					else lines.push(stripHtml(cont));
					lines.push('');
				}
				continue;
			}

			if (!card[section.key]) continue;
			lines.push(`[${section.label}]`);
			const val = card[section.key];
			const cont = val.cont || val;
			if (Array.isArray(cont)) cont.forEach(item => lines.push(stripHtml(item)));
			else if (typeof cont === 'string') lines.push(stripHtml(cont));

			if (section.key === 'wealth' && card.rich?.cont) {
				lines.push(`\n경매 및 투자운`);
				if (Array.isArray(card.rich.cont)) card.rich.cont.forEach(item => lines.push(stripHtml(item)));
				else lines.push(stripHtml(card.rich.cont));
			}
			lines.push('');
		}

		// 사랑과 인연
		const loveAny = checked('love_solo') || checked('love_couple') || checked('love_married');
		if (loveAny && card.love) {
			lines.push(`[사랑과 인연]`);
			if (card.love.cont) lines.push(stripHtml(card.love.cont));
			if (checked('love_solo') && card.love.solo) lines.push(`\n솔로: ${stripHtml(card.love.solo)}`);
			if (checked('love_couple') && card.love.couple) lines.push(`\n커플: ${stripHtml(card.love.couple)}`);
			if (checked('love_married') && card.love.married) lines.push(`\n결혼: ${stripHtml(card.love.married)}`);
			lines.push('');
		}

		try {
			await navigator.clipboard.writeText(lines.join('\n'));
			showCopyModal.value = false;
			store.showAlert({ message: '선택한 항목이 복사되었습니다.', icon: '✅', type: 'success' });
		} catch (e) {
			console.error('복사 실패:', e);
			store.showAlert({ message: '복사에 실패했습니다.', icon: '❌', type: 'error' });
		}
	};

	// PDF 관련
	const pdfContent = ref(null);

	const titleToKey = {
		'내 삶의 전반적 흐름': 'total',
		'연간 로드맵': 'roadmap',
		'조언': 'advice',
		'재물 흐름': 'wealth',
		'직업과 사회적 성공': 'career',
		'학업 및 자기개발': 'study',
		'사랑과 인연': 'love',
		'건강과 에너지': 'health',
		'운명의 가이드': 'lucky_tips',
	};

	const downloadPDFWithSelection = async () => {
		if (!pdfContent.value) return;
		showCopyModal.value = false;

		const checked = (key) => copySections.find(s => s.key === key)?.checked;
		const el = pdfContent.value;
		const hiddenEls = [];

		el.querySelectorAll('.detail .item').forEach(item => {
			const tit = item.querySelector('.d_tit');
			if (!tit) return;
			const key = titleToKey[tit.textContent.trim()];
			if (!key) return;

			if (key === 'love') {
				const loveAny = checked('love_solo') || checked('love_couple') || checked('love_married');
				if (!loveAny) {
					item.style.display = 'none';
					hiddenEls.push(item);
				} else {
					item.querySelectorAll('.love_item').forEach(li => {
						const subTit = li.querySelector('.sub_tit')?.textContent || '';
						if (subTit.includes('솔로') && !checked('love_solo')) { li.style.display = 'none'; hiddenEls.push(li); }
						if (subTit.includes('커플') && !checked('love_couple')) { li.style.display = 'none'; hiddenEls.push(li); }
						if (subTit.includes('결혼') && !checked('love_married')) { li.style.display = 'none'; hiddenEls.push(li); }
					});
				}
			} else if (!checked(key)) {
				item.style.display = 'none';
				hiddenEls.push(item);
			}
		});

		// CSS 변수 설정 (워터마크, 헤더 색상)
		const corpName = (store.userCorpName || '').trim();
		if (corpName) {
			el.style.setProperty('--watermark-text', `"${corpName}"`);
		}
		el.style.setProperty('--pdf-header-color', headerColor.value);

		const savedImgs = store.prepareImagesForPDF(el);
		try {
			const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
				import('html2canvas'),
				import('jspdf')
			]);

			const element = el;
			const pdfOnlyElements = element.querySelectorAll('.pdf_only_header');
			pdfOnlyElements.forEach(e => e.style.display = 'block');
			const screenOnlyElements = element.querySelectorAll('.r_top');
			screenOnlyElements.forEach(e => e.style.display = 'none');

			const originalScrollTop = window.pageYOffset;
			window.scrollTo(0, 0);
			await new Promise(resolve => setTimeout(resolve, 100));

			const canvas = await html2canvas(element, {
				scale: 2, useCORS: true, logging: false,
				scrollY: 0, scrollX: 0,
				height: element.scrollHeight, windowHeight: element.scrollHeight,
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

			pdf.save(`타로_${store.ipt_year}년_해운카드_리딩_${f_BirthMD}.pdf`);

			pdfOnlyElements.forEach(e => e.style.display = 'none');
			screenOnlyElements.forEach(e => e.style.display = '');
			window.scrollTo(0, originalScrollTop);
		} catch (error) {
			console.error('PDF 생성 오류:', error);
			store.showAlert({ message: 'PDF 생성 중 오류가 발생했습니다.', icon: '❌', type: 'error' });
			const pdfOnlyElements = el.querySelectorAll('.pdf_only_header');
			const screenOnlyElements = el.querySelectorAll('.r_top');
			pdfOnlyElements?.forEach(e => e.style.display = 'none');
			screenOnlyElements?.forEach(e => e.style.display = '');
		}

		// CSS 변수 제거
		el.style.removeProperty('--watermark-text');
		el.style.removeProperty('--pdf-header-color');
		store.restoreImagesAfterPDF(savedImgs);
		hiddenEls.forEach(e => e.style.display = '');
	};
</script>

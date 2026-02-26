<template>
	<Transition name="fade">
		<div class="result" @click.stop>
			<div class="bg" @click="store.fnClose"></div>
			<div v-if="store.result !== null" class="r_wrap result_birth" ref="pdfContent">
				<!-- PDF 전용 헤더 (화면에는 안보임) -->
				<div class="pdf_only_header" style="display: none;">
					<p class="corp">{{ (store.userCorpName || '').trim() || 'Numerology Tarot' }}</p>
					<p class="txt_sm">수비학으로 보는 나의운명</p>
					<h2>
						<template v-if="clientName.trim()">{{ clientName.trim() }}님 </template>생일카드 해석 리포트
					</h2>
					<div class="sub_tit">
						{{ store.result }}번 - <span v-html="data.list[store.result].name"></span>
					</div>
				</div>
				<div class="r_top colb">
					<div class="c_left">
						<h3>생일카드 결과 <span>(해석)</span></h3>
					</div>
					<div class="c_right">
						<button class="btn_close" @click="store.fnClose"><span>닫기</span></button>
					</div>
					<div class="gnb">
						<button class="btn_copy" @click="openModal('copy')">📋복사</button>
						<button v-if="!isAppView" class="btn_pdf" @click="openModal('pdf')">💾PDF</button>
						<button v-if="isAppView" class="btn_pdf show_app blue2" @click="openAppPdf">🔗PDF</button>
						<button class="link blue" @click="store.fnGo('reading')">🔗리딩</button>
						<button v-if="store.isLeading" class="link talk" @click="store.fnGo('talk')">💬톡상담</button>
					</div>
				</div>
				<div class="r_cont">
					<h3 class="main_card_tit">
						{{ store.result }}번 - <div class="tit" v-html="data.list[store.result].name"></div>
					</h3>
					<section class="pdf_section1">
						<div class="col2">
							<div class="left">
								<div class="bx_img">
									<img :src="'https://img.numerologytarot.uk/web/img/card/majors/' + store.result + '.jpg'" :alt="store.result + '번 ' + data.list[store.result].name" />
								</div>
								<button v-if="['마스터', '프로'].includes(store.userGrade)" class="btn hidden_app" @click="store.goToWiki(store.result, 'majors')">고유 설명 보기</button>
							</div>
							<div class="right">
								<dl class="info_birth mt0" v-if="store.ipt_birth8">
									<dt>생년월일</dt>
									<dd>{{ f_Birth }}</dd>
								</dl>
								<div class="lucky_group" v-if="data.list[store.result].lucky_group">
									<dl v-for="(val, key) in luckyMap" :key="key">
										<dt>행운의 {{ key }}</dt>
										<dd>{{ data.list[store.result].lucky_group[val] }}</dd>
									</dl>
								</div>
								<div class="summary_box" v-if="data.list[store.result].summary">
									<h5 class="sub_tit">{{ data.list[store.result].summary.sub_title }}</h5>
									<p class="cont" v-html="data.list[store.result].summary.cont"></p>
								</div>
								<div class="bx_key">
									<span class="tag" v-for="word in data.list[store.result].keyword" :key="word">{{ '#' + word +" "}}</span>
								</div>
							</div>
						</div>
						<div class="pdf_info">
							<h4 class="d_tit">🪄수비학 타로란?</h4>
							<div class="d_cont">
								숫자가 가진 유한 에너지의 성질과 타로의 상징을 결합하여 인생의 흐름을 논리적이고 체계적으로 분석합니다. <br/>
								생년월일을 계산해 타고난 기질과 운명적 주기를 파악하며, 삶의 목적을 더욱 선명하게 드러냅니다. <br/>
								단순한 우연을 넘어 수(數)의 질서 속에 숨겨진 명확한 삶의 이정표를 제시하는 현대적인 분석 기법입니다.
							</div>
						</div>
					</section>
					<div class="detail">
						<section class="pdf_section2">
							<div class="item" v-if="data.list[store.result].total">
								<h4 class="d_tit">내 삶의 전반적 흐름</h4>
								<div class="d_cont">
									<strong class="d_sub_tit" v-if="data.list[store.result].total.sub_title">
										{{ data.list[store.result].total.sub_title }}
									</strong>
									<p class="d_desc" v-html="data.list[store.result].total.cont || data.list[store.result].total"></p>
								</div>
								<div class="bx_tip soul_tip" v-if="data.list[store.result].soul.cont">
									<h6><img src="https://img.numerologytarot.uk/web/img/icon_ball.png?v=260219" class="ico_ball" alt="" />소울카드 <span>- {{ data.list[store.result].soul.card }} </span></h6>
									<div class="sl_desc">소울카드는 메인 생일카드 해석만으로는 다 알 수 없는, 당신의 깊은 내면에 감수성 있게 감춰진 본질적인 욕구와 영혼이 가진 고유한 기질을 상징하는 카드입니다.</div>
									<div class="sl_cont" v-html="data.list[store.result].soul.cont"></div>
								</div>
							</div>
							<div class="item" v-if="data.list[store.result].character">
								<h4 class="d_tit">타고난 성격</h4>
								<div class="d_cont">
									<strong class="d_sub_tit" v-if="data.list[store.result].character.sub_title">
										{{ data.list[store.result].character.sub_title }}
									</strong>
									<p class="d_desc" v-html="data.list[store.result].character.cont || data.list[store.result].character"></p>
								</div>
							</div>
							<div class="item" v-if="data.list[store.result].health">
								<h4 class="d_tit">건강과 에너지</h4>
								<div class="d_cont">
									<strong class="d_sub_tit" v-if="data.list[store.result].health.sub_title">
										{{ data.list[store.result].health.sub_title }}
									</strong>
									<p class="d_desc" v-html="data.list[store.result].health.cont || data.list[store.result].health"></p>
								</div>
							</div>
						</section>
						<section class="pdf_section3">
							<div class="item" v-if="data.list[store.result].wealth">
								<h4 class="d_tit">재물 관리</h4>
								<div class="d_cont">
									<strong class="d_sub_tit" v-if="data.list[store.result].wealth.sub_title">
										{{ data.list[store.result].wealth.sub_title }}
									</strong>
									<p class="d_desc" v-html="data.list[store.result].wealth.cont || data.list[store.result].wealth"></p>
								</div>
								<div class="bx_tip special_tip">
									<h6>경매 및 투자운 <em>부자사관학교 전용 가이드</em></h6>
									<div class="t_cont" v-html="data.list[store.result].rich.cont"></div>
								</div>
							</div>
							<div class="item" v-if="data.list[store.result].study">
								<h4 class="d_tit">학업 및 자기개발</h4>
								<div class="d_cont">
									<strong class="d_sub_tit" v-if="data.list[store.result].study.sub_title">
										{{ data.list[store.result].study.sub_title }}
									</strong>
									<p class="d_desc" v-html="data.list[store.result].study.cont || data.list[store.result].study"></p>
								</div>
							</div>
							<div class="item" v-if="data.list[store.result].career">
								<h4 class="d_tit">직업과 사회적 성공</h4>
								<div class="d_cont">
									<strong class="d_sub_tit" v-if="data.list[store.result].career.sub_title">
										{{ data.list[store.result].career.sub_title }}
									</strong>
									<p class="d_desc" v-html="data.list[store.result].career.cont || data.list[store.result].career"></p>
								</div>
								<div class="career_tip">
									<h6>💡추천직업</h6>
									<div class="c_cont">
										<span v-for="(job, i) in data.list[store.result].career.recommend" :key="i">{{ job }}</span>
									</div>
								</div>
							</div>
						</section>
						<section class="pdf_section4">
							<div class="item" v-if="data.list[store.result].love">
								<h4 class="d_tit">사랑과 인연</h4>
								<div class="d_cont">
									<strong class="d_sub_tit" v-if="data.list[store.result].love.sub_title">
										{{ data.list[store.result].love.sub_title }}
									</strong>
									<p class="d_desc" v-html="data.list[store.result].love.cont || data.list[store.result].love"></p>
								</div>
								<!-- 사랑과 인연 상세 (솔로/커플/결혼) -->
								<div class="love_details">
									<div class="love_item" v-if="data.list[store.result].love.solo">
										<h6 class="sub_tit">💫 솔로</h6>
										<p class="love_desc" v-html="data.list[store.result].love.solo"></p>
									</div>
									<div class="love_item" v-if="data.list[store.result].love.couple">
										<h6 class="sub_tit">💕 커플</h6>
										<p class="love_desc" v-html="data.list[store.result].love.couple"></p>
									</div>
									<div class="love_item" v-if="data.list[store.result].love.married">
										<h6 class="sub_tit">💍 결혼</h6>
										<p class="love_desc" v-html="data.list[store.result].love.married"></p>
									</div>
								</div>
							</div>
							<div class="item" v-if="data.list[store.result].lucky_match">
								<h4 class="d_tit">최고의 파트너</h4>
								<div class="d_cont">
									<strong class="d_sub_tit" v-if="data.list[store.result].lucky_match.sub_title">
										{{ data.list[store.result].lucky_match.sub_title }}
									</strong>
									<p class="d_desc" v-html="data.list[store.result].lucky_match.cont || data.list[store.result].lucky_match"></p>
								</div>
							</div>
							<div class="item" v-if="data.list[store.result].caution_match">
								<h4 class="d_tit">주의해야 할 인연</h4>
								<div class="d_cont">
									<strong class="d_sub_tit" v-if="data.list[store.result].caution_match.sub_title">
										{{ data.list[store.result].caution_match.sub_title }}
									</strong>
									<p class="d_desc" v-html="data.list[store.result].caution_match.cont || data.list[store.result].caution_match"></p>
								</div>
							</div>
						</section>
						<section class="pdf_section5">
							<div class="item" v-if="data.list[store.result].life_lesson">
								<h4 class="d_tit">당신을 위한 조언</h4>
								<div class="d_cont">
									<strong class="d_sub_tit" v-if="data.list[store.result].life_lesson.sub_title">
										{{ data.list[store.result].life_lesson.sub_title }}
									</strong>
									<p class="d_desc" v-html="data.list[store.result].life_lesson.cont || data.list[store.result].life_lesson"></p>
								</div>
							</div>
							<div class="item" v-if="data.list[store.result].advice">
								<h4 class="d_tit">운명의 가이드</h4>
								<div class="d_cont">
									<strong class="d_sub_tit" v-if="data.list[store.result].advice.sub_title">
										{{ data.list[store.result].advice.sub_title }}
									</strong>
									<p class="d_desc" v-html="data.list[store.result].advice.cont || data.list[store.result].advice"></p>
								</div>
							</div>
							<div class="notice">
								<h5>✏️Notice</h5>
								<p>
									생일 카드는 당신이 태어날 때 부여받은 영혼의 설계도와 같습니다. <br/>
									하지만 같은 설계도라도 어떤 땅에 집을 짓느냐에 따라 완성된 모습은 달라질 수 있죠. 
									자라온 환경이나 후천적인 노력에 따라 카드 속 모습이 잠재되어 있을 수도, 혹은 예상치 못한 방식으로 발현되었을 수도 있습니다.
								</p>
								<p>
									지금의 당신과 카드의 모습이 조금 다르게 느껴진다면, 그 속에 숨겨진 진짜 당신의 가능성을 찾아보는 건 어떨까요? 
									더 깊은 내면의 이야기가 궁금하다면 전문 타로 상담을 통해 나만의 특별한 에너지를 확인해 보시는 것을 추천드려요
								</p>
							</div>
						</section>
			<!-- 
			"": "study",
			"": "love",
			"": "",
			"": "",
			"": "",
			"": "" -->
						<!-- <template v-for="(val, key) in activeSections" :key="key">
							<div class="item" v-if="data.list[store.result][val]">
								<h4 class="d_tit">{{ key }}</h4>
								<div class="d_cont">
									<strong class="d_sub_tit" v-if="data.list[store.result][val].sub_title">
										{{ data.list[store.result][val].sub_title }}
									</strong>
									<p class="d_desc" v-html="data.list[store.result][val].cont || data.list[store.result][val]"></p>
									
									<div class="bx_tip special_tip" v-if="val === 'wealth' && data.list[store.result].rich">
										<h6>경매 및 투자운 <em>부자사관학교 전용 가이드</em></h6>
										<div class="t_cont" v-html="data.list[store.result].rich.cont"></div>
									</div>
								</div>								
								<div class="match_box" v-if="val.includes('match')"></div>
							</div>
						</template> -->
					</div>
				</div>
			</div>
		</div>
	</Transition>

	<!-- 복사/PDF 모달 -->
	<CopyPdfModal v-model:show="showCopyModal" :mode="modalMode" :sections="copySections" @confirm="handleModalConfirm" />
</template>

<script setup>
	import { ref, reactive, onMounted } from 'vue';
	import { useTarotStore } from '~/stores/tarot';

	const store = useTarotStore();
	const props = defineProps(['data']);
	const clientName = ref('');
	const headerColor = ref('#fbdf70');
	const isAppView = ref(false);
	onMounted(() => { isAppView.value = !!window.ReactNativeWebView; });

	const birth = store.picked === 'r1' ? store.ipt_birth8 : store.ipt_year + store.ipt_birth4;
	const f_Birth = birth.replace(/(\d{4})(\d{2})(\d{2})/, '$1년 $2월 $3일');

	const luckyMap = {
		'컬러': 'color',
		'숫자': 'number',
		'요일': 'day'
	};

	// 복사/PDF 모달
	const showCopyModal = ref(false);
	const modalMode = ref('copy'); // 'copy' | 'pdf'
	const copySections = reactive([
		{ key: 'basic', label: '기본 정보', checked: true },
		{ key: 'total', label: '내 삶의 전반적 흐름', checked: true },
		{ key: 'character', label: '타고난 성격', checked: true },
		{ key: 'health', label: '건강과 에너지', checked: true },
		{ key: 'wealth', label: '재물 관리', checked: true },
		{ key: 'study', label: '학업 및 자기개발', checked: true },
		{ key: 'career', label: '직업과 사회적 성공', checked: true },
		{ key: 'love_solo', label: '사랑과 인연 - 솔로', checked: true, group: 'love' },
		{ key: 'love_couple', label: '사랑과 인연 - 커플', checked: true, group: 'love' },
		{ key: 'love_married', label: '사랑과 인연 - 결혼', checked: true, group: 'love' },
		{ key: 'lucky_match', label: '최고의 파트너', checked: true },
		{ key: 'caution_match', label: '주의해야 할 인연', checked: true },
		{ key: 'life_lesson', label: '당신을 위한 조언', checked: true },
		{ key: 'advice', label: '운명의 가이드', checked: true },
	]);

	const openModal = (mode) => {
		copySections.forEach(s => s.checked = true);
		modalMode.value = mode;
		showCopyModal.value = true;
	};

	const openAppPdf = () => {
		const params = new URLSearchParams();
		if (store.token) params.set('token', store.token);
		if (store.user) params.set('user', encodeURIComponent(JSON.stringify(store.user)));
		if (store.userGrade) params.set('grade', store.userGrade);
		if (store.userCorpName) params.set('corp', store.userCorpName);
		const qs = params.toString();
		window.open(`/app/birth/${store.result}${qs ? '?' + qs : ''}`, '_blank');
	};

	const stripHtml = (html) => {
		if (!html) return '';
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
				if (store.ipt_birth8) lines.push(`생년월일: ${f_Birth}`);
				if (card.lucky_group) {
					lines.push(`행운의 컬러: ${card.lucky_group.color}`);
					lines.push(`행운의 숫자: ${card.lucky_group.number}`);
					lines.push(`행운의 요일: ${card.lucky_group.day}`);
				}
				if (card.keyword) lines.push(`키워드: ${card.keyword.map(w => '#' + w).join(' ')}`);
				if (card.summary) {
					if (card.summary.sub_title) lines.push(card.summary.sub_title);
					if (card.summary.cont) lines.push(stripHtml(card.summary.cont));
				}
				lines.push('');
				continue;
			}

			if (!card[section.key]) continue;

			lines.push(`[${section.label}]`);
			const val = card[section.key];
			if (val.sub_title) lines.push(val.sub_title);
			if (val.cont) lines.push(stripHtml(val.cont));

			// 소울카드
			if (section.key === 'total' && card.soul?.cont) {
				lines.push(`\n소울카드 - ${card.soul.card}`);
				lines.push(stripHtml(card.soul.cont));
			}
			// 경매 및 투자운
			if (section.key === 'wealth' && card.rich?.cont) {
				lines.push(`\n경매 및 투자운`);
				lines.push(stripHtml(card.rich.cont));
			}
			// 추천직업
			if (section.key === 'career' && val.recommend) {
				lines.push(`추천직업: ${val.recommend.join(', ')}`);
			}
			lines.push('');
		}

		// 사랑과 인연 - 하위 항목 중 하나라도 체크되면 기본 내용 포함
		const loveAny = checked('love_solo') || checked('love_couple') || checked('love_married');
		if (loveAny && card.love) {
			lines.push(`[사랑과 인연]`);
			if (card.love.sub_title) lines.push(card.love.sub_title);
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

	const handleModalConfirm = ({ clientName: name, headerColor: color }) => {
		clientName.value = name;
		headerColor.value = color;
		showCopyModal.value = false;
		if (modalMode.value === 'copy') doCopy();
		else downloadPDFWithSelection();
	};

	// PDF 관련 - 동적 import로 초기 로딩 최적화
	const pdfContent = ref(null);

	const titleToKey = {
		'내 삶의 전반적 흐름': 'total',
		'타고난 성격': 'character',
		'건강과 에너지': 'health',
		'재물 관리': 'wealth',
		'학업 및 자기개발': 'study',
		'직업과 사회적 성공': 'career',
		'사랑과 인연': 'love',
		'최고의 파트너': 'lucky_match',
		'주의해야 할 인연': 'caution_match',
		'당신을 위한 조언': 'life_lesson',
		'운명의 가이드': 'advice',
	};

	const downloadPDFWithSelection = async () => {
		if (!pdfContent.value) return;
		showCopyModal.value = false;

		const checked = (key) => copySections.find(s => s.key === key)?.checked;
		const el = pdfContent.value;
		const hiddenEls = [];

		// basic (pdf_section1) 숨김 처리
		if (!checked('basic')) {
			const s1 = el.querySelector('.pdf_section1');
			if (s1) { s1.style.display = 'none'; hiddenEls.push(s1); }
		}

		// 각 .item 요소를 타이틀로 매칭하여 숨김
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
					// 솔로/커플/결혼 개별 숨김
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

		// PDF 라이브러리를 필요할 때만 로드
		const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
			import('html2canvas'),
			import('jspdf')
		]);

		await store.downloadPDF({
			pdfContent: el,
			html2canvas,
			jsPDF,
			filename: `타로_결과_리포트${f_Birth ? '_' + f_Birth : ''}.pdf`
		});

		// CSS 변수 제거
		el.style.removeProperty('--watermark-text');
		el.style.removeProperty('--pdf-header-color');
		// 숨김 복원
		hiddenEls.forEach(e => e.style.display = '');
	};
</script>

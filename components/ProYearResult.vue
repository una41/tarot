<template>
	<Transition name="fade">
		<div class="result result_year"  @click.stop>
			<div class="bg" @click="store.fnClose"></div>
			<div v-if="store.result !== null" class="r_wrap" ref="pdfContent">
				<!-- PDF 전용 헤더 (화면에는 안보임) -->
				<div class="pdf_only_header" style="display: none;">
					<p class="corp">{{ (store.userCorpName || '').trim() || 'Numerology Tarot' }}</p>
					<p class="txt_sm">수비학으로 보는 나의 1년</p>
					<h2>
						<template v-if="clientName.trim()">{{ clientName.trim() }}님 </template><template v-if="store.ipt_year">{{ store.ipt_year }}년 </template>해운카드 해석 리포트
					</h2>
					<div class="sub_tit">
						{{ store.result }}번 - <span v-html="data.list[store.result].name"></span>
					</div>
				</div>
				<div class="r_top colb">
					<div class="c_left">
						<h3>{{ store.ipt_year ? store.ipt_year + '년 해운카드' : '해운카드'}} <b class="pc">결과</b> <span>(해석)</span></h3>
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
								<div class="r_colb">
									<dl class="info_birth mt0" v-if="store.ipt_year">
										<dt>해운년도</dt>
										<dd>{{ store.ipt_year }}</dd>
									</dl>
									<dl class="mt0">
										<dt>운</dt>
										<dd><span :class="'txt_bg ' + data.list[store.result].lucky_group.grade">{{ data.list[store.result].lucky_group.grade }}</span></dd>
									</dl>
								</div>
								<div class="r_colb">
									<dl v-if="store.ipt_birth4">
										<dt>생일</dt>
										<dd>{{ f_BirthMD }}</dd>
									</dl>
									<dl>
										<dt>좋은 분기</dt>
										<dd>{{ data.list[store.result].lucky_group.lucky_timing }}</dd>
									</dl>
								</div>
								<div class="summary_box hr" v-for="(val, key) in luckyMap" :key="key">
									<h5 class="sub_tit">{{ key }}</h5>
									<p class="cont" v-html="data.list[store.result].lucky_group[val]"></p>
								</div>
								<div class="summary_box" v-if="data.list[store.result].summary">
									<h5 class="sub_tit">{{ data.list[store.result].summary.sub_title }}</h5>
									<p class="cont" v-html="data.list[store.result].summary.cont"></p>
								</div>
								<div class="bx_key">
									<span class="tag" v-for="word in data.list[store.result].keywords" :key="word">{{ word +" "}}</span>
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
							<div class="item" v-if="data.list[store.result].roadmap">
								<h4 class="d_tit">연간 로드맵</h4>
								<div class="d_cont">
									<p class="d_desc" v-if="data.list[store.result].roadmap.intro" v-html="data.list[store.result].roadmap.intro"></p>
									<div class="roadmap">
										<div class="r_item" v-if="data.list[store.result].roadmap.q1">
											<h6 class="sub_tit">1분기 (1~3월)</h6>
											<p class="cont" v-html="data.list[store.result].roadmap.q1"></p>
										</div>
										<div class="r_item" v-if="data.list[store.result].roadmap.q2">
											<h6 class="sub_tit">2분기 (4~6월)</h6>
											<p class="cont" v-html="data.list[store.result].roadmap.q2"></p>
										</div>
										<div class="r_item" v-if="data.list[store.result].roadmap.q3">
											<h6 class="sub_tit">3분기 (7~9월)</h6>
											<p class="cont" v-html="data.list[store.result].roadmap.q3"></p>
										</div>
										<div class="r_item" v-if="data.list[store.result].roadmap.q4">
											<h6 class="sub_tit">4분기 (10~12월)</h6>
											<p class="cont" v-html="data.list[store.result].roadmap.q4"></p>
										</div>
									</div>
								</div>
							</div>
							<div class="item" v-if="data.list[store.result].total">
								<h4 class="d_tit">내 삶의 전반적 흐름</h4>
								<div class="d_cont">
									<strong class="d_sub_tit" v-if="data.list[store.result].total.sub_title">
										{{ data.list[store.result].total.sub_title }}
									</strong>
									<p class="d_desc" v-html="data.list[store.result].total.cont || data.list[store.result].total"></p>
								</div>
								<div class="bx_tip soul_tip" v-if="data.list[store.result].soul && data.list[store.result].soul.cont">
									<h6><img src="https://img.numerologytarot.uk/web/img/icon_ball.png?v=260219" class="ico_ball" alt="" />소울카드 <span>- {{ data.list[store.result].soul.card }} </span></h6>
									<div class="sl_desc">소울카드는 메인 해운카드 해석만으로는 다 알 수 없는, 당신의 깊은 내면에 감수성 있게 감춰진 본질적인 욕구와 영혼이 가진 고유한 기질을 상징하는 카드입니다.</div>
									<div class="sl_cont" v-html="data.list[store.result].soul.cont"></div>
								</div>
							</div>
						</section>
						<section class="pdf_section3">
							<div class="item" v-if="data.list[store.result].wealth">
								<h4 class="d_tit">재물 흐름</h4>
								<div class="d_cont">
									<strong class="d_sub_tit" v-if="data.list[store.result].wealth.sub_title">
										{{ data.list[store.result].wealth.sub_title }}
									</strong>
									<p class="d_desc" v-html="data.list[store.result].wealth.cont || data.list[store.result].wealth"></p>
								</div>
								<div class="bx_tip special_tip" v-if="data.list[store.result].rich">
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
							</div>
						</section>
						<section class="pdf_section4">
							<div class="item" v-if="data.list[store.result].health">
								<h4 class="d_tit">건강과 에너지</h4>
								<div class="d_cont">
									<strong class="d_sub_tit" v-if="data.list[store.result].health.sub_title">
										{{ data.list[store.result].health.sub_title }}
									</strong>
									<p class="d_desc" v-html="data.list[store.result].health.cont || data.list[store.result].health"></p>
								</div>
							</div>
							<div class="item" v-if="data.list[store.result].love">
								<h4 class="d_tit">사랑과 인연</h4>
								<div class="d_cont">
									<strong class="d_sub_tit" v-if="data.list[store.result].love.sub_title">
										{{ data.list[store.result].love.sub_title }}
									</strong>
									<p class="d_desc" v-html="data.list[store.result].love.cont || data.list[store.result].love"></p>
								</div>
								<div class="love_details" v-if="data.list[store.result].love.solo || data.list[store.result].love.couple || data.list[store.result].love.married">
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
							<div class="item" v-if="data.list[store.result].advice">
								<h4 class="d_tit">당신을 위한 조언</h4>
								<div class="d_cont">
									<strong class="d_sub_tit" v-if="data.list[store.result].advice.sub_title">
										{{ data.list[store.result].advice.sub_title }}
									</strong>
									<p class="d_desc" v-html="data.list[store.result].advice.cont || data.list[store.result].advice"></p>
								</div>
							</div>
						</section>
						<section class="pdf_section5">
							<div class="item" v-if="data.list[store.result].lucky_tips">
								<h4 class="d_tit">운명의 가이드</h4>
								<div class="d_cont">
									<strong class="d_sub_tit" v-if="data.list[store.result].lucky_tips.sub_title">
										{{ data.list[store.result].lucky_tips.sub_title }}
									</strong>
									<p class="d_desc" v-html="data.list[store.result].lucky_tips.cont || data.list[store.result].lucky_tips"></p>
								</div>
							</div>
							<div class="notice">
								<h5>✏️Notice</h5>
								<p>
									해운 카드는 {{ store.ipt_year ? store.ipt_year + '년' : '올' }} 한 해 동안 당신에게 흐르는 시간의 흐름과 기회를 보여줍니다. <br/>
									하지만 같은 운세라도 어떤 마음가짐으로 맞이하느냐에 따라 결과는 크게 달라질 수 있죠.
									자신의 노력과 선택에 따라 카드 속 에너지가 긍정적으로 발현될 수도, 또는 주의가 필요한 신호로 나타날 수도 있습니다.
								</p>
								<p>
									올해의 흐름이 더욱 궁금하다면, 그 속에 숨겨진 구체적인 타이밍과 행동 지침을 찾아보는 건 어떨까요?
									더 깊은 해운의 이야기가 궁금하다면 전문 타로 상담을 통해 나만의 특별한 한 해를 설계해 보시는 것을 추천드려요.
								</p>
							</div>
						</section>
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

	const f_BirthMD = store.ipt_birth4 ? store.ipt_birth4.replace(/(\d{2})(\d{2})/, '$1월 $2일') : '';

	const luckyMap = {
		'추천 할일': 'todo',
	};

	// 복사/PDF 모달
	const showCopyModal = ref(false);
	const modalMode = ref('copy');
	const copySections = reactive([
		{ key: 'basic', label: '기본 정보', checked: true },
		{ key: 'roadmap', label: '연간 로드맵', checked: true },
		{ key: 'total', label: '내 삶의 전반적 흐름', checked: true },
		{ key: 'wealth', label: '재물 흐름', checked: true },
		{ key: 'study', label: '학업 및 자기개발', checked: true },
		{ key: 'career', label: '직업과 사회적 성공', checked: true },
		{ key: 'health', label: '건강과 에너지', checked: true },
		{ key: 'love_solo', label: '사랑과 인연 - 솔로', checked: true, group: 'love' },
		{ key: 'love_couple', label: '사랑과 인연 - 커플', checked: true, group: 'love' },
		{ key: 'love_married', label: '사랑과 인연 - 결혼', checked: true, group: 'love' },
		{ key: 'advice', label: '당신을 위한 조언', checked: true },
		{ key: 'lucky_tips', label: '운명의 가이드', checked: true },
	]);

	const openModal = (mode) => {
		copySections.forEach(s => s.checked = true);
		modalMode.value = mode;
		showCopyModal.value = true;
	};

	const openAppPdf = () => {
		const params = new URLSearchParams();
		if (store.token) params.set('token', store.token);
		if (store.user) params.set('user', btoa(JSON.stringify(store.user)));
		if (store.userGrade) params.set('grade', store.userGrade);
		if (store.userCorpName) params.set('corp', store.userCorpName);
		const qs = params.toString();
		window.open(`/app/year/${store.result}${qs ? '?' + qs : ''}`, '_blank');
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
		const card = props.data.list[store.result];
		const lines = [];
		const checked = (key) => copySections.find(s => s.key === key)?.checked;

		for (const section of copySections) {
			if (!section.checked || section.group) continue;

			if (section.key === 'basic') {
				lines.push(`[${store.result}번 - ${stripHtml(card.name)}]`);
				if (store.ipt_year) lines.push(`해운년도: ${store.ipt_year}`);
				if (store.ipt_birth4) lines.push(`생일: ${f_BirthMD}`);
				if (card.lucky_group) {
					if (card.lucky_group.grade) lines.push(`운: ${card.lucky_group.grade}`);
					if (card.lucky_group.lucky_timing) lines.push(`좋은 분기: ${card.lucky_group.lucky_timing}`);
					if (card.lucky_group.todo) lines.push(`추천 할일: ${stripHtml(card.lucky_group.todo)}`);
				}
				if (card.keywords) lines.push(`키워드: ${card.keywords.join(' ')}`);
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

			if (section.key === 'roadmap') {
				if (val.intro) lines.push(stripHtml(val.intro));
				if (val.q1) lines.push(`1분기 (1~3월): ${stripHtml(val.q1)}`);
				if (val.q2) lines.push(`2분기 (4~6월): ${stripHtml(val.q2)}`);
				if (val.q3) lines.push(`3분기 (7~9월): ${stripHtml(val.q3)}`);
				if (val.q4) lines.push(`4분기 (10~12월): ${stripHtml(val.q4)}`);
			} else {
				if (val.sub_title) lines.push(val.sub_title);
				if (val.cont) lines.push(stripHtml(val.cont));
			}

			if (section.key === 'total' && card.soul?.cont) {
				lines.push(`\n소울카드 - ${card.soul.card}`);
				lines.push(stripHtml(card.soul.cont));
			}
			if (section.key === 'wealth' && card.rich?.cont) {
				lines.push(`\n경매 및 투자운`);
				lines.push(stripHtml(card.rich.cont));
			}
			lines.push('');
		}

		// 사랑과 인연
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

	// PDF 관련
	const pdfContent = ref(null);

	const titleToKey = {
		'연간 로드맵': 'roadmap',
		'내 삶의 전반적 흐름': 'total',
		'재물 흐름': 'wealth',
		'학업 및 자기개발': 'study',
		'직업과 사회적 성공': 'career',
		'건강과 에너지': 'health',
		'사랑과 인연': 'love',
		'당신을 위한 조언': 'advice',
		'운명의 가이드': 'lucky_tips',
	};

	const downloadPDFWithSelection = async () => {
		if (!pdfContent.value) return;
		showCopyModal.value = false;

		const checked = (key) => copySections.find(s => s.key === key)?.checked;
		const el = pdfContent.value;
		const hiddenEls = [];

		if (!checked('basic')) {
			const s1 = el.querySelector('.pdf_section1');
			if (s1) { s1.style.display = 'none'; hiddenEls.push(s1); }
		}

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

		const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
			import('html2canvas'),
			import('jspdf')
		]);

		await store.downloadPDF({
			pdfContent: el,
			html2canvas,
			jsPDF,
			filename: `타로_${store.ipt_year ? store.ipt_year + '년_' : ''}해운카드_해석${f_BirthMD ? '_' + f_BirthMD : ''}.pdf`
		});

		// CSS 변수 제거
		el.style.removeProperty('--watermark-text');
		el.style.removeProperty('--pdf-header-color');
		hiddenEls.forEach(e => e.style.display = '');
	};
</script>

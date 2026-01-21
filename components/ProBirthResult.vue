<template>
	<Transition name="fade">
		<div class="result" @click.stop>
			<div class="bg" @click="store.fnClose"></div>
			<div v-if="store.result !== null" class="r_wrap result_birth" ref="pdfContent">
				<!-- PDF 전용 헤더 (화면에는 안보임) -->
				<div class="pdf_only_header" style="display: none;">
					<!-- <p class="logo"><b>numerology Tarot</b></p> -->
					<h2>
						생일카드 타로 해석 결과
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
						<button class="btn_pdf" @click="downloadPDF">💾PDF</button>
						<button class="link" @click="store.fnGo('reading')">🔗리딩</button>
					</div>
				</div>
				<div class="r_cont">
					<h3 class="main_card_tit">
						{{ store.result }}번 - <div class="tit" v-html="data.list[store.result].name"></div>
					</h3>
					<section class="pdf_section1">
						<div class="col2">
							<div class="left">
								<div class="bx_img" :style="{ background: 'url(\'https://www.numerologytarot.uk/img/card/majors/' + store.result + '.jpg\') no-repeat 50% -4px'}">
								<!-- <div class="bx_img" :style="{ background: 'url(\'https://una41.github.io/tarot/img/card/card' + store.result + '.jpg\') no-repeat 50% -4px' }"> -->
									<span class="blind">{{ store.result }}번 {{ data.list[store.result].name }} 이미지</span>
								</div>
								<button v-if="store.userGrade === '마스터'" class="btn" @click="store.goToWiki(store.result, 'majors')">고유 설명 보기</button>
							</div>
							<div class="right">
								<dl class="info_birth mt0">
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
									<h6>🔮소울카드 <span>- {{ data.list[store.result].soul.card }} </span></h6>
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
</template>

<script setup>
	import { ref, computed } from 'vue';
	import { useRouter } from 'vue-router';
	import { useTarotStore } from '~/stores/tarot';
	import html2canvas from 'html2canvas';
	import { jsPDF } from 'jspdf';

	const store = useTarotStore();
	const router = useRouter();
	const props = defineProps(['data']);

	const birth = store.picked === 'r1' ? store.ipt_birth8 : store.ipt_year + store.ipt_birth4;
	const f_Birth = birth.replace(/(\d{4})(\d{2})(\d{2})/, '$1년 $2월 $3일');

	const luckyMap = {
		'컬러': 'color',
		'숫자': 'number',
		'요일': 'day'
	};

	// PDF 관련
	const pdfContent = ref(null);
	const downloadPDF = () => {
		if (!pdfContent.value) return;
		store.downloadPDF({
			pdfContent: pdfContent.value,
			html2canvas,
			jsPDF,
			filename: `타로_결과_리포트_${f_Birth}.pdf`
		});
	};
</script>

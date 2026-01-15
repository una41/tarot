<template>
	<Transition name="fade">
		<div class="result result_year"  @click.stop>
			<div class="bg" @click="store.fnClose"></div>
			<div v-if="store.result !== null" class="r_wrap" ref="pdfContent">
				<!-- PDF 전용 헤더 (화면에는 안보임) -->
				<div class="pdf_only_header" style="display: none;">
					<!-- <p class="logo"><b>numerology Tarot</b></p> -->
					<h2>
						{{ store.ipt_year }}년 해운카드 타로 해석 결과
					</h2>
					<div class="sub_tit">
						{{ store.result }}번 - <span v-html="data.list[store.result].name"></span>
					</div>
				</div>
				<div class="r_top colb">
					<div class="c_left">
						<h3>{{ store.ipt_year + '년 해운카드'}} <b class="pc">결과</b> <span>(해석)</span></h3>
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
								<div class="bx_img" :style="{ background: 'url(\'https://una41.github.io/tarot/img/card/card' + store.result + '.jpg\') no-repeat 50% -4px'}">
									<span class="blind">{{ store.result }}번 {{data.list[store.result].name}} 이미지</span>
								</div>
								<!-- <button class="btn" @click="store.fnComingSoon">고유 설명 보기</button> -->
							</div>
							<div class="right">
								<div class="r_colb">
									<dl class="info_birth mt0">
										<dt>해운년도</dt>
										<dd>{{ store.ipt_year }}</dd>
									</dl>
									<dl class="mt0">
										<dt>운</dt>
										<dd><span :class="'txt_bg ' + data.list[store.result].lucky_group.grade">{{ data.list[store.result].lucky_group.grade }}</span></dd>
									</dl>
								</div>
								<div class="r_colb">
									<dl>
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
									<h6>🔮소울카드 <span>- {{ data.list[store.result].soul.card }} </span></h6>
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
									해운 카드는 {{ store.ipt_year }}년 한 해 동안 당신에게 흐르는 시간의 흐름과 기회를 보여줍니다. <br/>
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
</template>

<script setup>
	import { ref, computed } from 'vue';
	import { useTarotStore } from '~/stores/tarot';
	import html2canvas from 'html2canvas';
	import { jsPDF } from 'jspdf';

	const store = useTarotStore();
	const props = defineProps(['data']);

	const birth = store.picked === 'r1' ? store.ipt_birth8 : store.ipt_year + store.ipt_birth4;
	const f_Birth = birth.replace(/(\d{4})(\d{2})(\d{2})/, '$1년 $2월 $3일');
	const f_BirthMD = store.ipt_birth4.replace(/(\d{2})(\d{2})/, '$1월 $2일');

	const luckyMap = {
		'추천 할일': 'todo',
	};

	// PDF 관련
	const pdfContent = ref(null);
	const downloadPDF = () => {
		if (!pdfContent.value) return;
		store.downloadPDF({
			pdfContent: pdfContent.value,
			html2canvas,
			jsPDF,
			filename: `타로_${store.ipt_year}년_해운카드_해석_${f_BirthMD}.pdf`
		});
	};
</script>
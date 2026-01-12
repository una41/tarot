<template>
	<Transition name="fade">
		<div class="result"  @click.stop>
			<div class="bg" @click="store.fnClose"></div>
			<div v-if="store.result !== null" class="r_wrap result_year">
				<div class="r_top colb">
					<div class="c_left">
						<h3>{{ store.ipt_year + '년 해운카드'}}  <span>(해석)</span></h3>
						<button class="link" @click="store.fnGo('reading')">🔗리딩 보기</button>
					</div>
					<div class="c_right">
						<button class="btn_close" @click="store.fnClose"><span>닫기</span></button>
					</div>
				</div>
				<div class="r_cont">
					<h3 class="main_card_tit">
						{{ store.result }}번 - <div class="tit" v-html="data.list[store.result].name"></div>
					</h3>
					<div class="col2">
						<div class="left">
							<div class="bx_img" :style="{ background: 'url(\'https://una41.github.io/tarot/img/card/card' + store.result + '.jpg\') no-repeat 50% -4px'}">
								<span class="blind">{{ store.result }}번 {{data.list[store.result].name}} 이미지</span>
							</div>
							<button class="btn" @click="store.fnComingSoon">고유 설명 보기</button>
						</div>
						<div class="right">
							<div class="r_colb">
								<dl class="info_birth mt0">
									<dt>해운년도</dt>
									<dd>{{ store.ipt_year }}</dd>
									<!-- <dd>{{ store.ipt_year }}년 / {{ f_BirthMD }}</dd> -->
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
									<!-- <dd>{{ store.ipt_year }}년 / {{ f_BirthMD }}</dd> -->
								</dl>
								<dl>
									<dt>좋은 분기</dt>
									<dd>{{ data.list[store.result].lucky_group.lucky_timing }}</dd>
								</dl>
								</div>
							<div class="summary_box hr"  v-for="(val, key) in luckyMap" :key="key">
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
					<div class="detail">
						<template v-for="(val, key) in activeSections" :key="key">
							<div class="item" v-if="data.list[store.result][val]">
								<h4 class="d_tit">{{ key }}</h4>
								<div class="d_cont">
									<!-- 연간 로드맵 특별 렌더링 -->
									<template v-if="val === 'roadmap'">
										<p class="d_desc" v-if="data.list[store.result][val].intro" v-html="data.list[store.result][val].intro"></p>
										<div class="roadmap">
											<div class="r_item" v-if="data.list[store.result][val].q1">
												<h6 class="sub_tit">1분기 (1~3월)</h6>
												<p class="cont" v-html="data.list[store.result][val].q1"></p>
											</div>
											<div class="r_item" v-if="data.list[store.result][val].q2">
												<h6 class="sub_tit">2분기 (4~6월)</h6>
												<p class="cont" v-html="data.list[store.result][val].q2"></p>
											</div>
											<div class="r_item" v-if="data.list[store.result][val].q3">
												<h6 class="sub_tit">3분기 (7~9월)</h6>
												<p class="cont" v-html="data.list[store.result][val].q3"></p>
											</div>
											<div class="r_item" v-if="data.list[store.result][val].q4">
												<h6 class="sub_tit">4분기 (10~12월)</h6>
												<p class="cont" v-html="data.list[store.result][val].q4"></p>
											</div>
										</div>
									</template>
									<!-- 일반 섹션 렌더링 -->
									<template v-else>
										<strong class="d_sub_tit" v-if="data.list[store.result][val].sub_title">
											{{ data.list[store.result][val].sub_title }}
										</strong>
										<p class="d_desc" v-html="data.list[store.result][val].cont || data.list[store.result][val]"></p>

										<!-- 사랑과 인연 상세 (솔로/커플/결혼) -->
										<div class="love_details" v-if="val === 'love' && (data.list[store.result][val].solo || data.list[store.result][val].couple || data.list[store.result][val].married)">
											<div class="love_item" v-if="data.list[store.result][val].solo">
												<h6 class="sub_tit">💫 솔로</h6>
												<p class="love_desc" v-html="data.list[store.result][val].solo"></p>
											</div>
											<div class="love_item" v-if="data.list[store.result][val].couple">
												<h6 class="sub_tit">💕 커플</h6>
												<p class="love_desc" v-html="data.list[store.result][val].couple"></p>
											</div>
											<div class="love_item" v-if="data.list[store.result][val].married">
												<h6 class="sub_tit">💍 결혼</h6>
												<p class="love_desc" v-html="data.list[store.result][val].married"></p>
											</div>
										</div>

										<div class="bx_tip soul_tip" v-if="val === 'total' && data.list[store.result].soul">
											<h6>🔮소울카드 <span>- {{ data.list[store.result].soul.card }} </span></h6>
											<div class="sl_desc">소울카드는 메인 해운카드 해석만으로는 다 알 수 없는, 당신의 깊은 내면에 감수성 있게 감춰진 본질적인 욕구와 영혼이 가진 고유한 기질을 상징하는 카드입니다.</div>
											<div class="sl_cont" v-html="data.list[store.result].soul.cont"></div>
										</div>
										<div class="bx_tip special_tip" v-if="val === 'wealth' && data.list[store.result].rich">
											<h6>경매 및 투자운 <em>부자사관학교 전용 가이드</em></h6>
											<div class="t_cont" v-html="data.list[store.result].rich.cont"></div>
										</div>
									</template>
								</div>
							</div>
						</template>
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
				</div>
			</div>
		</div>
	</Transition>
</template>

<script setup>
	import { computed } from 'vue';
	import { useTarotStore } from '~/stores/tarot';
	const store = useTarotStore();
	const props = defineProps(['data']);

	const birth = store.picked === 'r1' ? store.ipt_birth8 : store.ipt_year + store.ipt_birth4;
	const f_Birth = birth.replace(/(\d{4})(\d{2})(\d{2})/, '$1년 $2월 $3일');
	const f_BirthMD = store.ipt_birth4.replace(/(\d{2})(\d{2})/, '$1월 $2일');

	const luckyMap = {
		'추천 할일': 'todo',
	};

	// 하단 상세 섹션 맵핑
	const activeSections = computed(() => {
		return {
			"연간 로드맵": "roadmap",
			"내 삶의 전반적 흐름": "total",
			"당신을 위한 조언": "advice",
			"재물 흐름": "wealth",
			"직업과 사회적 성공": "career",
			"학업 및 자기개발": "study",
			"사랑과 인연": "love",
			"건강과 에너지": "health",
			"운명의 가이드": "lucky_tips"
		};
	});
</script>
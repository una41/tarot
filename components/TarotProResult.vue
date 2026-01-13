<template>
	<Transition name="fade">
		<div class="result" @click.stop>
			<div class="bg" @click="store.fnClose"></div>
			<div v-if="store.result !== null" class="r_wrap result_birth">
				<div class="r_top colb">
					<div class="c_left">
						<h3>생일카드 결과 <span>(해석)</span></h3>
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
							<div class="bx_img" :style="{ background: 'url(\'https://una41.github.io/tarot/img/card/card' + store.result + '.jpg\') no-repeat 50% -4px' }">
								<span class="blind">{{ store.result }}번 {{ data.list[store.result].name }} 이미지</span>
							</div>
							<button class="btn" @click="store.fnComingSoon">고유 설명 보기</button>
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
					<div class="detail">
						<template v-for="(val, key) in activeSections" :key="key">
							<div class="item" v-if="data.list[store.result][val]">
								<h4 class="d_tit">{{ key }}</h4>
								<div class="d_cont">
									<strong class="d_sub_tit" v-if="data.list[store.result][val].sub_title">
										{{ data.list[store.result][val].sub_title }}
									</strong>
									<p class="d_desc" v-html="data.list[store.result][val].cont || data.list[store.result][val]"></p>
									<div class="bx_tip soul_tip" v-if="val === 'total' && data.list[store.result].soul.cont">
										<h6>🔮소울카드 <span>- {{ data.list[store.result].soul.card }} </span></h6>
										<div class="sl_desc">소울카드는 메인 생일카드 해석만으로는 다 알 수 없는, 당신의 깊은 내면에 감수성 있게 감춰진 본질적인 욕구와 영혼이 가진 고유한 기질을 상징하는 카드입니다.</div>
										<div class="sl_cont" v-html="data.list[store.result].soul.cont"></div>
									</div>
									<div class="bx_tip special_tip" v-if="val === 'wealth' && data.list[store.result].rich">
										<h6>경매 및 투자운 <em>부자사관학교 전용 가이드</em></h6>
										<div class="t_cont" v-html="data.list[store.result].rich.cont"></div>
									</div>
									<div class="career_tip" v-if="val === 'career' && data.list[store.result].career.recommend">
										<h6>💡추천직업</h6>
										<div class="c_cont">
											<span v-for="(job, i) in data.list[store.result].career.recommend" :key="i">{{ job }}</span>
										</div>
									</div>
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
								</div>								
								<div class="match_box" v-if="val.includes('match')"></div>
							</div>
						</template>
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

	const luckyMap = {
		'컬러': 'color',
		'숫자': 'number',
		'요일': 'day'
	};

	// 하단 상세 섹션 맵핑 (picked에 따라 다르게 구성)
	const activeSections = computed(() => {
		return {
			"내 삶의 전반적 흐름": "total",
			"당신을 위한 조언": "life_lesson",
			"타고난 성격": "character",
			"재물 관리": "wealth",
			"직업과 사회적 성공": "career",
			"학업 및 자기개발": "study",
			"사랑과 인연": "love",
			"최고의 파트너": "lucky_match",
			"주의해야 할 인연": "caution_match",
			"건강과 에너지": "health",
			"운명의 가이드": "advice"
		};
	});
</script>
<template>
	<Transition name="fade">
		<div class="result" @click.stop>
			<div class="bg" @click="store.fnClose"></div>
			<div v-if="store.result !== null" class="r_wrap result_birth">
				<div class="r_top">
					<h3>{{ store.picked === 'r1' ? '생일카드' : store.ipt_year + '년 해운카드' }} 결과</h3>
					<button class="btn_close" @click="store.fnClose"><span>닫기</span></button>
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
							<button class="btn" @click="fnComingSoon">고유 설명 보기</button>
						</div>
						<div class="right">
							<dl class="info_birth mt0">
								<dt>생년월일</dt>
								<dd>{{ f_Birth }}</dd>
							</dl>
							<div class="lucky_group" v-if="data.list[store.result].lucky_group">
								<div class="lucky_group" v-if="data.list[store.result].lucky_group">
									<dl v-for="(val, key) in luckyMap" :key="key">
										<dt>행운의 {{ key }}</dt>
										<dd>{{ data.list[store.result].lucky_group[val] }}</dd>
									</dl>
								</div>
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
									<div class="special_tip" v-if="val === 'wealth' && data.list[store.result].rich">
										<h6>경매 및 투자운 <em>부자사관학교 전용 가이드</em></h6>
										<div class="s_cont" v-html="data.list[store.result].rich.cont"></div>
									</div>
									<div class="career_tip" v-if="val === 'career' && data.list[store.result].career.recommend">
										<h6>💡추천직업</h6>
										<div class="s_cont">
											<span v-for="(job, i) in data.list[store.result].career.recommend" :key="i">{{ job }}</span>
										</div>
									</div>
									
								</div>								
								<div class="match_box" v-if="val.includes('match')"></div>
							</div>
						</template>
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

	// 좌측 이미지 하단 맵핑
	const luckyMap = {
		'컬러': 'color',
		'숫자': 'number',
		'요일': 'day'
	};

	// 하단 상세 섹션 맵핑 (picked에 따라 다르게 구성)
	const activeSections = computed(() => {
		if (store.picked === 'r1') {
			return {
				"인생 전체운": "total",
				"당신을 위한 조언": "life_lesson",
				"타고난 성격": "character",
				"재물 관리": "wealth",
				"직업과 사회적 성공": "career",
				"사랑과 인연": "love",
				"최고의 파트너": "lucky_match",
				"주의해야 할 인연": "caution_match",
				"건강과 에너지": "health",
				"운명의 가이드": "advice"
			};
		} else {
			// 해운카드의 경우 (데이터 구조에 따라 추가 확장 가능)
			return {
				"2026년 대운": "general",
				"금전 흐름": "wealth",
				"사업/직업운": "career",
				"애정/관계": "love",
				"건강 가이드": "health",
				"총평": "advice"
			};
		}
	});
	const fnComingSoon = () => {
		alert('현재 준비 중인 서비스입니다. 조금만 기다려 주세요! 😊');
	};
</script>
<template>
	<Transition name="fade">
		<div class="result"  @click.stop>
			<div class="bg" @click="store.fnClose"></div>
			<div v-if="store.result !== null" class="r_wrap result_birth">
				<div class="r_top colb">
					<div class="c_left">
						<h3>{{ store.ipt_year + '년 해운카드' }} 결과 <span>(해석)</span></h3>
						<button class="link" @click="store.fnGo('reading')">🔗 리딩 보기</button>
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
							<div class="right_inner">
								<dl class="info_birth mt0">
									<dt>해운년도</dt>
									<dd>{{ store.ipt_year }}년 / {{ f_BirthMD }}</dd>
								</dl>
								<div class="lucky_group" v-if="data.list[store.result].luck">
									<dl>
										<dt>운</dt>
										<dd>{{ getLuckText(data.list[store.result].luck) }}</dd>
									</dl>
								</div>
								<div class="bx_key">
									<span class="tag" v-for="word in data.list[store.result].keywords" :key="word">{{ '#' + word +" "}}</span>
								</div>
							</div>
							<div class="bx_tip reading_tip" v-if="data.list[store.result].advice">
								<h6>💡조언</h6>
								<ul class="t_cont">
									<!-- advice가 배열인 경우 -->
									<template v-if="Array.isArray(data.list[store.result].advice)">
										<li v-for="(item, i) in data.list[store.result].advice" :key="i" v-html="item"></li>
									</template>
									<!-- advice가 문자열인 경우 -->
									<template v-else>
										<li>{{ data.list[store.result].advice }}</li>
									</template>
								</ul>
							</div>
						</div>
					</div>
					<div class="detail">
						<!-- 전반적 흐름 (summary 또는 total) -->
						<div class="item full" v-if="data.list[store.result].summary || data.list[store.result].total">
							<h4 class="d_tit">내 삶의 전반적 흐름</h4>
							<div class="colb">
								<ul class="d_cont pc_half">
									<!-- summary.content가 있으면 사용 -->
									<template v-if="data.list[store.result].summary && data.list[store.result].summary.content">
										<li v-for="(item, i) in data.list[store.result].summary.content" :key="i" v-html="item"></li>
									</template>
									<!-- total 배열이 있으면 사용 -->
									<template v-else-if="data.list[store.result].total">
										<li v-for="(item, i) in data.list[store.result].total" :key="i" v-html="item"></li>
									</template>
								</ul>
								<div class="bx_tip soul_tip pc_half" v-if="data.list[store.result].soul">
									<h6>🔮소울카드 <span>- {{ data.list[store.result].soul.card }} </span></h6>
									<div class="sl_desc">소울카드는 메인 해운카드 해석만으로는 다 알 수 없는, 당신의 깊은 내면에 감수성 있게 감춰진 본질적인 욕구와 영혼이 가진 고유한 기질을 상징하는 카드입니다.</div>
									<div class="t_cont" v-if="data.list[store.result].soul.content">
										<div v-for="(item, i) in data.list[store.result].soul.content" :key="i" v-html="item"></div>
									</div>
								</div>
							</div>
						</div>

						<!-- 연간 로드맵 -->
						<div class="item" v-if="data.list[store.result].roadmap">
							<h4 class="d_tit">연간 로드맵</h4>
							<ul class="d_cont">
								<li v-for="(item, i) in data.list[store.result].roadmap" :key="i" v-html="item"></li>
							</ul>
						</div>

						<!-- 조언 -->
						<div class="item" v-if="data.list[store.result].leading">
							<h4 class="d_tit">조언</h4>
							<ul class="d_cont">
								<li v-for="(item, i) in data.list[store.result].leading" :key="i" v-html="item"></li>
							</ul>
						</div>

						<!-- 사랑과 인연 -->
						<div class="item" v-if="data.list[store.result].love">
							<h4 class="d_tit">사랑과 인연</h4>
							<ul class="d_cont">
								<li v-for="(item, i) in data.list[store.result].love" :key="i" v-html="item"></li>
							</ul>
						</div>

						<!-- 직업과 사회적 성공 -->
						<div class="item" v-if="data.list[store.result].career">
							<h4 class="d_tit">직업과 사회적 성공</h4>
							<ul class="d_cont">
								<li v-for="(item, i) in data.list[store.result].career" :key="i" v-html="item"></li>
							</ul>
						</div>

						<!-- 학업 및 자기개발 -->
						<div class="item" v-if="data.list[store.result].study">
							<h4 class="d_tit">학업 및 자기개발</h4>
							<ul class="d_cont">
								<li v-for="(item, i) in data.list[store.result].study" :key="i" v-html="item"></li>
							</ul>
						</div>

						<!-- 재물 흐름 -->
						<div class="item" v-if="data.list[store.result].wealth">
							<h4 class="d_tit">재물 흐름</h4>
							<ul class="d_cont">
								<li v-for="(item, i) in data.list[store.result].wealth" :key="i" v-html="item"></li>
							</ul>
						</div>

						<!-- 경매 및 투자운 (부자사관학교) -->
						<div class="item" v-if="data.list[store.result].rich">
							<h4 class="d_tit">경매 및 투자운</h4>
							<ul class="d_cont">
								<li v-for="(item, i) in data.list[store.result].rich" :key="i" v-html="item"></li>
							</ul>
						</div>

						<!-- 건강과 에너지 -->
						<div class="item" v-if="data.list[store.result].health">
							<h4 class="d_tit">건강과 에너지</h4>
							<ul class="d_cont">
								<li v-for="(item, i) in data.list[store.result].health" :key="i" v-html="item"></li>
							</ul>
						</div>

						<!-- 운명의 가이드 -->
						<div class="item" v-if="data.list[store.result].lucky_tips">
							<h4 class="d_tit">운명의 가이드</h4>
							<ul class="d_cont">
								<li v-for="(item, i) in data.list[store.result].lucky_tips" :key="i" v-html="item"></li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	</Transition>
</template>

<script setup>
	import { useTarotStore } from '~/stores/tarot';
	const store = useTarotStore();
	defineProps(['data']);

	const birth = store.picked === 'r1' ? store.ipt_birth8 : store.ipt_year + store.ipt_birth4;
	const f_Birth = birth.replace(/(\d{4})(\d{2})(\d{2})/, '$1년 $2월 $3일');
	const f_BirthMD = store.ipt_birth4.replace(/(\d{2})(\d{2})/, '$1월 $2일');

	const getLuckText = (luck) => {
		const luckMap = {
			'good': '좋음',
			'normal': '보통',
			'bad': '주의'
		};
		return luckMap[luck] || luck;
	};
</script>
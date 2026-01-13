<template>
	<Transition name="fade">
		<div class="result"  @click.stop>
			<div class="bg" @click="store.fnClose"></div>
			<div v-if="store.result !== null" class="r_wrap result_birth">
				<div class="r_top colb">
					<div class="c_left">
						<h3>{{ store.ipt_year + '년 해운카드' }} 결과 <span>(리딩)</span></h3>
						<button class="link" @click="store.fnGo('result')">🔗해석 보기</button>
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
							<div class="item hr"  v-for="(val, key) in luckyMap" :key="key">
								<h5 class="sub_tit">{{ key }}</h5>
								<p class="cont" v-html="data.list[store.result].lucky_group[val]"></p>
							</div> 
							<div class="item" v-if="data.list[store.result].summary">
								<h5 class="sub_tit" v-if="data.list[store.result].summary.sub_title">{{ data.list[store.result].summary.sub_title }}</h5>
								<ul v-if="data.list[store.result].summary.cont">
									<li v-for="(item, i) in data.list[store.result].summary.cont" :key="i" v-html="item"></li>
								</ul>
								<ul v-else-if="Array.isArray(data.list[store.result].summary)">
									<li v-for="(item, i) in data.list[store.result].summary" :key="i" v-html="item"></li>
								</ul>
							</div>
							<div class="bx_key">
								<span class="tag" v-for="word in data.list[store.result].keywords" :key="word">{{ word +" "}}</span>
							</div>
						</div>
					</div>
					<div class="detail">
						<!-- 연간 로드맵 -->
						<div class="item" v-if="data.list[store.result].roadmap">
							<h4 class="d_tit">연간 로드맵</h4>
							<ul class="d_cont">
								<li v-for="(item, i) in data.list[store.result].roadmap" :key="i" v-html="item"></li>
							</ul>
						</div>
						<!-- 전반적 흐름 (total 또는 summary) -->
						<div class="item full" v-if="data.list[store.result].total || data.list[store.result].summary">
							<h4 class="d_tit">내 삶의 전반적 흐름</h4>
							<div class="colb">
								<div class="d_cont pc_half">
									<!-- total 객체가 있으면 사용 -->
									<template v-if="data.list[store.result].total">
										<h5 class="sub_tit" v-if="data.list[store.result].total.sub_title">{{ data.list[store.result].total.sub_title }}</h5>
										<ul v-if="data.list[store.result].total.cont">
											<li v-for="(item, i) in data.list[store.result].total.cont" :key="i" v-html="item"></li>
										</ul>
										<ul v-else-if="Array.isArray(data.list[store.result].total)">
											<li v-for="(item, i) in data.list[store.result].total" :key="i" v-html="item"></li>
										</ul>
									</template>
									<!-- summary 객체가 있으면 사용 -->
									<template v-else-if="data.list[store.result].summary">
										<h5 class="sub_tit" v-if="data.list[store.result].summary.sub_title">{{ data.list[store.result].summary.sub_title }}</h5>
										<ul v-if="data.list[store.result].summary.cont">
											<li v-for="(item, i) in data.list[store.result].summary.cont" :key="i" v-html="item"></li>
										</ul>
										<ul v-else-if="Array.isArray(data.list[store.result].summary)">
											<li v-for="(item, i) in data.list[store.result].summary" :key="i" v-html="item"></li>
										</ul>
									</template>
								</div>
								<div class="bx_tip soul_tip pc_half" v-if="data.list[store.result].soul">
									<h6>🔮소울카드 <span>- {{ data.list[store.result].soul.card }} </span></h6>
									<div class="sl_desc">소울카드는 메인 해운카드 해석만으로는 다 알 수 없는, 당신의 깊은 내면에 감수성 있게 감춰진 본질적인 욕구와 영혼이 가진 고유한 기질을 상징하는 카드입니다.</div>
									<h5 class="sub_tit" v-if="data.list[store.result].soul.sub_title">{{ data.list[store.result].soul.sub_title }}</h5>
									<div class="t_cont" v-if="data.list[store.result].soul.cont">
										<div v-for="(item, i) in data.list[store.result].soul.cont" :key="i" v-html="item"></div>
									</div>
								</div>
							</div>
						</div>


						<!-- 조언 -->
						<div class="item" v-if="data.list[store.result].advice || data.list[store.result].leading">
							<h4 class="d_tit">조언</h4>
							<template v-if="data.list[store.result].advice">
								<h5 class="sub_tit" v-if="data.list[store.result].advice.sub_title">{{ data.list[store.result].advice.sub_title }}</h5>
								<ul class="d_cont" v-if="data.list[store.result].advice.cont">
									<li v-for="(item, i) in data.list[store.result].advice.cont" :key="i" v-html="item"></li>
								</ul>
								<ul class="d_cont" v-else-if="Array.isArray(data.list[store.result].advice)">
									<li v-for="(item, i) in data.list[store.result].advice" :key="i" v-html="item"></li>
								</ul>
							</template>
							<ul class="d_cont" v-else-if="data.list[store.result].leading">
								<li v-for="(item, i) in data.list[store.result].leading" :key="i" v-html="item"></li>
							</ul>
						</div>

						<!-- 재물 흐름 -->
						<div class="item" v-if="data.list[store.result].wealth">
							<h4 class="d_tit">재물 흐름</h4>
							<h5 class="sub_tit" v-if="data.list[store.result].wealth.sub_title">{{ data.list[store.result].wealth.sub_title }}</h5>
							<ul class="d_cont" v-if="data.list[store.result].wealth.cont">
								<li v-for="(item, i) in data.list[store.result].wealth.cont" :key="i" v-html="item"></li>
							</ul>
							<ul class="d_cont" v-else-if="Array.isArray(data.list[store.result].wealth)">
								<li v-for="(item, i) in data.list[store.result].wealth" :key="i" v-html="item"></li>
							</ul>
						</div>

						<!-- 경매 및 투자운 (부자사관학교) -->
						<div class="item" v-if="data.list[store.result].rich">
							<h4 class="d_tit">경매 및 투자운</h4>
							<h5 class="sub_tit" v-if="data.list[store.result].rich.sub_title">{{ data.list[store.result].rich.sub_title }}</h5>
							<ul class="d_cont" v-if="data.list[store.result].rich.cont">
								<li v-for="(item, i) in data.list[store.result].rich.cont" :key="i" v-html="item"></li>
							</ul>
							<ul class="d_cont" v-else-if="Array.isArray(data.list[store.result].rich)">
								<li v-for="(item, i) in data.list[store.result].rich" :key="i" v-html="item"></li>
							</ul>
						</div>
						<!-- 직업과 사회적 성공 -->
						<div class="item" v-if="data.list[store.result].career">
							<h4 class="d_tit">직업과 사회적 성공</h4>
							<h5 class="sub_tit" v-if="data.list[store.result].career.sub_title">{{ data.list[store.result].career.sub_title }}</h5>
							<ul class="d_cont" v-if="data.list[store.result].career.cont">
								<li v-for="(item, i) in data.list[store.result].career.cont" :key="i" v-html="item"></li>
							</ul>
							<ul class="d_cont" v-else-if="Array.isArray(data.list[store.result].career)">
								<li v-for="(item, i) in data.list[store.result].career" :key="i" v-html="item"></li>
							</ul>
						</div>

						<!-- 학업 및 자기개발 -->
						<div class="item" v-if="data.list[store.result].study">
							<h4 class="d_tit">학업 및 자기개발</h4>
							<h5 class="sub_tit" v-if="data.list[store.result].study.sub_title">{{ data.list[store.result].study.sub_title }}</h5>
							<ul class="d_cont" v-if="data.list[store.result].study.cont">
								<li v-for="(item, i) in data.list[store.result].study.cont" :key="i" v-html="item"></li>
							</ul>
							<ul class="d_cont" v-else-if="Array.isArray(data.list[store.result].study)">
								<li v-for="(item, i) in data.list[store.result].study" :key="i" v-html="item"></li>
							</ul>
						</div>

						<!-- 사랑과 인연 -->
						<div class="item" v-if="data.list[store.result].love">
							<h4 class="d_tit">사랑과 인연</h4>
							<h5 class="sub_tit" v-if="data.list[store.result].love.sub_title">{{ data.list[store.result].love.sub_title }}</h5>
							<p class="d_cont" v-if="data.list[store.result].love.cont && typeof data.list[store.result].love.cont === 'string'" v-html="data.list[store.result].love.cont"></p>
							<ul class="d_cont" v-else-if="data.list[store.result].love.cont && Array.isArray(data.list[store.result].love.cont)">
								<li v-for="(item, i) in data.list[store.result].love.cont" :key="i" v-html="item"></li>
							</ul>
							<div v-if="data.list[store.result].love.solo" class="d_cont">
								<h5 class="sub_tit">솔로</h5>
								<ul>
									<li v-for="(item, i) in data.list[store.result].love.solo" :key="'solo-' + i" v-html="item"></li>
								</ul>
							</div>
							<div v-if="data.list[store.result].love.couple" class="d_cont">
								<h5 class="sub_tit">연인</h5>
								<ul>
									<li v-for="(item, i) in data.list[store.result].love.couple" :key="'couple-' + i" v-html="item"></li>
								</ul>
							</div>
							<div v-if="data.list[store.result].love.married" class="d_cont">
								<h5 class="sub_tit">기혼</h5>
								<ul>
									<li v-for="(item, i) in data.list[store.result].love.married" :key="'married-' + i" v-html="item"></li>
								</ul>
							</div>
							<ul v-if="!data.list[store.result].love.sub_title && !data.list[store.result].love.solo && !data.list[store.result].love.couple && !data.list[store.result].love.married" class="d_cont">
								<li v-for="(item, i) in data.list[store.result].love" :key="i" v-html="item"></li>
							</ul>
						</div>
						<!-- 건강과 에너지 -->
						<div class="item" v-if="data.list[store.result].health">
							<h4 class="d_tit">건강과 에너지</h4>
							<h5 class="sub_tit" v-if="data.list[store.result].health.sub_title">{{ data.list[store.result].health.sub_title }}</h5>
							<ul class="d_cont" v-if="data.list[store.result].health.cont">
								<li v-for="(item, i) in data.list[store.result].health.cont" :key="i" v-html="item"></li>
							</ul>
							<ul class="d_cont" v-else-if="Array.isArray(data.list[store.result].health)">
								<li v-for="(item, i) in data.list[store.result].health" :key="i" v-html="item"></li>
							</ul>
						</div>

						<!-- 운명의 가이드 -->
						<div class="item" v-if="data.list[store.result].lucky_tips">
							<h4 class="d_tit">운명의 가이드</h4>
							<h5 class="sub_tit" v-if="data.list[store.result].lucky_tips.sub_title">{{ data.list[store.result].lucky_tips.sub_title }}</h5>
							<ul class="d_cont" v-if="data.list[store.result].lucky_tips.cont">
								<li v-for="(item, i) in data.list[store.result].lucky_tips.cont" :key="i" v-html="item"></li>
							</ul>
							<ul class="d_cont" v-else-if="Array.isArray(data.list[store.result].lucky_tips)">
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

	const luckyMap = {
		'추천 할일': 'todo',
	};
</script>
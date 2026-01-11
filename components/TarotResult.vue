<template>
	<Transition name="fade">
		<div class="result result_reading"  @click.stop>
			<div class="bg" @click="store.fnClose"></div>
			<div v-if="store.result !== null" class="r_wrap result_birth">
				<div class="r_top colb">
					<div class="c_left">
						<h3>{{ store.picked === 'r1' ? '생일카드' : store.ipt_year + '년 해운카드' }} 결과 <span>(리딩)</span></h3>
						<button class="link" @click="store.fnGo('result')">🔗 해석 보기</button>
					</div>
					<div class="c_right">
						<button class="btn_close" @click="store.fnClose"><span>닫기</span></button>
					</div>
				</div><div class="r_cont">
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
									<dt>생년월일</dt>
									<dd>{{ f_Birth }}</dd>
								</dl>
								<div class="lucky_group" v-if="data.list[store.result].lucky_group">
									<dl v-for="(val, key) in luckyMap" :key="key">
										<dt>행운의 {{ key }}</dt>
										<dd>{{ data.list[store.result].lucky_group[val] }}</dd>
									</dl>
								</div>
								<div class="bx_key">
									<span class="tag" v-for="word in data.list[store.result].keyword" :key="word">{{ '#' + word +" "}}</span>
								</div>
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
                        <div class="item full" v-if="data.list[store.result].summary">
                            <h4 class="d_tit">내 삶의 전반적 흐름</h4>
                            <div class="colb">
								<ul class="d_cont pc_half">
									<li v-for="(item, i) in data.list[store.result].summary" :key="i" v-html="item"></li>
								</ul>
								<div class="bx_tip soul_tip pc_half">
									<h6>🔮소울카드 <span>- {{ data.list[store.result].soul.card }} </span></h6>
									<div class="sl_desc">소울카드는 메인 생일카드 해석만으로는 다 알 수 없는, 당신의 깊은 내면에 감수성 있게 감춰진 본질적인 욕구와 영혼이 가진 고유한 기질을 상징하는 카드입니다.</div>
									<div class="t_cont" v-html="data.list[store.result].soul.cont"></div>
								</div>
							</div>
                        </div>
						<div class="item" v-if="data.list[store.result].theme">
							<h5 class="d_tit">인생테마</h5>
							<ul class="d_cont">
								<li v-for="(item, i) in data.list[store.result].theme" :key="i" v-html="item"></li>
							</ul>
						</div>
                        <div class="item" v-if="data.list[store.result].point">
                            <h4 class="d_tit">성격특성</h4>
                            <ul class="d_cont">
								<li v-for="(item, i) in data.list[store.result].point" :key="i" v-html="item"></li>
                            </ul>
                        </div>
                        <div class="item" v-if="data.list[store.result].leading">
                            <h4 class="d_tit">조언</h4>
                            <ul class="d_cont">
								<li v-for="(item, i) in data.list[store.result].leading" :key="i" v-html="item"></li>
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
	const birth = store.picked === 'r1' ? store.ipt_birth8 : store.ipt_year+ store.ipt_birth4; // 혹은 "19902190"
	const f_Birth = birth.replace(/(\d{4})(\d{2})(\d{2})/, '$1년 $2월 $3일');
	const luckyMap = { '컬러': 'color', '숫자': 'number', '요일': 'day' };

</script>

<template>
	<Transition name="fade">
		<div class="result"  @click.stop>
			<div class="bg" @click="store.fnClose"></div>
			<div v-if="store.result !== null" class="r_wrap result_birth">
				<div class="r_top">
					<h3>{{store.picked === 'r1' ? '생일카드' : store.ipt_year + '년 해운카드'}}</h3>
					<button class="btn_close" @click="store.fnClose"><span>닫기</span></button>
				</div>
				<div class="r_cont">
					<h3>{{ store.result }}번 - <div class="tit" v-html="data.list[store.result].name"></div></h3>
					<div class="col2">
						<div class="left">
							<div class="bx_img" :style="{ background: 'url(\'https://una41.github.io/tarot/img/card/card' + store.result + '.jpg\') no-repeat 50% -4px'}">
								<span class="blind">{{ store.result }}번 {{data.list[store.result].name}} 이미지</span>
							</div>
						</div>
						<div class="right" v-if="store.picked === 'r1'">
							<dl class="mt0">
								<dt>생년월일</dt>
								<dd>{{ f_Birth }}</dd>
							</dl>
							<dl v-for="(val, key) in {인생테마: 'keyword', 성격특성: 'point', 교훈: 'leading', 요약: 'Summary'}" :key="key">
								<dt>{{ key }}</dt>
								<dd>
									<ul>
										<li v-for="(item, i) in data.list[store.result][val]" :key="i">{{ item }}</li>
									</ul>
								</dd>
							</dl>
						</div>
						<div class="right" v-else>
							<dl class="mt0">
								<dt>생년월일</dt>
								<dd>{{f_Birth}}</dd>
							</dl>
							<dl>
								<dt>운</dt>
								<dd><span :class="'txt_bg ' + data.list[store.result].luck">{{ data.list[store.result].luck }}</span></dd>
							</dl>
							<dl v-for="(val, key) in {내용: 'leading', 건강: 'health'}" :key="key">
								<dt>{{ key }}</dt>
								<dd>
									<ul>
										<li v-for="(item, i) in data.list[store.result][val]" :key="i">{{ item }}</li>
									</ul>
								</dd>
							</dl>
							<dl>
								<dt>운</dt>
								<dd>{{ data.list[store.result].advice }}</dd>
							</dl>
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
</script>
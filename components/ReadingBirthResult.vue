<template>
	<Transition name="fade">
		<div class="result result_reading"  @click.stop>
			<div class="bg" @click="store.fnClose"></div>
			<div v-if="store.result !== null" class="r_wrap result_birth" ref="pdfContent">
				<!-- PDF 전용 헤더 (화면에는 안보임) -->
				<div class="pdf_only_header" style="display: none;">
					<h2 style="text-align: center; margin-bottom: 20px; font-size: 24px;">
						{{ store.picked === 'r1' ? '생일카드' : store.ipt_year + '년 해운카드' }} 타로 리딩 결과
					</h2>
					<p style="text-align: center; margin-bottom: 30px; color: #666;">
						생년월일: {{ f_Birth }}
					</p>
				</div>
				<div class="r_top colb">
					<div class="c_left">
						<h3>{{ store.picked === 'r1' ? '생일카드' : store.ipt_year + '년 해운카드' }} 결과 <span>(리딩)</span></h3>
					</div>
					<div class="c_right">
						<button class="btn_close" @click="store.fnClose"><span>닫기</span></button>
					</div>
					<div class="gnb">
						<button class="link" @click="store.fnGo('result')">🔗 해석</button>
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
						<div class="area">
							<div class="item" v-if="data.list[store.result].theme">
								<h5 class="d_tit">인생테마</h5>
								<div class="d_cont">
									<ul class="d_desc">
										<li v-for="(item, i) in data.list[store.result].theme" :key="i" v-html="item"></li>
									</ul>
								</div>
							</div>
							<div class="item" v-if="data.list[store.result].point">
								<h4 class="d_tit">성격특성</h4>
								<div class="d_cont">
									<ul class="d_desc">
										<li v-for="(item, i) in data.list[store.result].point" :key="i" v-html="item"></li>
									</ul>
								</div>
							</div>
						</div>
						<div class="area">
							<div class="item summary" v-if="data.list[store.result].summary">
								<h4 class="d_tit">내 삶의 전반적 흐름</h4>
								<div class="d_cont colb">
									<ul class="d_desc pc_half">
										<li v-for="(item, i) in data.list[store.result].summary" :key="i" v-html="item"></li>
									</ul>
									<div class="bx_tip soul_tip pc_half">
										<h6>🔮소울카드 <span>- {{ data.list[store.result].soul.card }} </span></h6>
										<ul class="sl_cont">
											<li v-for="(item, i) in data.list[store.result].soul.cont" :key="i" v-html="item"></li>
										</ul>
									</div>
								</div>
							</div>
						</div>
						<div class="area">
							<div class="item" v-if="data.list[store.result].leading">
								<h4 class="d_tit">조언</h4>
								<div class="d_cont">
									<ul class="d_desc">
										<li v-for="(item, i) in data.list[store.result].leading" :key="i" v-html="item"></li>
									</ul>
								</div>
							</div>
							<div class="item" v-if="data.list[store.result].wealth">
								<h4 class="d_tit">재물 관리</h4>
								<div class="d_cont">
									<ul class="d_desc">
										<li v-for="(item, i) in data.list[store.result].wealth.cont" :key="i" v-html="item"></li>
									</ul>
								</div>
								<div class="bx_tip special_tip" v-if="data.list[store.result].rich">
									<h6>💰경매 및 투자운 <em>부자사관학교 전용 가이드</em></h6>
									<ul class="t_cont">
										<li v-for="(item, i) in data.list[store.result].rich.cont" :key="i" v-html="item"></li>
									</ul>
								</div>
							</div>
						</div>
						<div class="area">
							<div class="item" v-if="data.list[store.result].career">
								<h4 class="d_tit">직업과 사회적 성공</h4>
								<div class="d_cont">
									<ul class="d_desc">
										<li v-for="(item, i) in data.list[store.result].career.cont" :key="i" v-html="item"></li>
									</ul>
								</div>
							</div>
							<div class="item" v-if="data.list[store.result].study">
								<h4 class="d_tit">학업 및 자기개발</h4>
								<div class="d_cont">
									<ul class="d_desc">
										<li v-for="(item, i) in data.list[store.result].study.cont" :key="i" v-html="item"></li>
									</ul>
								</div>
							</div>
						</div>
						<div class="area love">
							<div class="item">
								<h4 class="d_tit">사랑과 인연</h4>
								<div class="d_cont">
									<ul class="d_desc">
										<li v-for="(item, i) in data.list[store.result].love.cont" :key="i" v-html="item"></li>
									</ul>
								</div>
								<!-- 사랑과 인연 상세 (솔로/커플/결혼) -->
								<div class="love_details" v-if="data.list[store.result].love.solo || data.list[store.result].love.couple || data.list[store.result].love.married">
									<div class="love_item" v-if="data.list[store.result].love.solo">
										<h6 class="sub_tit">💫 솔로</h6>
										<ul class="love_desc">
											<li v-for="(item, i) in data.list[store.result].love.solo" :key="i" v-html="item"></li>
										</ul>
									</div>
									<div class="love_item" v-if="data.list[store.result].love.couple">
										<h6 class="sub_tit">💕 커플</h6>
										<ul class="love_desc">
											<li v-for="(item, i) in data.list[store.result].love.couple" :key="i" v-html="item"></li>
										</ul>
									</div>
									<div class="love_item" v-if="data.list[store.result].love.married">
										<h6 class="sub_tit">💍 결혼</h6>
										<ul class="love_desc">
											<li v-for="(item, i) in data.list[store.result].love.married" :key="i" v-html="item"></li>
										</ul>
									</div>
								</div>
							</div>
						</div>
						<div class="area">
							<div class="item">
								<h4 class="d_tit">최고의 파트너</h4>
								<div class="d_cont">
									<ul class="d_desc">
										<li v-for="(item, i) in data.list[store.result].lucky_match.cont" :key="i" v-html="item"></li>
									</ul>
								</div>
							</div>
							<div class="item">
								<h4 class="d_tit">주의해야 할 인연</h4>
								<div class="d_cont">
									<ul class="d_desc">
										<li v-for="(item, i) in data.list[store.result].lucky_match.cont" :key="i" v-html="item"></li>
									</ul>
								</div>
							</div>
						</div>
						<div class="area">
							<div class="item">
								<h4 class="d_tit">건강과 에너지</h4>
								<div class="d_cont">
									<ul class="d_desc">
										<li v-for="(item, i) in data.list[store.result].health.cont" :key="i" v-html="item"></li>
									</ul>
								</div>
							</div>
							<div class="item">
								<h4 class="d_tit">운명의 가이드</h4>
								<div class="d_cont">
									<ul class="d_desc">
										<li v-for="(item, i) in data.list[store.result].advice.cont" :key="i" v-html="item"></li>
									</ul>
								</div>
							</div>
						</div>
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
	defineProps(['data']);

	const birth = store.picked === 'r1' ? store.ipt_birth8 : store.ipt_year+ store.ipt_birth4; // 혹은 "19902190"
	const f_Birth = birth.replace(/(\d{4})(\d{2})(\d{2})/, '$1년 $2월 $3일');
	const luckyMap = { '컬러': 'color', '숫자': 'number', '요일': 'day' };
	const activeSections = computed(() => {
		return {
			"건강과 에너지": "health",
			"운명의 가이드": "advice"
		};
	});

	// PDF 관련
	const pdfContent = ref(null);

	const downloadPDF = async () => {
		if (!pdfContent.value) return;

		try {
			const element = pdfContent.value;

			// PDF 전용 요소 표시
			const pdfOnlyElements = element.querySelectorAll('.pdf_only_header');
			pdfOnlyElements.forEach(el => el.style.display = 'block');

			// 화면 전용 요소 숨기기 (버튼 등)
			const screenOnlyElements = element.querySelectorAll('.r_top');
			screenOnlyElements.forEach(el => el.style.display = 'none');

			// 스크롤 위치 저장 및 최상단으로 이동
			const originalScrollTop = window.pageYOffset;
			window.scrollTo(0, 0);

			// 약간의 대기 시간 후 캔버스 생성 (DOM 업데이트 대기)
			await new Promise(resolve => setTimeout(resolve, 100));

			// html2canvas로 캔버스 생성
			const canvas = await html2canvas(element, {
				scale: 2,
				useCORS: true,
				logging: false,
				scrollY: 0,
				scrollX: 0,
				height: element.scrollHeight,
				windowHeight: element.scrollHeight,
				allowTaint: true,
				backgroundColor: '#ffffff'
			});

			// 캔버스를 이미지로 변환
			const imgData = canvas.toDataURL('image/jpeg', 0.98);

			// PDF 생성 - A4 크기
			const pdf = new jsPDF({
				unit: 'mm',
				format: 'a4',
				orientation: 'portrait'
			});

			// A4 크기 설정
			const pdfWidth = 210; // A4 width in mm
			const pdfHeight = 297; // A4 height in mm
			const margin = 10;
			const imgWidth = pdfWidth - (margin * 2);
			const imgHeight = (canvas.height * imgWidth) / canvas.width;

			let heightLeft = imgHeight;
			let position = margin;

			// 첫 페이지
			pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
			heightLeft -= (pdfHeight - margin);

			// 추가 페이지
			while (heightLeft > 0) {
				position = -(imgHeight - heightLeft) + margin;
				pdf.addPage();
				pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
				heightLeft -= (pdfHeight - margin);
			}

			const cardType = store.picked === 'r1' ? '생일카드' : `${store.ipt_year}년_해운카드`;
			const filename = `타로_${cardType}_리딩_${f_Birth}.pdf`;
			pdf.save(filename);

			// 원래 상태로 복원
			pdfOnlyElements.forEach(el => el.style.display = 'none');
			screenOnlyElements.forEach(el => el.style.display = '');
			window.scrollTo(0, originalScrollTop);
		} catch (error) {
			console.error('PDF 생성 오류:', error);
			alert('PDF 생성 중 오류가 발생했습니다.');

			// 에러 발생 시에도 원래 상태로 복원
			const pdfOnlyElements = pdfContent.value?.querySelectorAll('.pdf_only_header');
			const screenOnlyElements = pdfContent.value?.querySelectorAll('.r_top');
			pdfOnlyElements?.forEach(el => el.style.display = 'none');
			screenOnlyElements?.forEach(el => el.style.display = '');
		}
	};
</script>

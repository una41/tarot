<template>
  <div class="app_down_wrap wrap">
    <ProYearResult
      v-if="proYearData && isValidCard"
      :data="proYearData"
    />

    <div v-else-if="!pending" class="no_data">
      해당하는 카드 정보를 찾을 수 없습니다.
    </div>

    <!-- 앱 웹뷰 전용 플로팅 버튼 -->
    <div v-if="proYearData && isValidCard" class="app_cover_down">
      <div class="app_top">
        <h3>해운카드 해석 다운 or 복사</h3>
      </div>
      <div class="app_contentr">
        <button class="btn_down pdf" @click="handlePdf">
          <span class="ico">💾</span>
          <span>PDF</span>
        </button>
        <!-- PDF 미완료: 다운로드 + 파일 준비 시작 -->
        <button v-if="!sharedPdfFile" class="btn_down btn_kakao_share" @click="handlePdfAndPrepare">
          <span class="ico_kakao"></span>
          <span>PDF 다운 후 공유</span>
        </button>
        <!-- PDF 완료: 파일 준비됨 → user gesture로 즉시 share -->
        <button v-else class="btn_down btn_kakao_share" @click="handleShareFile">
          <span class="ico_kakao"></span>
          <span>카카오로 공유하기</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'subscription' })
import { ref, computed, watch, watchEffect } from 'vue';
import { useTarotStore } from '~/stores/tarot';
import { useKakaoShare } from '~/composables/useKakaoShare';

const route = useRoute();
const store = useTarotStore();
const { fnSharePdfFile, fnShareKakao } = useKakaoShare();

// PDF 완료 후 미리 준비해둔 File 객체 (user gesture 시점에 바로 share 호출용)
const sharedPdfFile = ref(null);

// pro_year.json 데이터 가져오기 (해운카드 해석 페이지용)
const { data: proYearData, pending } = await useFetch('/data/pro_year.json');

// URL에서 카드 번호 추출 (/app/year/4 -> 4)
const cardId = computed(() => {
  const slug = route.params.slug;
  const raw = Array.isArray(slug) ? slug[0] : slug;
  return raw !== undefined ? Number(raw) : null;
});

// 유효한 카드 번호인지 확인 (0~21)
const isValidCard = computed(() => {
  const id = cardId.value;
  if (id === null || isNaN(id)) return false;
  if (!proYearData.value?.list) return false;
  return id >= 0 && id < proYearData.value.list.length;
});

// store에 값 세팅 (ProYearResult가 store.result, store.picked 등을 참조)
watchEffect(() => {
  if (isValidCard.value) {
    store.result = cardId.value;
    store.picked = 'r2';
    store.isReading = false;
  }
});

// PDF 버튼 클릭 시뮬레이션
const triggerPdfBtn = () => {
  const pdfBtn = document.querySelector('.result .gnb .btn_pdf');
  if (pdfBtn) pdfBtn.click();
};

// PDF 다운로드만
const handlePdf = () => {
  triggerPdfBtn();
};

// PDF 다운로드 + 공유용 File 미리 준비
// (share는 user gesture 직접 호출이어야 하므로 여기선 파일만 준비)
const handlePdfAndPrepare = () => {
  sharedPdfFile.value = null;
  triggerPdfBtn();

  let pdfStarted = false;
  const stopWatch = watch(() => store.loader.isPdfLoading, async (loading) => {
    if (loading) {
      pdfStarted = true;
    } else if (pdfStarted) {
      stopWatch();
      if (!store.lastPdfDataUri) return;
      // dataUri → Blob → File (watch 콜백에서 미리 변환해둠)
      const res = await fetch(store.lastPdfDataUri);
      const blob = await res.blob();
      sharedPdfFile.value = new File(
        [blob],
        store.lastPdfFilename || '타로_해운카드.pdf',
        { type: 'application/pdf' }
      );
    }
  });
};

// user gesture 직접 호출 → navigator.share() 동기 실행
const handleShareFile = () => {
  if (!sharedPdfFile.value) return;
  const cardName = document.querySelector('.result .main_card_tit')?.textContent?.trim() || '';
  fnSharePdfFile(sharedPdfFile.value, {
    title: '수비학 타로 - 해운카드 해석',
    description: cardName || '나의 해운카드 타로 결과를 확인해보세요!',
  });
};
</script>

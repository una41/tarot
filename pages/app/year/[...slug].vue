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
        <button class="btn_down copy" @click="handleCopy">
          <span class="ico">📋</span>
          <span>복사</span>
        </button>
        <button class="btn_down pdf" @click="handlePdf">
          <span class="ico">💾</span>
          <span>PDF</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watchEffect } from 'vue';
import { useTarotStore } from '~/stores/tarot';

const route = useRoute();
const store = useTarotStore();

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

// 플로팅 버튼 → ProYearResult 내부의 복사/PDF 모달 트리거
const handleCopy = () => {
  const copyBtn = document.querySelector('.result .gnb .btn_copy');
  if (copyBtn) copyBtn.click();
};

const handlePdf = () => {
  const pdfBtn = document.querySelector('.result .gnb .btn_pdf');
  if (pdfBtn) pdfBtn.click();
};
</script>

<template>
  <div>
    <!-- 동적 라우트에서는 wiki/index.vue 컴포넌트를 렌더링 -->
    <!-- index.vue가 모든 라우트 파라미터를 처리합니다 -->
    <WikiIndex />
  </div>
</template>

<script setup>
// wiki/index.vue 컴포넌트를 직접 임포트하여 렌더링
import WikiIndex from './index.vue';
</script>

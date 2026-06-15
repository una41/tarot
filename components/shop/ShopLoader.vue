<template>
  <Transition name="shop_loader_fade">
    <div v-if="isVisible" class="shop_loader">
      <div class="loader_content">
        <div class="loader_icon">
          <img src="/img/icon_ball.png" alt="" class="ico_ball" />
        </div>
        <h1 class="loader_tit">numerologyTarot</h1>
        <span class="loader_badge">Shop</span>
        <div class="loader_bar">
          <div class="loader_bar_inner"></div>
        </div>
        <p class="loader_sub">잠시만 기다려 주세요...</p>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{ isVisible: boolean }>()
</script>

<style lang="scss" scoped>
@use '@/assets/scss/variable' as *;
@use '@/assets/scss/mixin' as *;

.shop_loader {
  position: fixed;
  inset: 0;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;

  .loader_content {
    text-align: center;
  }

  .loader_icon {
    margin-bottom: 20px;
    animation: shop_float 2s ease-in-out infinite;

    .ico_ball {
      width: 56px;
      height: 56px;
      object-fit: contain;
    }
  }

  .loader_tit {
    @include font(17, 17, $black, $bold);
    letter-spacing: -0.3px;
    margin-bottom: 8px;
  }

  .loader_badge {
    @include font(11, normal, #fff, $bold);
    display: inline-block;
    background: $black;
    padding: 3px 10px;
    border-radius: 4px;
    letter-spacing: 0.5px;
    margin-bottom: 28px;
  }

  .loader_bar {
    width: 160px;
    height: 2px;
    background: $gray200;
    margin: 0 auto 14px;
    border-radius: 2px;
    overflow: hidden;

    .loader_bar_inner {
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, $point, transparent);
      animation: shop_loading 1.4s infinite;
    }
  }

  .loader_sub {
    @include font(12, 12, $gray400);
    letter-spacing: 0.3px;
  }
}

.shop_loader_fade-leave-active {
  transition: opacity 600ms ease, filter 600ms ease;
}
.shop_loader_fade-leave-to {
  opacity: 0;
  filter: blur(6px);
}

@keyframes shop_float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes shop_loading {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
</style>

<template>
  <div>
    <ShopLoader :is-visible="!shopStore.authChecked" />
    <slot />
    <Transition name="s_fade">
      <div v-if="shopStore.alertData.isVisible" class="shop_alert_dim" @click="shopStore.closeAlert()">
        <div class="shop_alert" @click.stop>
          <p class="alert_icon">{{ shopStore.alertData.icon }}</p>
          <p v-if="shopStore.alertData.title" class="alert_tit">{{ shopStore.alertData.title }}</p>
          <p class="alert_msg">{{ shopStore.alertData.message }}</p>
          <button type="button" class="shop_btn" @click="shopStore.closeAlert()">확인</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from '#imports'
import { useShopStore } from '~/stores/useShopStore'

const shopStore = useShopStore()

onMounted(() => {
  shopStore.checkAuth()
})
</script>

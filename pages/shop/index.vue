<template>
  <div class="shop_wrap">

    <header class="shop_header">
      <div class="header_inner">
        <h1 class="l_logo">
          <img src="/img/icon_ball.png" alt="" class="logo_ico" />
          <span>numerologyTarot</span>
        </h1>
        <div class="header_right">
          <div class="user_menu" :class="{ on: isMenuOpen }">
            <button type="button" class="btn_menu" @click="isMenuOpen = !isMenuOpen">
              <span class="bar"></span>
              <span class="bar"></span>
              <span class="bar"></span>
              <span class="blind">메뉴</span>
            </button>
            <div class="user_dropdown">
              <p class="user_name">{{ shopStore.user?.name || '' }}님</p>
              <button type="button" class="btn_logout" @click="handleLogout">로그아웃</button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <nav class="tab_cate">
      <ul class="list_tab">
        <li v-for="tab in categories" :key="tab.id">
          <button
            type="button"
            class="btn_tab"
            :class="{ on: activeCategory === tab.id }"
            @click="activeCategory = tab.id"
          >
            <span v-if="tab.emoji" class="tab_ico">{{ tab.emoji }}</span>
            {{ tab.label }}
          </button>
        </li>
      </ul>
    </nav>

    <main class="shop_main">
      <ul class="list_product">
        <li v-for="item in filteredItems" :key="item.id" class="product_item">
          <button type="button" class="product_link">
            <div class="thumb" :style="{ background: item.bgColor }">
              <div class="thumb_overlay">
                <div v-if="item.expert" class="expert_area">
                  <p class="expert_type">{{ item.expertType }}</p>
                  <p class="expert_name">{{ item.expert }}</p>
                </div>
                <p class="thumb_title">{{ item.title }}</p>
              </div>
              <span v-if="item.badge" class="product_badge" :class="item.badgeType">{{ item.badge }}</span>
            </div>
            <div class="product_info">
              <strong class="product_tit">{{ item.title }}</strong>
              <div class="product_meta">
                <span v-if="item.views" class="meta_view">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/><path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/></svg>
                  {{ formatNum(item.views) }}
                </span>
                <span class="meta_like">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.281 8.717 2.01z"/></svg>
                  {{ formatNum(item.likes) }}
                </span>
                <span v-if="item.price" class="meta_price">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8"/><path d="M8.75 9.965c.89-.15 1.495-.737 1.495-1.543 0-1.14-1.05-1.738-2.07-1.738H5.5V11h1.25V9.55h.625l.375.15V11H9l-1.25-1.035zm-2-2.378h1.675c.525 0 1.05.187 1.05.837 0 .65-.525.838-1.05.838H6.75V7.587zM5 5h6v1H5z"/></svg>
                  {{ item.price.toLocaleString() }}
                </span>
              </div>
            </div>
          </button>
        </li>
      </ul>
    </main>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from '#imports'
import { useShopStore } from '~/stores/useShopStore'

definePageMeta({ middleware: 'shop', layout: 'shop' })

const shopStore = useShopStore()

interface IShopItem {
  id: number
  title: string
  expert: string | null
  expertType: string | null
  bgColor: string
  likes: number
  price: number | null
  views: number | null
  badge: string | null
  badgeType: string | null
  category: string
}

const isMenuOpen = ref<boolean>(false)
const activeCategory = ref<string>('all')

const categories = [
  { id: 'all', label: 'NEW', emoji: '🎉' },
  { id: 'fortune', label: '신년운세', emoji: '🐯' },
  { id: 'saju', label: '사주', emoji: '🔮' },
  { id: 'tarot', label: '타로', emoji: '🃏' },
  { id: 'star', label: '별자리', emoji: '⭐' },
  { id: 'number', label: '수비학', emoji: '✨' },
]

const shopItems = ref<IShopItem[]>([
  {
    id: 1,
    title: '이 사람과의 관계, 계속 가도 될까요?',
    expert: '루카',
    expertType: '모던 클래식 타로 마스터',
    bgColor: 'linear-gradient(160deg, #87ceeb 0%, #4a9e5c 60%, #2d6a4f 100%)',
    likes: 99,
    price: 500,
    views: null,
    badge: null,
    badgeType: null,
    category: 'tarot',
  },
  {
    id: 2,
    title: '7월 타로 재물운',
    expert: '아이샤',
    expertType: '타로',
    bgColor: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 60%, #d97706 100%)',
    likes: 263,
    price: null,
    views: 11730,
    badge: '아이샤 타로',
    badgeType: 'type_green',
    category: 'tarot',
  },
  {
    id: 3,
    title: '2026 나의 신년운세 완벽 분석',
    expert: '지윤',
    expertType: '운세 전문가',
    bgColor: 'linear-gradient(160deg, #1e3a8a 0%, #3b0764 60%, #1a1a2e 100%)',
    likes: 512,
    price: 800,
    views: null,
    badge: 'NEW',
    badgeType: 'type_point',
    category: 'fortune',
  },
  {
    id: 4,
    title: '연애운 완전 분석 — 그 사람 마음은?',
    expert: '하린',
    expertType: '러브 타로 마스터',
    bgColor: 'linear-gradient(160deg, #be185d 0%, #9d174d 50%, #6b21a8 100%)',
    likes: 324,
    price: 600,
    views: null,
    badge: null,
    badgeType: null,
    category: 'tarot',
  },
  {
    id: 5,
    title: '오늘의 수비학 에너지 리딩',
    expert: null,
    expertType: null,
    bgColor: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%)',
    likes: 187,
    price: null,
    views: 4820,
    badge: '무료',
    badgeType: 'type_blue',
    category: 'number',
  },
  {
    id: 6,
    title: '나의 사주팔자 2026년 운세',
    expert: '명현',
    expertType: '사주 명리 마스터',
    bgColor: 'linear-gradient(160deg, #78350f 0%, #92400e 50%, #b45309 100%)',
    likes: 445,
    price: 1000,
    views: null,
    badge: null,
    badgeType: null,
    category: 'saju',
  },
  {
    id: 7,
    title: '이번 달 별자리 운세 총정리',
    expert: null,
    expertType: null,
    bgColor: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
    likes: 228,
    price: null,
    views: 7340,
    badge: '인기',
    badgeType: 'type_red',
    category: 'star',
  },
  {
    id: 8,
    title: '직장운 · 금전운 집중 타로 리딩',
    expert: '세라',
    expertType: '비즈니스 타로 전문가',
    bgColor: 'linear-gradient(160deg, #1f2937 0%, #374151 50%, #4b5563 100%)',
    likes: 156,
    price: 700,
    views: null,
    badge: null,
    badgeType: null,
    category: 'tarot',
  },
])

const filteredItems = computed<IShopItem[]>(() => {
  if (activeCategory.value === 'all') return shopItems.value
  return shopItems.value.filter((item) => item.category === activeCategory.value)
})

const formatNum = (num: number): string => {
  if (num >= 10000) return (num / 10000).toFixed(1).replace('.0', '') + '만'
  if (num >= 1000) return num.toLocaleString()
  return String(num)
}

const handleLogout = async () => {
  isMenuOpen.value = false
  await shopStore.fnLogout()
  navigateTo('/shop/login')
}
</script>


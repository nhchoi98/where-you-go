<script setup lang="ts">
import { useBreakpoints } from '@vueuse/core'
import BottomNav from '../components/BottomNav.vue'
import SideNav from '../components/SideNav.vue'

const breakpoints = useBreakpoints({ sm: 640, md: 768, lg: 1024 })
const isMobile = breakpoints.smaller('lg')
</script>

<template>
  <div class="app-layout">
    <SideNav v-if="!isMobile" />
    <main class="app-main" :class="{ 'has-bottom-nav': isMobile }">
      <RouterView />
    </main>
    <BottomNav v-if="isMobile" />
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background-color: #FFF5E4;
}

.app-main {
  flex: 1;
  padding: 16px;
  max-width: 100%;
}

.app-main.has-bottom-nav {
  padding-bottom: 80px;
}
</style>

<script setup lang="ts">
import { useBreakpoints } from '@vueuse/core'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BottomNav from '../components/BottomNav.vue'
import TopNav from '../components/TopNav.vue'
import AiFloatingButton from '../components/AiFloatingButton.vue'

const breakpoints = useBreakpoints({ sm: 640, md: 768, lg: 1024 })
const isMobile = breakpoints.smaller('lg')

const route = useRoute()
const spaceId = computed(() => route.params.id as string | undefined)
</script>

<template>
  <div class="app-layout">
    <TopNav v-if="!isMobile" />
    <main class="app-main" :class="{ 'has-bottom-nav': isMobile }">
      <div class="app-content">
        <RouterView v-slot="{ Component }">
          <Transition name="page-fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </div>
    </main>
    <BottomNav v-if="isMobile" />
    <AiFloatingButton v-if="spaceId" :space-id="spaceId" :is-mobile="isMobile" />
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--wyg-bg-card);
}

.app-main {
  flex: 1;
  max-width: 100%;
  min-width: 0;
}

.app-content {
  max-width: var(--wyg-content-max-width);
  margin: 0 auto;
  padding: var(--wyg-space-4);
}

.app-main.has-bottom-nav .app-content {
  padding-bottom: calc(var(--wyg-bottomnav-height) + var(--wyg-space-4));
}

@media (min-width: 1024px) {
  .app-content {
    padding: var(--wyg-space-6) var(--wyg-space-8);
  }
}
</style>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { Heart, Map, Sparkles, Ticket } from '@vicons/ionicons5'
import { NIcon } from 'naive-ui'
import { computed } from 'vue'

const route = useRoute()

const spaceId = computed(() => route.params.id as string | undefined)

const tabs = computed(() => [
  { name: 'home', path: '/', icon: Heart, label: '스페이스' },
  {
    name: 'tasks',
    path: spaceId.value ? `/spaces/${spaceId.value}/tasks` : '/',
    icon: Map,
    label: '태스크',
    disabled: !spaceId.value,
  },
  {
    name: 'ai',
    path: spaceId.value ? `/spaces/${spaceId.value}/ai` : '/',
    icon: Sparkles,
    label: 'AI 추천',
    disabled: !spaceId.value,
  },
  { name: 'recommend', path: '/recommend', icon: Ticket, label: '추천' },
])

const currentPath = computed(() => route.path)

function isActive(tab: typeof tabs.value[0]) {
  if (tab.path === '/') return currentPath.value === '/'
  return currentPath.value.startsWith(tab.path)
}
</script>

<template>
  <nav class="bottom-nav">
    <RouterLink
      v-for="tab in tabs"
      :key="tab.name"
      :to="tab.path"
      class="bottom-nav-item"
      :class="{ active: isActive(tab) }"
    >
      <NIcon :size="22" :component="tab.icon" />
      <span class="label">{{ tab.label }}</span>
      <span v-if="isActive(tab)" class="active-dot" />
    </RouterLink>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: var(--wyg-bottomnav-height);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid var(--wyg-border-light);
  z-index: var(--wyg-z-nav);
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-decoration: none;
  color: var(--wyg-text-tertiary);
  font-size: 11px;
  transition: color var(--wyg-transition-fast);
  position: relative;
  padding: var(--wyg-space-1) var(--wyg-space-3);
}

.bottom-nav-item.active {
  color: var(--wyg-primary);
}

.label {
  font-weight: 500;
}

.active-dot {
  position: absolute;
  bottom: -2px;
  width: 4px;
  height: 4px;
  border-radius: var(--wyg-radius-full);
  background: var(--wyg-primary);
}
</style>

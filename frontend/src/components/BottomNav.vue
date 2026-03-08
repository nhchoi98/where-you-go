<script setup lang="ts">
import { useRoute } from 'vue-router'
import { Heart, Map, Sparkles, Person } from '@vicons/ionicons5'
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
  { name: 'profile', path: '/recommend', icon: Person, label: '추천' },
])

const currentPath = computed(() => route.path)
</script>

<template>
  <nav class="bottom-nav">
    <RouterLink
      v-for="tab in tabs"
      :key="tab.name"
      :to="tab.path"
      class="bottom-nav-item"
      :class="{ active: currentPath.startsWith(tab.path) && tab.path !== '/' || currentPath === tab.path && tab.path === '/' }"
    >
      <NIcon :size="22" :component="tab.icon" />
      <span class="label">{{ tab.label }}</span>
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
  height: 64px;
  background: #fff;
  border-top: 1px solid #FFD6D6;
  box-shadow: 0 -2px 8px rgba(232, 64, 87, 0.08);
  z-index: 100;
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-decoration: none;
  color: #999;
  font-size: 11px;
  transition: color 0.2s;
}

.bottom-nav-item.active {
  color: #E84057;
}

.label {
  font-weight: 500;
}
</style>

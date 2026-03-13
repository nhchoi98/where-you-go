<script setup lang="ts">
import { NIcon, NButton } from 'naive-ui'
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
import { Heart, Map, Book, Sparkles, Dice, Ticket, LogOutOutline } from '@vicons/ionicons5'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const spaceId = computed(() => route.params.id as string | undefined)

const navItems = computed(() => {
  const base = [
    { label: '스페이스', path: '/', icon: Heart },
  ]

  if (spaceId.value) {
    base.push(
      { label: '태스크', path: `/spaces/${spaceId.value}/tasks`, icon: Map },
      { label: '저널', path: `/spaces/${spaceId.value}/journals`, icon: Book },
      { label: 'AI 추천', path: `/spaces/${spaceId.value}/ai`, icon: Sparkles },
      { label: '랜덤', path: `/spaces/${spaceId.value}/random`, icon: Dice },
    )
  }

  base.push(
    { label: '행사 추천', path: '/recommend', icon: Ticket },
  )

  return base
})

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <header class="top-nav">
    <div class="top-nav-inner">
      <RouterLink to="/" class="logo">Where You Go</RouterLink>

      <nav class="nav-links">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-link"
          :class="{ active: isActive(item.path) }"
        >
          <NIcon :component="item.icon" :size="16" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="nav-right">
        <div v-if="authStore.user" class="user-chip">
          <div class="user-avatar">{{ authStore.user.name?.charAt(0) || '?' }}</div>
          <span class="user-name">{{ authStore.user.name }}</span>
        </div>
        <NButton text size="small" class="logout-btn" @click="handleLogout">
          <template #icon><NIcon :component="LogOutOutline" /></template>
        </NButton>
      </div>
    </div>
  </header>
</template>

<style scoped>
.top-nav {
  position: sticky;
  top: 0;
  z-index: var(--wyg-z-nav);
  background: var(--wyg-bg-page);
  border-bottom: 1px solid var(--wyg-border-light);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.top-nav-inner {
  max-width: var(--wyg-content-max-width);
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: var(--wyg-space-6);
  padding: 0 var(--wyg-space-6);
  height: 56px;
}

.logo {
  font-size: var(--wyg-font-lg);
  font-weight: 700;
  color: var(--wyg-text-accent);
  letter-spacing: -0.02em;
  text-decoration: none;
  flex-shrink: 0;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: var(--wyg-space-1);
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.nav-links::-webkit-scrollbar {
  display: none;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--wyg-space-2);
  padding: var(--wyg-space-2) var(--wyg-space-3);
  border-radius: var(--wyg-radius-sm);
  font-size: var(--wyg-font-sm);
  font-weight: 500;
  color: var(--wyg-text-secondary);
  text-decoration: none;
  white-space: nowrap;
  transition: color var(--wyg-transition-fast), background var(--wyg-transition-fast);
}

.nav-link:hover {
  color: var(--wyg-text-accent);
  background: var(--wyg-primary-light);
}

.nav-link.active {
  color: var(--wyg-text-accent);
  background: var(--wyg-primary-light);
}

.nav-right {
  display: flex;
  align-items: center;
  gap: var(--wyg-space-3);
  flex-shrink: 0;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: var(--wyg-space-2);
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: var(--wyg-radius-full);
  background: var(--wyg-primary-light);
  color: var(--wyg-text-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: var(--wyg-font-xs);
}

.user-name {
  font-size: var(--wyg-font-sm);
  font-weight: 500;
  color: var(--wyg-text-primary);
}

.logout-btn {
  color: var(--wyg-text-tertiary);
}
</style>

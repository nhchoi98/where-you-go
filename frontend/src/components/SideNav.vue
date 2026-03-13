<script setup lang="ts">
import { NMenu, NIcon, NButton } from 'naive-ui'
import { useRouter, useRoute } from 'vue-router'
import { computed, h } from 'vue'
import { Heart, Map, Book, Sparkles, Dice, Ticket, LogOutOutline } from '@vicons/ionicons5'
import { useAuthStore } from '../stores/auth'
import type { Component } from 'vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const spaceId = computed(() => route.params.id as string | undefined)

function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const menuOptions = computed(() => {
  const base = [
    { label: '스페이스', key: '/', icon: renderIcon(Heart) },
  ]

  if (spaceId.value) {
    base.push(
      { label: '태스크', key: `/spaces/${spaceId.value}/tasks`, icon: renderIcon(Map) },
      { label: '저널', key: `/spaces/${spaceId.value}/journals`, icon: renderIcon(Book) },
      { label: 'AI 추천', key: `/spaces/${spaceId.value}/ai`, icon: renderIcon(Sparkles) },
      { label: '랜덤 뽑기', key: `/spaces/${spaceId.value}/random`, icon: renderIcon(Dice) },
    )
  }

  base.push(
    { label: '행사 추천', key: '/recommend', icon: renderIcon(Ticket) },
  )

  return base
})

const activeKey = computed(() => route.path)

function handleSelect(key: string) {
  router.push(key)
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <aside class="side-nav">
    <div class="nav-top">
      <div class="logo">Where You Go</div>
      <NMenu
        :value="activeKey"
        :options="menuOptions"
        @update:value="handleSelect"
      />
    </div>

    <div class="nav-bottom">
      <div v-if="authStore.user" class="user-section">
        <div class="user-avatar">{{ authStore.user.name?.charAt(0) || '?' }}</div>
        <div class="user-info">
          <span class="user-name">{{ authStore.user.name }}</span>
          <span class="user-email">{{ authStore.user.email }}</span>
        </div>
      </div>
      <NButton text size="small" class="logout-btn" @click="handleLogout">
        <template #icon><NIcon :component="LogOutOutline" /></template>
        로그아웃
      </NButton>
    </div>
  </aside>
</template>

<style scoped>
.side-nav {
  width: var(--wyg-sidebar-width);
  min-height: 100vh;
  background: var(--wyg-bg-card);
  box-shadow: 1px 0 8px rgba(0, 0, 0, 0.04);
  padding: var(--wyg-space-5) 0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.nav-top {
  flex: 1;
}

.logo {
  padding: 0 var(--wyg-space-5) var(--wyg-space-5);
  font-size: var(--wyg-font-xl);
  font-weight: 700;
  color: var(--wyg-text-accent);
  letter-spacing: -0.02em;
}

.nav-bottom {
  padding: var(--wyg-space-4) var(--wyg-space-5);
  border-top: 1px solid var(--wyg-border-light);
}

.user-section {
  display: flex;
  align-items: center;
  gap: var(--wyg-space-3);
  margin-bottom: var(--wyg-space-3);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--wyg-radius-full);
  background: var(--wyg-primary-light);
  color: var(--wyg-text-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: var(--wyg-font-base);
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-name {
  font-size: var(--wyg-font-sm);
  font-weight: 500;
  color: var(--wyg-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: var(--wyg-font-xs);
  color: var(--wyg-text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-btn {
  color: var(--wyg-text-secondary);
}
</style>

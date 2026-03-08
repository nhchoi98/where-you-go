<script setup lang="ts">
import { NMenu } from 'naive-ui'
import { useRouter, useRoute } from 'vue-router'
import { computed, h } from 'vue'
import { NIcon } from 'naive-ui'
import { Heart, Map, Sparkles, Person, Dice, Book } from '@vicons/ionicons5'
import type { Component } from 'vue'

const router = useRouter()
const route = useRoute()

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
    { label: '행사 추천', key: '/recommend', icon: renderIcon(Person) },
  )

  return base
})

const activeKey = computed(() => route.path)

function handleSelect(key: string) {
  router.push(key)
}
</script>

<template>
  <aside class="side-nav">
    <div class="logo">Where You Go</div>
    <NMenu
      :value="activeKey"
      :options="menuOptions"
      @update:value="handleSelect"
    />
  </aside>
</template>

<style scoped>
.side-nav {
  width: 220px;
  min-height: 100vh;
  background: #fff;
  border-right: 1px solid #FFD6D6;
  padding: 20px 0;
}

.logo {
  padding: 0 20px 20px;
  font-size: 18px;
  font-weight: 700;
  color: #E84057;
}
</style>

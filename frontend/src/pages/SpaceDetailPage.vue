<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { NButton, NTag, NAvatar, NSpin, NIcon } from 'naive-ui'
import { Map, Book, Sparkles, Dice } from '@vicons/ionicons5'
import { useSpaceStore } from '../stores/space'
import { useAuthStore } from '../stores/auth'
import InviteMemberModal from '../components/space/InviteMemberModal.vue'

const route = useRoute()
const spaceStore = useSpaceStore()
const authStore = useAuthStore()
const showInvite = ref(false)

const spaceId = computed(() => route.params.id as string)

const isOwner = computed(() => {
  if (!spaceStore.currentSpace || !authStore.user) return false
  return spaceStore.currentSpace.members.some(
    (m) => m.userId === authStore.user!.id && m.role === 'owner',
  )
})

onMounted(() => {
  spaceStore.fetchSpace(spaceId.value)
})
</script>

<template>
  <div class="space-detail-page">
    <NSpin :show="spaceStore.loading">
      <template v-if="spaceStore.currentSpace">
        <div class="space-header">
          <h2 class="wyg-page-title">{{ spaceStore.currentSpace.space.name }}</h2>
          <p v-if="spaceStore.currentSpace.space.description" class="wyg-page-desc">
            {{ spaceStore.currentSpace.space.description }}
          </p>
          <div class="space-stats">
            <span class="stat">{{ spaceStore.currentSpace.members.length }}명 멤버</span>
          </div>
        </div>

        <div class="quick-links">
          <RouterLink :to="`/spaces/${spaceId}/tasks`" class="quick-link hover-lift">
            <div class="quick-link-icon">
              <NIcon :size="20" :component="Map" />
            </div>
            <span>태스크</span>
          </RouterLink>
          <RouterLink :to="`/spaces/${spaceId}/journals`" class="quick-link hover-lift">
            <div class="quick-link-icon">
              <NIcon :size="20" :component="Book" />
            </div>
            <span>저널</span>
          </RouterLink>
          <RouterLink :to="`/spaces/${spaceId}/ai`" class="quick-link hover-lift">
            <div class="quick-link-icon">
              <NIcon :size="20" :component="Sparkles" />
            </div>
            <span>AI 추천</span>
          </RouterLink>
          <RouterLink :to="`/spaces/${spaceId}/random`" class="quick-link hover-lift">
            <div class="quick-link-icon">
              <NIcon :size="20" :component="Dice" />
            </div>
            <span>랜덤 뽑기</span>
          </RouterLink>
        </div>

        <div class="section">
          <div class="section-header">
            <h3 class="section-title">멤버</h3>
            <NButton v-if="isOwner" size="small" @click="showInvite = true">
              + 초대
            </NButton>
          </div>

          <div class="member-list">
            <div v-for="member in spaceStore.currentSpace.members" :key="member.id" class="member-row">
              <NAvatar :size="36" round :style="{ background: 'var(--wyg-primary-light)', color: 'var(--wyg-primary)' }">
                {{ member.userName?.charAt(0) || '?' }}
              </NAvatar>
              <div class="member-info">
                <span class="member-name">{{ member.userName }}</span>
                <span class="member-email">{{ member.userEmail }}</span>
              </div>
              <NTag :type="member.role === 'owner' ? 'error' : 'default'" size="small" round>
                {{ member.role === 'owner' ? '관리자' : '멤버' }}
              </NTag>
            </div>
          </div>
        </div>

        <InviteMemberModal
          v-model:show="showInvite"
          :space-id="spaceId"
          @invited="spaceStore.fetchSpace(spaceId)"
        />
      </template>
    </NSpin>
  </div>
</template>

<style scoped>
.space-header {
  margin-bottom: var(--wyg-space-6);
}

.space-stats {
  display: flex;
  gap: var(--wyg-space-4);
  margin-top: var(--wyg-space-2);
}

.stat {
  font-size: var(--wyg-font-sm);
  color: var(--wyg-text-secondary);
  background: var(--wyg-primary-light);
  padding: var(--wyg-space-1) var(--wyg-space-3);
  border-radius: var(--wyg-radius-full);
}

.section {
  margin-bottom: var(--wyg-space-6);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--wyg-space-3);
}

.section-title {
  font-size: var(--wyg-font-lg);
  font-weight: 600;
  color: var(--wyg-text-primary);
  margin: 0;
}

.member-list {
  display: flex;
  flex-direction: column;
  gap: var(--wyg-space-2);
}

.member-row {
  display: flex;
  align-items: center;
  gap: var(--wyg-space-3);
  padding: var(--wyg-space-3) var(--wyg-space-4);
  background: var(--wyg-bg-card);
  border: 1px solid var(--wyg-border-light);
  border-radius: var(--wyg-radius-md);
  transition: background var(--wyg-transition-fast);
}

.member-row:hover {
  background: var(--wyg-primary-light);
}

.member-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.member-name {
  font-size: var(--wyg-font-md);
  font-weight: 500;
  color: var(--wyg-text-primary);
}

.member-email {
  font-size: var(--wyg-font-xs);
  color: var(--wyg-text-tertiary);
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--wyg-space-3);
  margin-bottom: var(--wyg-space-6);
}

.quick-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--wyg-space-2);
  padding: var(--wyg-space-5) var(--wyg-space-4);
  background: var(--wyg-bg-card);
  border: 1px solid var(--wyg-border);
  border-radius: var(--wyg-radius-lg);
  text-decoration: none;
  color: var(--wyg-text-primary);
  font-size: var(--wyg-font-md);
  font-weight: 500;
  transition: all var(--wyg-transition-base);
}

.quick-link-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--wyg-radius-md);
  background: var(--wyg-primary-light);
  color: var(--wyg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-link:hover {
  border-color: var(--wyg-primary);
  color: var(--wyg-primary);
}

.quick-link:hover .quick-link-icon {
  background: var(--wyg-primary);
  color: var(--wyg-text-inverse);
}
</style>

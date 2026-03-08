<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { NCard, NButton, NTag, NAvatar, NSpin, NIcon } from 'naive-ui'
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
          <h2 class="space-name">{{ spaceStore.currentSpace.space.name }}</h2>
          <p v-if="spaceStore.currentSpace.space.description" class="space-desc">
            {{ spaceStore.currentSpace.space.description }}
          </p>
        </div>

        <div class="quick-links">
          <RouterLink :to="`/spaces/${spaceId}/tasks`" class="quick-link">
            <NIcon :size="20" :component="Map" />
            <span>태스크</span>
          </RouterLink>
          <RouterLink :to="`/spaces/${spaceId}/journals`" class="quick-link">
            <NIcon :size="20" :component="Book" />
            <span>저널</span>
          </RouterLink>
          <RouterLink :to="`/spaces/${spaceId}/ai`" class="quick-link">
            <NIcon :size="20" :component="Sparkles" />
            <span>AI 추천</span>
          </RouterLink>
          <RouterLink :to="`/spaces/${spaceId}/random`" class="quick-link">
            <NIcon :size="20" :component="Dice" />
            <span>랜덤 뽑기</span>
          </RouterLink>
        </div>

        <div class="section">
          <div class="section-header">
            <h3 class="section-title">멤버</h3>
            <NButton v-if="isOwner" size="small" class="invite-btn" @click="showInvite = true">
              + 초대
            </NButton>
          </div>

          <div class="member-list">
            <NCard v-for="member in spaceStore.currentSpace.members" :key="member.id" class="member-card">
              <div class="member-row">
                <NAvatar :size="36" round>
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
            </NCard>
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
  margin-bottom: 24px;
}

.space-name {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0 0 4px;
}

.space-desc {
  font-size: 14px;
  color: #888;
  margin: 0;
}

.section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.invite-btn {
  color: #E84057;
  border-color: #E84057;
  border-radius: 8px;
}

.member-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.member-card {
  border-radius: 12px;
  border: 1px solid #FFD6D6;
}

.member-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.member-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.member-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.member-email {
  font-size: 12px;
  color: #999;
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.quick-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid #FFD6D6;
  border-radius: 12px;
  text-decoration: none;
  color: #333;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s;
}

.quick-link:hover {
  background: #FFF5E4;
  border-color: #E84057;
  color: #E84057;
}
</style>

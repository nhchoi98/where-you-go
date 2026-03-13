<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NEmpty, NButton, NCard, NSpin, NIcon, useMessage } from 'naive-ui'
import { Heart, Add } from '@vicons/ionicons5'
import { useSpaceStore } from '../stores/space'
import CreateSpaceModal from '../components/space/CreateSpaceModal.vue'

const router = useRouter()
const message = useMessage()
const spaceStore = useSpaceStore()
const showCreate = ref(false)

onMounted(() => {
  spaceStore.fetchSpaces()
})

function handleCreated(spaceId: string) {
  showCreate.value = false
  message.success('스페이스가 생성되었습니다')
  router.push(`/spaces/${spaceId}`)
}
</script>

<template>
  <div class="space-list-page">
    <div class="page-header">
      <h2 class="wyg-page-title">내 스페이스</h2>
      <NButton type="primary" @click="showCreate = true">
        + 새 스페이스
      </NButton>
    </div>

    <NSpin :show="spaceStore.loading">
      <div v-if="spaceStore.spaces.length" class="space-grid">
        <NCard
          v-for="space in spaceStore.spaces"
          :key="space.id"
          class="space-card wyg-card wyg-card-hoverable"
          hoverable
          @click="router.push(`/spaces/${space.id}`)"
        >
          <div class="space-card-content">
            <div class="space-icon">
              <NIcon :component="Heart" :size="18" />
            </div>
            <div class="space-info">
              <h3 class="space-name">{{ space.name }}</h3>
              <p v-if="space.description" class="space-desc">{{ space.description }}</p>
            </div>
          </div>
        </NCard>
      </div>

      <NEmpty v-else description="아직 스페이스가 없습니다" class="empty-state">
        <template #icon>
          <div class="empty-icon">
            <NIcon :component="Heart" :size="48" />
          </div>
        </template>
        <template #extra>
          <p class="empty-hint">함께 가고 싶은 장소를 모아보세요</p>
          <NButton type="primary" @click="showCreate = true">
            <template #icon><NIcon :component="Add" /></template>
            첫 스페이스 만들기
          </NButton>
        </template>
      </NEmpty>
    </NSpin>

    <CreateSpaceModal v-model:show="showCreate" @created="handleCreated" />
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--wyg-space-5);
}

.space-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--wyg-space-3);
}

@media (min-width: 768px) {
  .space-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.space-card-content {
  display: flex;
  align-items: flex-start;
  gap: var(--wyg-space-3);
}

.space-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--wyg-radius-md);
  background: var(--wyg-primary-light);
  color: var(--wyg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.space-info {
  min-width: 0;
  flex: 1;
}

.space-name {
  font-size: var(--wyg-font-lg);
  font-weight: 600;
  color: var(--wyg-text-primary);
  margin: 0 0 var(--wyg-space-1);
}

.space-desc {
  font-size: var(--wyg-font-sm);
  color: var(--wyg-text-secondary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-state {
  margin-top: var(--wyg-space-16);
}

.empty-icon {
  color: var(--wyg-primary);
  opacity: 0.4;
  margin-bottom: var(--wyg-space-2);
}

.empty-hint {
  font-size: var(--wyg-font-base);
  color: var(--wyg-text-secondary);
  margin: 0 0 var(--wyg-space-4);
}
</style>

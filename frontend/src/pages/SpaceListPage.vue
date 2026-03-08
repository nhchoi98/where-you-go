<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NEmpty, NButton, NCard, NSpin, useMessage } from 'naive-ui'
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
      <h2 class="page-title">내 스페이스</h2>
      <NButton type="primary" class="create-btn" @click="showCreate = true">
        + 새 스페이스
      </NButton>
    </div>

    <NSpin :show="spaceStore.loading">
      <div v-if="spaceStore.spaces.length" class="space-grid">
        <NCard
          v-for="space in spaceStore.spaces"
          :key="space.id"
          class="space-card"
          hoverable
          @click="router.push(`/spaces/${space.id}`)"
        >
          <div class="space-card-content">
            <h3 class="space-name">{{ space.name }}</h3>
            <p v-if="space.description" class="space-desc">{{ space.description }}</p>
          </div>
        </NCard>
      </div>

      <NEmpty v-else description="아직 스페이스가 없습니다" style="margin-top: 60px;">
        <template #extra>
          <NButton type="primary" class="create-btn" @click="showCreate = true">
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
  margin-bottom: 20px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.create-btn {
  background-color: #E84057;
  border-color: #E84057;
  border-radius: 12px;
}

.space-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

@media (min-width: 768px) {
  .space-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.space-card {
  border-radius: 16px;
  border: 1px solid #FFD6D6;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.space-card:hover {
  box-shadow: 0 4px 16px rgba(232, 64, 87, 0.12);
}

.space-name {
  font-size: 17px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px;
}

.space-desc {
  font-size: 13px;
  color: #888;
  margin: 0;
}
</style>

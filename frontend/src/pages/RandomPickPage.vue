<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { NTabs, NTabPane, NEmpty } from 'naive-ui'
import { useTaskStore } from '../stores/task'
import { useSpaceStore } from '../stores/space'
import SpinWheel from '../components/random/SpinWheel.vue'
import LadderGame from '../components/random/LadderGame.vue'
import RockPaperScissors from '../components/random/RockPaperScissors.vue'

const route = useRoute()
const taskStore = useTaskStore()
const spaceStore = useSpaceStore()

const spaceId = computed(() => route.params.id as string)

const taskNames = computed(() => taskStore.tasks.map((t) => t.title))
const memberNames = computed(() =>
  spaceStore.currentSpace?.members.map((m) => m.userName || '익명') || [],
)

onMounted(() => {
  taskStore.fetchTasks(spaceId.value)
  spaceStore.fetchSpace(spaceId.value)
})
</script>

<template>
  <div class="random-pick-page">
    <h2 class="wyg-page-title">랜덤 뽑기</h2>
    <p class="wyg-page-desc">태스크 중에서 랜덤으로 뽑아보세요</p>

    <template v-if="taskNames.length >= 2">
      <NTabs type="segment" animated>
        <NTabPane name="wheel" tab="돌림판">
          <SpinWheel :items="taskNames" />
        </NTabPane>

        <NTabPane name="ladder" tab="사다리">
          <LadderGame :items="taskNames" :players="memberNames" />
        </NTabPane>

        <NTabPane name="rps" tab="가위바위보">
          <RockPaperScissors :items="taskNames" />
        </NTabPane>
      </NTabs>
    </template>

    <NEmpty v-else description="태스크를 2개 이상 추가해주세요" class="empty-state" />
  </div>
</template>

<style scoped>
.empty-state {
  margin-top: var(--wyg-space-16);
}
</style>

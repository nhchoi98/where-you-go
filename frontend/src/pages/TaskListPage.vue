<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { NButton, NSpin, NEmpty, NSelect, NIcon } from 'naive-ui'
import { Add } from '@vicons/ionicons5'
import { useTaskStore } from '../stores/task'
import TaskCard from '../components/task/TaskCard.vue'
import TaskFormModal from '../components/task/TaskFormModal.vue'
import type { Task } from '../types/task'

const route = useRoute()
const taskStore = useTaskStore()

const spaceId = computed(() => route.params.id as string)
const showForm = ref(false)
const editingTask = ref<Task | null>(null)
const filterPriority = ref(0)

const priorityOptions = [
  { label: '전체', value: 0 },
  { label: '최고', value: 5 },
  { label: '높음', value: 4 },
  { label: '중간', value: 3 },
  { label: '보통', value: 2 },
  { label: '낮음', value: 1 },
]

onMounted(() => {
  taskStore.fetchTasks(spaceId.value)
})

function handleAdd() {
  editingTask.value = null
  showForm.value = true
}

function handleEdit(task: Task) {
  editingTask.value = task
  showForm.value = true
}

async function handleDelete(taskId: string) {
  await taskStore.removeTask(spaceId.value, taskId)
}

function handleSaved() {
  taskStore.fetchTasks(spaceId.value, filterPriority.value || undefined)
}

function handleFilterChange(val: number) {
  filterPriority.value = val
  taskStore.fetchTasks(spaceId.value, val || undefined)
}
</script>

<template>
  <div class="task-list-page">
    <div class="page-header">
      <h2 class="wyg-page-title">태스크</h2>
      <div class="header-actions">
        <NSelect
          :value="filterPriority"
          :options="priorityOptions"
          size="small"
          style="width: 100px;"
          @update:value="handleFilterChange"
        />
        <NButton type="primary" @click="handleAdd">
          <template #icon><NIcon :component="Add" /></template>
          추가
        </NButton>
      </div>
    </div>

    <NSpin :show="taskStore.loading">
      <div v-if="taskStore.tasks.length" class="task-grid">
        <TaskCard
          v-for="task in taskStore.tasks"
          :key="task.id"
          :task="task"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>

      <NEmpty v-else description="아직 태스크가 없습니다" class="empty-state">
        <template #extra>
          <NButton type="primary" @click="handleAdd">
            첫 태스크 추가하기
          </NButton>
        </template>
      </NEmpty>
    </NSpin>

    <TaskFormModal
      v-model:show="showForm"
      :space-id="spaceId"
      :edit-task="editingTask"
      @saved="handleSaved"
    />
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--wyg-space-5);
}

.header-actions {
  display: flex;
  gap: var(--wyg-space-2);
  align-items: center;
}

.task-grid {
  display: flex;
  flex-direction: column;
  gap: var(--wyg-space-3);
}

.empty-state {
  margin-top: var(--wyg-space-16);
}
</style>

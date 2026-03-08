<script setup lang="ts">
import { NCard, NTag, NIcon, NButton, NPopconfirm } from 'naive-ui'
import { Heart, Location, Link, DocumentText, TrashOutline } from '@vicons/ionicons5'
import type { Task } from '../../types/task'

const props = defineProps<{ task: Task }>()
const emit = defineEmits<{
  edit: [task: Task]
  delete: [taskId: string]
}>()

const priorityLabels = ['', '낮음', '보통', '중간', '높음', '최고']
const priorityColors: Record<number, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
  1: 'default',
  2: 'info',
  3: 'success',
  4: 'warning',
  5: 'error',
}

function metaIcon(type: string) {
  if (type === 'map_link') return Link
  if (type === 'image') return Heart
  return DocumentText
}
</script>

<template>
  <NCard class="task-card" @click="emit('edit', task)">
    <div class="task-header">
      <div class="task-title-row">
        <span class="task-title">{{ task.title }}</span>
      </div>
      <NTag :type="priorityColors[task.priority]" size="small" round>
        {{ priorityLabels[task.priority] }}
      </NTag>
    </div>

    <div v-if="task.placeName" class="task-place">
      <NIcon :component="Location" :size="14" color="#E84057" />
      <span>{{ task.placeName }}</span>
    </div>

    <div v-if="task.metadata?.entries?.length" class="task-meta">
      <div v-for="(entry, idx) in task.metadata.entries" :key="idx" class="meta-entry">
        <NIcon :component="metaIcon(entry.type)" :size="14" />
        <span class="meta-content">{{ entry.content }}</span>
      </div>
    </div>

    <div class="task-footer">
      <NPopconfirm @positive-click="emit('delete', task.id)">
        <template #trigger>
          <NButton text size="small" type="error" @click.stop>
            <template #icon><NIcon :component="TrashOutline" /></template>
          </NButton>
        </template>
        삭제하시겠습니까?
      </NPopconfirm>
    </div>
  </NCard>
</template>

<style scoped>
.task-card {
  border-radius: 16px;
  border: 1px solid #FFD6D6;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.task-card:hover {
  box-shadow: 0 4px 16px rgba(232, 64, 87, 0.12);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.task-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.task-place {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #888;
  margin-bottom: 8px;
}

.task-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.meta-entry {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
}

.meta-content {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-footer {
  display: flex;
  justify-content: flex-end;
}
</style>

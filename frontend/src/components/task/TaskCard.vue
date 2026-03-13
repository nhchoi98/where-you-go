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

const priorityStripeColors: Record<number, string> = {
  1: 'var(--wyg-text-tertiary)',
  2: 'var(--wyg-info)',
  3: 'var(--wyg-success)',
  4: 'var(--wyg-warning)',
  5: 'var(--wyg-primary)',
}

function metaIcon(type: string) {
  if (type === 'map_link') return Link
  if (type === 'image') return Heart
  return DocumentText
}
</script>

<template>
  <NCard class="task-card wyg-card wyg-card-hoverable" @click="emit('edit', task)">
    <div class="priority-stripe" :style="{ backgroundColor: priorityStripeColors[task.priority] }" />
    <div class="task-content">
      <div class="task-header">
        <span class="task-title">{{ task.title }}</span>
        <NTag :type="priorityColors[task.priority]" size="small" round>
          {{ priorityLabels[task.priority] }}
        </NTag>
      </div>

      <div v-if="task.placeName" class="task-place">
        <NIcon :component="Location" :size="14" color="var(--wyg-primary)" />
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
    </div>
  </NCard>
</template>

<style scoped>
.task-card {
  position: relative;
  overflow: hidden;
}

.priority-stripe {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: var(--wyg-radius-lg) 0 0 var(--wyg-radius-lg);
}

.task-content {
  padding-left: var(--wyg-space-2);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--wyg-space-2);
}

.task-title {
  font-size: var(--wyg-font-md);
  font-weight: 600;
  color: var(--wyg-text-primary);
}

.task-place {
  display: flex;
  align-items: center;
  gap: var(--wyg-space-1);
  font-size: var(--wyg-font-sm);
  color: var(--wyg-text-secondary);
  margin-bottom: var(--wyg-space-2);
}

.task-meta {
  display: flex;
  flex-direction: column;
  gap: var(--wyg-space-1);
  margin-bottom: var(--wyg-space-2);
}

.meta-entry {
  display: flex;
  align-items: center;
  gap: var(--wyg-space-2);
  font-size: var(--wyg-font-sm);
  color: var(--wyg-text-secondary);
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

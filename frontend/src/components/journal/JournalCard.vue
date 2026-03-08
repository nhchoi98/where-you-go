<script setup lang="ts">
import { computed } from 'vue'
import { NCard, NTag, NIcon, NButton, NPopconfirm } from 'naive-ui'
import { Calendar, TrashOutline } from '@vicons/ionicons5'
import type { Journal } from '../../types/journal'

const props = defineProps<{ journal: Journal }>()
const emit = defineEmits<{
  click: [journal: Journal]
  delete: [journalId: string]
}>()

const dateRange = computed(() => {
  if (props.journal.dateFrom === props.journal.dateTo) {
    return props.journal.dateFrom
  }
  return `${props.journal.dateFrom} ~ ${props.journal.dateTo}`
})
</script>

<template>
  <NCard class="journal-card" @click="emit('click', journal)">
    <div class="journal-header">
      <h3 class="journal-title">{{ journal.title }}</h3>
      <NPopconfirm @positive-click="emit('delete', journal.id)">
        <template #trigger>
          <NButton text size="small" type="error" @click.stop>
            <template #icon><NIcon :component="TrashOutline" /></template>
          </NButton>
        </template>
        삭제하시겠습니까?
      </NPopconfirm>
    </div>
    <div class="journal-date">
      <NIcon :component="Calendar" :size="14" />
      <span>{{ dateRange }}</span>
    </div>
    <p v-if="journal.metadata?.description" class="journal-desc">
      {{ journal.metadata.description }}
    </p>
    <div class="journal-footer">
      <NTag size="small" round>{{ journal.taskIds.length }}개 태스크</NTag>
    </div>
  </NCard>
</template>

<style scoped>
.journal-card {
  border-radius: 16px;
  border: 1px solid #FFD6D6;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.journal-card:hover {
  box-shadow: 0 4px 16px rgba(232, 64, 87, 0.12);
}

.journal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.journal-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.journal-date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #E84057;
  margin: 6px 0;
}

.journal-desc {
  font-size: 13px;
  color: #666;
  margin: 4px 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.journal-footer {
  display: flex;
  gap: 6px;
}
</style>

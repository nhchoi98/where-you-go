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
  <NCard class="journal-card wyg-card wyg-card-hoverable" @click="emit('click', journal)">
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
.journal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.journal-title {
  font-size: var(--wyg-font-lg);
  font-weight: 600;
  color: var(--wyg-text-primary);
  margin: 0;
}

.journal-date {
  display: flex;
  align-items: center;
  gap: var(--wyg-space-1);
  font-size: var(--wyg-font-sm);
  color: var(--wyg-text-accent);
  margin: var(--wyg-space-2) 0;
}

.journal-desc {
  font-size: var(--wyg-font-sm);
  color: var(--wyg-text-secondary);
  margin: var(--wyg-space-1) 0 var(--wyg-space-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.journal-footer {
  display: flex;
  gap: var(--wyg-space-2);
}
</style>

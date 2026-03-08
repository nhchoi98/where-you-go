<script setup lang="ts">
import { ref, watch } from 'vue'
import { NModal, NCard, NForm, NFormItem, NInput, NButton, NRate, NSelect, NIcon, useMessage } from 'naive-ui'
import { Add } from '@vicons/ionicons5'
import { useTaskStore } from '../../stores/task'
import type { Task, MetadataEntry } from '../../types/task'

const props = defineProps<{
  show: boolean
  spaceId: string
  editTask?: Task | null
}>()
const emit = defineEmits<{
  'update:show': [value: boolean]
  saved: []
}>()

const message = useMessage()
const taskStore = useTaskStore()

const title = ref('')
const placeName = ref('')
const priority = ref(3)
const entries = ref<MetadataEntry[]>([])
const loading = ref(false)

const metaTypeOptions = [
  { label: '메모', value: 'memo' },
  { label: '지도 링크', value: 'map_link' },
]

watch(
  () => props.show,
  (val) => {
    if (val && props.editTask) {
      title.value = props.editTask.title
      placeName.value = props.editTask.placeName || ''
      priority.value = props.editTask.priority
      entries.value = [...(props.editTask.metadata?.entries || [])]
    } else if (val) {
      title.value = ''
      placeName.value = ''
      priority.value = 3
      entries.value = []
    }
  },
)

function addEntry() {
  entries.value.push({ type: 'memo', content: '' })
}

function removeEntry(idx: number) {
  entries.value.splice(idx, 1)
}

async function handleSubmit() {
  if (!title.value.trim()) {
    message.warning('제목을 입력해주세요')
    return
  }

  loading.value = true
  try {
    const validEntries = entries.value.filter((e) => e.content.trim())
    const payload = {
      title: title.value.trim(),
      placeName: placeName.value.trim() || null,
      priority: priority.value,
      metadata: { entries: validEntries },
    }

    if (props.editTask) {
      await taskStore.updateTask(props.spaceId, props.editTask.id, payload)
      message.success('태스크가 수정되었습니다')
    } else {
      await taskStore.createTask(props.spaceId, payload)
      message.success('태스크가 추가되었습니다')
    }
    emit('saved')
    emit('update:show', false)
  } catch {
    message.error('저장에 실패했습니다')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <NModal :show="show" @update:show="emit('update:show', $event)">
    <NCard
      :title="editTask ? '태스크 수정' : '새 태스크 추가'"
      :bordered="false"
      class="modal-card"
      closable
      @close="emit('update:show', false)"
    >
      <NForm @submit.prevent="handleSubmit">
        <NFormItem label="제목">
          <NInput v-model:value="title" placeholder="태스크 제목" />
        </NFormItem>

        <NFormItem label="장소 이름">
          <NInput v-model:value="placeName" placeholder="장소 이름 (선택)" />
        </NFormItem>

        <NFormItem label="우선순위">
          <NRate v-model:value="priority" :count="5" />
        </NFormItem>

        <div class="meta-section">
          <div class="meta-header">
            <span class="meta-label">메타데이터</span>
            <NButton text size="small" @click="addEntry">
              <template #icon><NIcon :component="Add" /></template>
              추가
            </NButton>
          </div>

          <div v-for="(entry, idx) in entries" :key="idx" class="meta-row">
            <NSelect
              v-model:value="entry.type"
              :options="metaTypeOptions"
              size="small"
              style="width: 110px; flex-shrink: 0;"
            />
            <NInput v-model:value="entry.content" size="small" placeholder="내용" />
            <NButton text size="small" type="error" @click="removeEntry(idx)">삭제</NButton>
          </div>
        </div>

        <NButton
          type="primary"
          block
          :loading="loading"
          attr-type="submit"
          class="submit-btn"
        >
          {{ editTask ? '수정' : '추가' }}
        </NButton>
      </NForm>
    </NCard>
  </NModal>
</template>

<style scoped>
.modal-card {
  width: 90vw;
  max-width: 480px;
  border-radius: 16px;
}

.meta-section {
  margin-bottom: 16px;
}

.meta-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.meta-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.meta-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.submit-btn {
  background-color: #E84057;
  border-color: #E84057;
  border-radius: 12px;
  height: 44px;
  margin-top: 8px;
}
</style>

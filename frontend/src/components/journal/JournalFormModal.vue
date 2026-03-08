<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { NModal, NCard, NForm, NFormItem, NInput, NButton, NDatePicker, NTransfer, useMessage } from 'naive-ui'
import { useJournalStore } from '../../stores/journal'
import { useTaskStore } from '../../stores/task'
import type { Journal } from '../../types/journal'

const props = defineProps<{
  show: boolean
  spaceId: string
  editJournal?: Journal | null
}>()
const emit = defineEmits<{
  'update:show': [value: boolean]
  saved: []
}>()

const message = useMessage()
const journalStore = useJournalStore()
const taskStore = useTaskStore()

const title = ref('')
const dateRange = ref<[number, number] | null>(null)
const selectedTaskIds = ref<string[]>([])
const description = ref('')
const review = ref('')
const loading = ref(false)

const taskOptions = computed(() =>
  taskStore.tasks.map((t) => ({
    value: t.id,
    label: t.title,
  })),
)

watch(
  () => props.show,
  (val) => {
    if (val && props.editJournal) {
      title.value = props.editJournal.title
      dateRange.value = [
        new Date(props.editJournal.dateFrom).getTime(),
        new Date(props.editJournal.dateTo).getTime(),
      ]
      selectedTaskIds.value = [...props.editJournal.taskIds]
      description.value = props.editJournal.metadata?.description || ''
      review.value = props.editJournal.metadata?.review || ''
    } else if (val) {
      title.value = ''
      dateRange.value = null
      selectedTaskIds.value = []
      description.value = ''
      review.value = ''
      taskStore.fetchTasks(props.spaceId)
    }
  },
)

function formatDate(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function handleSubmit() {
  if (!title.value.trim()) {
    message.warning('제목을 입력해주세요')
    return
  }
  if (!dateRange.value) {
    message.warning('기간을 선택해주세요')
    return
  }

  loading.value = true
  try {
    const payload = {
      title: title.value.trim(),
      dateFrom: formatDate(dateRange.value[0]),
      dateTo: formatDate(dateRange.value[1]),
      taskIds: selectedTaskIds.value,
      metadata: {
        description: description.value.trim() || undefined,
        review: review.value.trim() || undefined,
        entries: [],
      },
    }

    if (props.editJournal) {
      await journalStore.updateJournal(props.spaceId, props.editJournal.id, payload)
      message.success('저널이 수정되었습니다')
    } else {
      await journalStore.createJournal(props.spaceId, payload)
      message.success('저널이 생성되었습니다')
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
      :title="editJournal ? '저널 수정' : '새 저널 만들기'"
      :bordered="false"
      class="modal-card"
      closable
      @close="emit('update:show', false)"
    >
      <NForm @submit.prevent="handleSubmit">
        <NFormItem label="제목">
          <NInput v-model:value="title" placeholder="예: 홍대 나들이, 제주 2박3일" />
        </NFormItem>

        <NFormItem label="기간">
          <NDatePicker
            v-model:value="dateRange"
            type="daterange"
            clearable
            style="width: 100%;"
          />
        </NFormItem>

        <NFormItem label="연결할 태스크">
          <NTransfer
            v-model:value="selectedTaskIds"
            :options="taskOptions"
            style="width: 100%; height: 200px;"
          />
        </NFormItem>

        <NFormItem label="설명">
          <NInput
            v-model:value="description"
            type="textarea"
            placeholder="이 저널에 대한 설명"
            :rows="2"
          />
        </NFormItem>

        <NFormItem label="감상문">
          <NInput
            v-model:value="review"
            type="textarea"
            placeholder="느낀 점, 후기..."
            :rows="3"
          />
        </NFormItem>

        <NButton
          type="primary"
          block
          :loading="loading"
          attr-type="submit"
          class="submit-btn"
        >
          {{ editJournal ? '수정' : '만들기' }}
        </NButton>
      </NForm>
    </NCard>
  </NModal>
</template>

<style scoped>
.modal-card {
  width: 90vw;
  max-width: 520px;
  border-radius: 16px;
  max-height: 90vh;
  overflow-y: auto;
}

.submit-btn {
  background-color: #E84057;
  border-color: #E84057;
  border-radius: 12px;
  height: 44px;
  margin-top: 8px;
}
</style>

<script setup lang="ts">
import { ref } from 'vue'
import { NModal, NCard, NForm, NFormItem, NInput, NButton, useMessage } from 'naive-ui'
import { useSpaceStore } from '../../stores/space'

const props = defineProps<{ show: boolean }>()
const emit = defineEmits<{
  'update:show': [value: boolean]
  created: [spaceId: string]
}>()

const message = useMessage()
const spaceStore = useSpaceStore()
const name = ref('')
const description = ref('')
const loading = ref(false)

async function handleCreate() {
  if (!name.value.trim()) {
    message.warning('스페이스 이름을 입력해주세요')
    return
  }
  loading.value = true
  try {
    const space = await spaceStore.createSpace(name.value.trim(), description.value.trim() || undefined)
    name.value = ''
    description.value = ''
    emit('created', space.id)
  } catch {
    message.error('스페이스 생성에 실패했습니다')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <NModal :show="show" @update:show="emit('update:show', $event)">
    <NCard
      title="새 스페이스 만들기"
      :bordered="false"
      class="wyg-modal-card"
      style="max-width: 420px;"
      closable
      @close="emit('update:show', false)"
    >
      <NForm @submit.prevent="handleCreate">
        <NFormItem label="스페이스 이름">
          <NInput v-model:value="name" placeholder="예: 서울 데이트 코스" />
        </NFormItem>
        <NFormItem label="설명 (선택)">
          <NInput
            v-model:value="description"
            type="textarea"
            placeholder="이 스페이스에 대한 설명"
            :rows="3"
          />
        </NFormItem>
        <NButton
          type="primary"
          block
          size="large"
          :loading="loading"
          attr-type="submit"
          style="margin-top: 8px;"
        >
          만들기
        </NButton>
      </NForm>
    </NCard>
  </NModal>
</template>

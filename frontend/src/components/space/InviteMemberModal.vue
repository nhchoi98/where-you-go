<script setup lang="ts">
import { ref } from 'vue'
import { NModal, NCard, NForm, NFormItem, NInput, NButton, useMessage } from 'naive-ui'
import { useSpaceStore } from '../../stores/space'

const props = defineProps<{ show: boolean; spaceId: string }>()
const emit = defineEmits<{
  'update:show': [value: boolean]
  invited: []
}>()

const message = useMessage()
const spaceStore = useSpaceStore()
const email = ref('')
const loading = ref(false)

async function handleInvite() {
  if (!email.value.trim()) {
    message.warning('이메일을 입력해주세요')
    return
  }
  loading.value = true
  try {
    await spaceStore.inviteMember(props.spaceId, email.value.trim())
    message.success('멤버를 초대했습니다')
    email.value = ''
    emit('invited')
    emit('update:show', false)
  } catch {
    message.error('초대에 실패했습니다. 가입된 사용자인지 확인해주세요.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <NModal :show="show" @update:show="emit('update:show', $event)">
    <NCard
      title="멤버 초대"
      :bordered="false"
      class="modal-card"
      closable
      @close="emit('update:show', false)"
    >
      <NForm @submit.prevent="handleInvite">
        <NFormItem label="초대할 이메일">
          <NInput v-model:value="email" placeholder="example@email.com" />
        </NFormItem>
        <NButton
          type="primary"
          block
          :loading="loading"
          attr-type="submit"
          class="submit-btn"
        >
          초대하기
        </NButton>
      </NForm>
    </NCard>
  </NModal>
</template>

<style scoped>
.modal-card {
  width: 90vw;
  max-width: 420px;
  border-radius: 16px;
}

.submit-btn {
  background-color: #E84057;
  border-color: #E84057;
  border-radius: 12px;
  height: 44px;
  margin-top: 8px;
}
</style>

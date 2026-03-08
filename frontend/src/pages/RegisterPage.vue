<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NCard, NForm, NFormItem, NInput, NButton, NSpace, useMessage } from 'naive-ui'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const message = useMessage()
const auth = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)

async function handleRegister() {
  loading.value = true
  try {
    await auth.register(email.value, password.value, name.value)
    router.push('/')
  } catch {
    message.error('회원가입에 실패했습니다')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="register-page">
    <NCard class="register-card" :bordered="false">
      <div class="register-header">
        <h1 class="logo-text">Where You Go</h1>
        <p class="subtitle">새로운 여정을 시작하세요</p>
      </div>

      <NForm @submit.prevent="handleRegister">
        <NFormItem label="이름">
          <NInput v-model:value="name" placeholder="이름 입력" />
        </NFormItem>
        <NFormItem label="이메일">
          <NInput v-model:value="email" placeholder="이메일 입력" />
        </NFormItem>
        <NFormItem label="비밀번호">
          <NInput v-model:value="password" type="password" placeholder="비밀번호 입력" show-password-on="click" />
        </NFormItem>
        <NButton
          type="primary"
          block
          :loading="loading"
          attr-type="submit"
          class="register-btn"
        >
          회원가입
        </NButton>
      </NForm>

      <NSpace justify="center" style="margin-top: 16px;">
        <RouterLink to="/login" class="link">이미 계정이 있으신가요? 로그인</RouterLink>
      </NSpace>
    </NCard>
  </div>
</template>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FFF5E4 0%, #FFD6D6 100%);
  padding: 16px;
}

.register-card {
  width: 100%;
  max-width: 400px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(232, 64, 87, 0.1);
}

.register-header {
  text-align: center;
  margin-bottom: 24px;
}

.logo-text {
  font-size: 28px;
  font-weight: 700;
  color: #E84057;
  margin: 0 0 4px;
}

.subtitle {
  color: #999;
  font-size: 14px;
  margin: 0;
}

.register-btn {
  background-color: #E84057;
  border-color: #E84057;
  border-radius: 12px;
  height: 44px;
  font-size: 16px;
}

.link {
  color: #E84057;
  text-decoration: none;
  font-size: 14px;
}
</style>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NCard, NForm, NFormItem, NInput, NButton, NSpace, useMessage } from 'naive-ui'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const message = useMessage()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)

async function handleLogin() {
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    router.push('/')
  } catch {
    message.error('이메일 또는 비밀번호가 올바르지 않습니다')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <NCard class="login-card" :bordered="false">
      <div class="login-header">
        <h1 class="logo-text">Where You Go</h1>
        <p class="subtitle">함께 떠나는 우리만의 장소</p>
      </div>

      <NForm @submit.prevent="handleLogin">
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
          class="login-btn"
        >
          로그인
        </NButton>
      </NForm>

      <NSpace justify="center" style="margin-top: 16px;">
        <RouterLink to="/register" class="link">계정이 없으신가요? 회원가입</RouterLink>
      </NSpace>
    </NCard>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FFF5E4 0%, #FFD6D6 100%);
  padding: 16px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(232, 64, 87, 0.1);
}

.login-header {
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

.login-btn {
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

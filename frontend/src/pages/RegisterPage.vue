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
          size="large"
          :loading="loading"
          attr-type="submit"
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
  background: var(--wyg-bg-gradient);
  padding: var(--wyg-space-4);
}

.register-card {
  width: 100%;
  max-width: 400px;
  border-radius: var(--wyg-radius-xl);
  box-shadow: var(--wyg-shadow-lg);
}

.register-header {
  text-align: center;
  margin-bottom: var(--wyg-space-6);
}

.logo-text {
  font-size: var(--wyg-font-3xl);
  font-weight: 700;
  color: var(--wyg-text-accent);
  margin: 0 0 var(--wyg-space-1);
  letter-spacing: -0.02em;
}

.subtitle {
  color: var(--wyg-text-tertiary);
  font-size: var(--wyg-font-base);
  margin: 0;
}

.link {
  color: var(--wyg-text-accent);
  text-decoration: none;
  font-size: var(--wyg-font-base);
}

.link:hover {
  text-decoration: underline;
}
</style>

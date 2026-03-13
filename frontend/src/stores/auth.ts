import { ref } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '../api/auth'
import type { User } from '../types/user'

const DEV_MOCK = import.meta.env.DEV && import.meta.env.VITE_MOCK === 'true'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const checked = ref(false)

  async function fetchMe() {
    if (DEV_MOCK) {
      const { mockUser } = await import('../mock/data')
      user.value = mockUser
      checked.value = true
      return
    }
    try {
      user.value = await authApi.me()
    } catch {
      user.value = null
    } finally {
      checked.value = true
    }
  }

  async function login(email: string, password: string) {
    if (DEV_MOCK) {
      const { mockUser } = await import('../mock/data')
      user.value = mockUser
      return
    }
    user.value = await authApi.login({ email, password })
  }

  async function register(email: string, password: string, name: string) {
    if (DEV_MOCK) {
      const { mockUser } = await import('../mock/data')
      user.value = mockUser
      return
    }
    user.value = await authApi.register({ email, password, name })
  }

  async function logout() {
    if (DEV_MOCK) {
      user.value = null
      return
    }
    await authApi.logout()
    user.value = null
  }

  return { user, checked, fetchMe, login, register, logout }
})

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '../api/auth'
import type { User } from '../types/user'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const checked = ref(false)

  async function fetchMe() {
    try {
      user.value = await authApi.me()
    } catch {
      user.value = null
    } finally {
      checked.value = true
    }
  }

  async function login(email: string, password: string) {
    user.value = await authApi.login({ email, password })
  }

  async function register(email: string, password: string, name: string) {
    user.value = await authApi.register({ email, password, name })
  }

  async function logout() {
    await authApi.logout()
    user.value = null
  }

  return { user, checked, fetchMe, login, register, logout }
})

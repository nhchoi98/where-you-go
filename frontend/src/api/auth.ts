import instance from './http'
import type { User } from '../types/user'

interface LoginPayload {
  email: string
  password: string
}

interface RegisterPayload {
  email: string
  password: string
  name: string
}

export const authApi = {
  async login(payload: LoginPayload): Promise<User> {
    const res = await instance.post('/api/auth/login', payload)
    return res.data
  },

  async register(payload: RegisterPayload): Promise<User> {
    const res = await instance.post('/api/auth/register', payload)
    return res.data
  },

  async logout(): Promise<void> {
    await instance.post('/api/auth/logout')
  },

  async me(): Promise<User> {
    const res = await instance.get('/api/auth/me')
    return res.data
  },
}

import instance from './http'
import type { Task } from '../types/task'

export const tasksApi = {
  async list(spaceId: string, priority?: number): Promise<Task[]> {
    const params = priority ? { priority } : {}
    const res = await instance.get(`/api/spaces/${spaceId}/tasks`, { params })
    return res.data
  },

  async create(spaceId: string, payload: { title: string; placeName?: string | null; priority?: number; metadata?: { entries: { type: string; content: string }[] } }): Promise<Task> {
    const res = await instance.post(`/api/spaces/${spaceId}/tasks`, payload)
    return res.data
  },

  async update(spaceId: string, taskId: string, payload: { title?: string; placeName?: string | null; priority?: number; metadata?: { entries: { type: string; content: string }[] } }): Promise<Task> {
    const res = await instance.put(`/api/spaces/${spaceId}/tasks/${taskId}`, payload)
    return res.data
  },

  async remove(spaceId: string, taskId: string): Promise<void> {
    await instance.delete(`/api/spaces/${spaceId}/tasks/${taskId}`)
  },
}

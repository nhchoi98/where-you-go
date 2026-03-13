import { ref } from 'vue'
import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import { tasksApi } from '../api/tasks'
import type { Task } from '../types/task'

const DEV_MOCK = import.meta.env.DEV && import.meta.env.VITE_MOCK === 'true'

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)

  async function fetchTasks(spaceId: string, priority?: number) {
    loading.value = true
    try {
      if (DEV_MOCK) {
        const { mockTasks } = await import('../mock/data')
        tasks.value = priority
          ? mockTasks.filter((t) => t.priority === priority)
          : mockTasks
        return
      }
      tasks.value = await tasksApi.list(spaceId, priority)
    } finally {
      loading.value = false
    }
  }

  async function createTask(spaceId: string, payload: { title: string; placeName?: string | null; priority?: number; metadata?: { entries: { type: string; content: string }[] } }) {
    if (DEV_MOCK) {
      const task: Task = { id: `task-${Date.now()}`, spaceId, createdBy: 'user-1', title: payload.title, placeName: payload.placeName ?? null, priority: payload.priority ?? 3, metadata: { entries: (payload.metadata?.entries ?? []) as Task['metadata']['entries'] }, createdAt: dayjs().toISOString(), updatedAt: dayjs().toISOString() }
      tasks.value.unshift(task)
      return task
    }
    const task = await tasksApi.create(spaceId, payload)
    tasks.value.unshift(task)
    return task
  }

  async function updateTask(spaceId: string, taskId: string, payload: { title?: string; placeName?: string | null; priority?: number; metadata?: { entries: { type: string; content: string }[] } }) {
    if (DEV_MOCK) {
      const idx = tasks.value.findIndex((t) => t.id === taskId)
      if (idx !== -1) {
        tasks.value[idx] = { ...tasks.value[idx]!, ...payload, metadata: payload.metadata ? { entries: payload.metadata.entries as Task['metadata']['entries'] } : tasks.value[idx]!.metadata, updatedAt: dayjs().toISOString() }
      }
      return tasks.value[idx]!
    }
    const task = await tasksApi.update(spaceId, taskId, payload)
    const idx = tasks.value.findIndex((t) => t.id === taskId)
    if (idx !== -1) tasks.value[idx] = task
    return task
  }

  async function removeTask(spaceId: string, taskId: string) {
    if (DEV_MOCK) {
      tasks.value = tasks.value.filter((t) => t.id !== taskId)
      return
    }
    await tasksApi.remove(spaceId, taskId)
    tasks.value = tasks.value.filter((t) => t.id !== taskId)
  }

  return { tasks, loading, fetchTasks, createTask, updateTask, removeTask }
})

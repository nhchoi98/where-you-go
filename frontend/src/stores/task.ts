import { ref } from 'vue'
import { defineStore } from 'pinia'
import { tasksApi } from '../api/tasks'
import type { Task } from '../types/task'

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)

  async function fetchTasks(spaceId: string, priority?: number) {
    loading.value = true
    try {
      tasks.value = await tasksApi.list(spaceId, priority)
    } finally {
      loading.value = false
    }
  }

  async function createTask(spaceId: string, payload: { title: string; placeName?: string | null; priority?: number; metadata?: { entries: { type: string; content: string }[] } }) {
    const task = await tasksApi.create(spaceId, payload)
    tasks.value.unshift(task)
    return task
  }

  async function updateTask(spaceId: string, taskId: string, payload: { title?: string; placeName?: string | null; priority?: number; metadata?: { entries: { type: string; content: string }[] } }) {
    const task = await tasksApi.update(spaceId, taskId, payload)
    const idx = tasks.value.findIndex((t) => t.id === taskId)
    if (idx !== -1) tasks.value[idx] = task
    return task
  }

  async function removeTask(spaceId: string, taskId: string) {
    await tasksApi.remove(spaceId, taskId)
    tasks.value = tasks.value.filter((t) => t.id !== taskId)
  }

  return { tasks, loading, fetchTasks, createTask, updateTask, removeTask }
})

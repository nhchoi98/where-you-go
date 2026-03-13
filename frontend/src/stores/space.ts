import { ref } from 'vue'
import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import { spacesApi } from '../api/spaces'
import type { Space, SpaceDetail } from '../types/space'

const DEV_MOCK = import.meta.env.DEV && import.meta.env.VITE_MOCK === 'true'

export const useSpaceStore = defineStore('space', () => {
  const spaces = ref<Space[]>([])
  const currentSpace = ref<SpaceDetail | null>(null)
  const loading = ref(false)

  async function fetchSpaces() {
    loading.value = true
    try {
      if (DEV_MOCK) {
        const { mockSpaces } = await import('../mock/data')
        spaces.value = mockSpaces
        return
      }
      spaces.value = await spacesApi.list()
    } finally {
      loading.value = false
    }
  }

  async function createSpace(name: string, description?: string) {
    if (DEV_MOCK) {
      const space: Space = { id: `space-${Date.now()}`, name, description: description ?? null, createdBy: 'user-1', createdAt: dayjs().toISOString(), updatedAt: dayjs().toISOString() }
      spaces.value.unshift(space)
      return space
    }
    const space = await spacesApi.create({ name, description })
    spaces.value.unshift(space)
    return space
  }

  async function fetchSpace(spaceId: string) {
    loading.value = true
    try {
      if (DEV_MOCK) {
        const { mockSpaceDetail, mockSpaces } = await import('../mock/data')
        const found = mockSpaces.find((s) => s.id === spaceId)
        currentSpace.value = found
          ? { ...mockSpaceDetail, space: found }
          : mockSpaceDetail
        return
      }
      currentSpace.value = await spacesApi.get(spaceId)
    } finally {
      loading.value = false
    }
  }

  async function inviteMember(spaceId: string, email: string) {
    const member = await spacesApi.invite(spaceId, email)
    if (currentSpace.value && currentSpace.value.space.id === spaceId) {
      currentSpace.value.members.push(member)
    }
    return member
  }

  return { spaces, currentSpace, loading, fetchSpaces, createSpace, fetchSpace, inviteMember }
})

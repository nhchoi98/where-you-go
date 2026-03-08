import { ref } from 'vue'
import { defineStore } from 'pinia'
import { spacesApi } from '../api/spaces'
import type { Space, SpaceDetail } from '../types/space'

export const useSpaceStore = defineStore('space', () => {
  const spaces = ref<Space[]>([])
  const currentSpace = ref<SpaceDetail | null>(null)
  const loading = ref(false)

  async function fetchSpaces() {
    loading.value = true
    try {
      spaces.value = await spacesApi.list()
    } finally {
      loading.value = false
    }
  }

  async function createSpace(name: string, description?: string) {
    const space = await spacesApi.create({ name, description })
    spaces.value.unshift(space)
    return space
  }

  async function fetchSpace(spaceId: string) {
    loading.value = true
    try {
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

import { ref } from 'vue'
import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import { journalsApi } from '../api/journals'
import type { Journal } from '../types/journal'

const DEV_MOCK = import.meta.env.DEV && import.meta.env.VITE_MOCK === 'true'

export const useJournalStore = defineStore('journal', () => {
  const journals = ref<Journal[]>([])
  const currentJournal = ref<Journal | null>(null)
  const loading = ref(false)

  async function fetchJournals(spaceId: string) {
    loading.value = true
    try {
      if (DEV_MOCK) {
        const { mockJournals } = await import('../mock/data')
        journals.value = mockJournals
        return
      }
      journals.value = await journalsApi.list(spaceId)
    } finally {
      loading.value = false
    }
  }

  async function fetchJournal(spaceId: string, journalId: string) {
    loading.value = true
    try {
      if (DEV_MOCK) {
        const { mockJournals } = await import('../mock/data')
        currentJournal.value = mockJournals.find((j) => j.id === journalId) ?? null
        return
      }
      currentJournal.value = await journalsApi.get(spaceId, journalId)
    } finally {
      loading.value = false
    }
  }

  async function createJournal(spaceId: string, payload: Parameters<typeof journalsApi.create>[1]) {
    if (DEV_MOCK) {
      const journal: Journal = { id: `journal-${Date.now()}`, spaceId, createdBy: 'user-1', title: payload.title, dateFrom: payload.dateFrom, dateTo: payload.dateTo, taskIds: payload.taskIds ?? [], metadata: { description: payload.metadata?.description, review: payload.metadata?.review, entries: [] }, createdAt: dayjs().toISOString(), updatedAt: dayjs().toISOString() }
      journals.value.unshift(journal)
      return journal
    }
    const journal = await journalsApi.create(spaceId, payload)
    journals.value.unshift(journal)
    return journal
  }

  async function updateJournal(spaceId: string, journalId: string, payload: Parameters<typeof journalsApi.update>[2]) {
    if (DEV_MOCK) {
      const idx = journals.value.findIndex((j) => j.id === journalId)
      if (idx !== -1) {
        const prev = journals.value[idx]!
        journals.value[idx] = { ...prev, title: payload.title ?? prev.title, dateFrom: payload.dateFrom ?? prev.dateFrom, dateTo: payload.dateTo ?? prev.dateTo, taskIds: payload.taskIds ?? prev.taskIds, metadata: { ...prev.metadata, description: payload.metadata?.description ?? prev.metadata?.description, review: payload.metadata?.review ?? prev.metadata?.review }, updatedAt: dayjs().toISOString() }
        currentJournal.value = journals.value[idx]!
      }
      return journals.value[idx]!
    }
    const journal = await journalsApi.update(spaceId, journalId, payload)
    const idx = journals.value.findIndex((j) => j.id === journalId)
    if (idx !== -1) journals.value[idx] = journal
    currentJournal.value = journal
    return journal
  }

  async function removeJournal(spaceId: string, journalId: string) {
    if (DEV_MOCK) {
      journals.value = journals.value.filter((j) => j.id !== journalId)
      return
    }
    await journalsApi.remove(spaceId, journalId)
    journals.value = journals.value.filter((j) => j.id !== journalId)
  }

  return { journals, currentJournal, loading, fetchJournals, fetchJournal, createJournal, updateJournal, removeJournal }
})

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { journalsApi } from '../api/journals'
import type { Journal } from '../types/journal'

export const useJournalStore = defineStore('journal', () => {
  const journals = ref<Journal[]>([])
  const currentJournal = ref<Journal | null>(null)
  const loading = ref(false)

  async function fetchJournals(spaceId: string) {
    loading.value = true
    try {
      journals.value = await journalsApi.list(spaceId)
    } finally {
      loading.value = false
    }
  }

  async function fetchJournal(spaceId: string, journalId: string) {
    loading.value = true
    try {
      currentJournal.value = await journalsApi.get(spaceId, journalId)
    } finally {
      loading.value = false
    }
  }

  async function createJournal(spaceId: string, payload: Parameters<typeof journalsApi.create>[1]) {
    const journal = await journalsApi.create(spaceId, payload)
    journals.value.unshift(journal)
    return journal
  }

  async function updateJournal(spaceId: string, journalId: string, payload: Parameters<typeof journalsApi.update>[2]) {
    const journal = await journalsApi.update(spaceId, journalId, payload)
    const idx = journals.value.findIndex((j) => j.id === journalId)
    if (idx !== -1) journals.value[idx] = journal
    currentJournal.value = journal
    return journal
  }

  async function removeJournal(spaceId: string, journalId: string) {
    await journalsApi.remove(spaceId, journalId)
    journals.value = journals.value.filter((j) => j.id !== journalId)
  }

  return { journals, currentJournal, loading, fetchJournals, fetchJournal, createJournal, updateJournal, removeJournal }
})

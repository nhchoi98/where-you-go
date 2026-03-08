import instance from './http'
import type { Journal } from '../types/journal'

export const journalsApi = {
  async list(spaceId: string): Promise<Journal[]> {
    const res = await instance.get(`/api/spaces/${spaceId}/journals`)
    return res.data
  },

  async get(spaceId: string, journalId: string): Promise<Journal> {
    const res = await instance.get(`/api/spaces/${spaceId}/journals/${journalId}`)
    return res.data
  },

  async create(spaceId: string, payload: {
    title: string
    dateFrom: string
    dateTo: string
    taskIds?: string[]
    metadata?: { description?: string; review?: string; entries?: { type: string; content: string }[] }
  }): Promise<Journal> {
    const res = await instance.post(`/api/spaces/${spaceId}/journals`, payload)
    return res.data
  },

  async update(spaceId: string, journalId: string, payload: {
    title?: string
    dateFrom?: string
    dateTo?: string
    taskIds?: string[]
    metadata?: { description?: string; review?: string; entries?: { type: string; content: string }[] }
  }): Promise<Journal> {
    const res = await instance.put(`/api/spaces/${spaceId}/journals/${journalId}`, payload)
    return res.data
  },

  async remove(spaceId: string, journalId: string): Promise<void> {
    await instance.delete(`/api/spaces/${spaceId}/journals/${journalId}`)
  },
}

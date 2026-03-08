import instance from './http'
import type { AiOptionsResult, AiDetailResult } from '../types/ai'

export const aiApi = {
  async suggest(spaceId: string, payload: { anchorTaskId: string; dateRange?: string }): Promise<AiOptionsResult> {
    const res = await instance.post(`/api/spaces/${spaceId}/ai/suggest`, payload)
    return res.data
  },

  async detail(spaceId: string, payload: {
    anchorTaskId: string
    dateRange?: string
    selectedKey: string
    selectedSummary: string
  }): Promise<AiDetailResult> {
    const res = await instance.post(`/api/spaces/${spaceId}/ai/detail`, payload)
    return res.data
  },
}

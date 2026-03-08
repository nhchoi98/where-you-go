import instance from './http'

export interface RecommendResult {
  category: string
  result: string
}

export const recommendApi = {
  async getEvents(category: string, location?: string): Promise<RecommendResult> {
    const res = await instance.post('/api/recommend/events', { category, location })
    return res.data
  },
}

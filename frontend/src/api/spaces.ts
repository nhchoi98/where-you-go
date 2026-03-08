import instance from './http'
import type { Space, SpaceDetail, SpaceMember } from '../types/space'

export const spacesApi = {
  async list(): Promise<Space[]> {
    const res = await instance.get('/api/spaces')
    return res.data
  },

  async create(payload: { name: string; description?: string }): Promise<Space> {
    const res = await instance.post('/api/spaces', payload)
    return res.data
  },

  async get(spaceId: string): Promise<SpaceDetail> {
    const res = await instance.get(`/api/spaces/${spaceId}`)
    return res.data
  },

  async invite(spaceId: string, email: string): Promise<SpaceMember> {
    const res = await instance.post(`/api/spaces/${spaceId}/invite`, { email })
    return res.data
  },
}

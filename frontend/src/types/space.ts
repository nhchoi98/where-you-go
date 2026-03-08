export interface Space {
  id: string
  name: string
  description: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface SpaceMember {
  id: string
  userId: string
  role: 'owner' | 'member'
  joinedAt: string
  userName: string | null
  userEmail: string | null
}

export interface SpaceDetail {
  space: Space
  members: SpaceMember[]
}

export interface MetadataEntry {
  type: 'memo' | 'map_link' | 'image'
  content: string
  createdAt?: string
}

export interface TaskMetadata {
  entries: MetadataEntry[]
}

export interface Task {
  id: string
  spaceId: string
  createdBy: string
  title: string
  placeName: string | null
  priority: number
  metadata: TaskMetadata
  createdAt: string
  updatedAt: string
}

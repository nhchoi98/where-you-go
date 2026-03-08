export interface JournalMetadataEntry {
  type: 'memo' | 'image'
  content: string
}

export interface JournalMetadata {
  description?: string
  review?: string
  entries: JournalMetadataEntry[]
}

export interface Journal {
  id: string
  spaceId: string
  createdBy: string
  title: string
  dateFrom: string
  dateTo: string
  taskIds: string[]
  metadata: JournalMetadata
  createdAt: string
  updatedAt: string
}

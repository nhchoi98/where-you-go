export interface AiOptionItem {
  key: string
  label: string
  summary: string
}

export interface AiOptionsResult {
  options: AiOptionItem[]
}

export interface AiDetailResult {
  detail: string
}

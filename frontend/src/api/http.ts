import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'

// snake_case → camelCase
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
}

// camelCase → snake_case
function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)
}

function convertKeys(obj: unknown, converter: (key: string) => string): unknown {
  if (Array.isArray(obj)) {
    return obj.map((item) => convertKeys(item, converter))
  }
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([key, value]) => [
        converter(key),
        convertKeys(value, converter),
      ]),
    )
  }
  return obj
}

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Request: camelCase → snake_case
instance.interceptors.request.use((config) => {
  if (config.data && typeof config.data === 'object') {
    config.data = convertKeys(config.data, toSnakeCase)
  }
  if (config.params && typeof config.params === 'object') {
    config.params = convertKeys(config.params, toSnakeCase)
  }
  return config
})

// Response: snake_case → camelCase
instance.interceptors.response.use((response) => {
  if (response.data && typeof response.data === 'object') {
    response.data = convertKeys(response.data, toCamelCase)
  }
  return response
})

// Orval mutator: 이 함수를 export하면 orval이 생성한 코드에서 사용
export const http = <T>(config: AxiosRequestConfig): Promise<T> => {
  return instance(config).then((res) => res.data)
}

export default instance

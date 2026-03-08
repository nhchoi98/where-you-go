import { defineConfig } from 'orval'

export default defineConfig({
  api: {
    input: {
      target: 'http://localhost:8000/openapi.json',
    },
    output: {
      target: './src/api/generated.ts',
      client: 'axios',
      httpClient: 'axios',
      override: {
        mutator: {
          path: './src/api/http.ts',
          name: 'http',
        },
        // snake_case → camelCase 자동 변환
        requestOptions: false,
      },
      // 응답/요청 body의 snake_case key를 camelCase로 변환
      keyMapper: {
        name: 'camelCase',
      },
    },
  },
})

# Where You Go

여행/외출 목적지를 저장하고 스페이스 단위로 멤버와 공유하는 앱.

## Tech Stack
- **Frontend**: Vue 3 (Composition API, `<script setup>`) + TypeScript + Vite + pnpm
- **UI**: Naive UI
- **Utilities**: VueUse (필수)
- **State**: Pinia
- **Router**: Vue Router 4
- **Backend**: FastAPI (Python)
- **DB**: PostgreSQL (JSONB for flexible data) / SQLite for local dev
- **Auth**: 자체 인증 (이메일/비밀번호 + 세션 쿠키, Argon2 해싱) — OAuth 추후 추가
- **API Codegen**: Orval (OpenAPI → TypeScript, snake_case ↔ camelCase 자동 변환)
- **AI**: OpenAI GPT API (dual-agent debate)
- **CI/CD**: GitHub Actions → ECR → EC2 (docker-compose)
- **Deploy**: AWS EC2 + ECR + Route53
- **Reverse Proxy**: Traefik (Let's Encrypt SSL 자동 발급)

## Project Structure
```
where-you-go/
├── frontend/          # Vue 3 app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── composables/
│   │   ├── stores/
│   │   ├── api/
│   │   ├── types/
│   │   ├── layouts/
│   │   └── router/
│   └── ...
├── backend/           # FastAPI app
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── core/
│   │   └── main.py
│   └── ...
├── docker-compose.yml
├── traefik/
└── infra/             # AWS deployment configs
```

## UI / UX
- **Primary Target**: 모바일 (Mobile-first 반응형 필수)
- **Theme**: 데이트 컨셉
  - 따뜻한 톤 (coral, rose, warm beige 계열)
  - 부드러운 라운드 카드 UI
  - 아이콘: 하트, 핀, 별 등 감성적 요소 활용
  - 타이포: 가독성 좋은 둥근 폰트 (Pretendard, Noto Sans KR)
- **Responsive**: 모든 페이지 모바일 우선 설계, 태블릿/데스크톱 확장
  - breakpoints: `sm: 640px`, `md: 768px`, `lg: 1024px`
  - 모바일: 단일 컬럼, 하단 네비게이션 바
  - 데스크톱: 사이드바 네비게이션, 멀티 컬럼

## Conventions
- Frontend: PascalCase components, camelCase composables, `<script setup lang="ts">`, **camelCase** for API types
- Backend: **snake_case** everywhere (Pydantic models, DB columns, API responses)
- API 연동: Orval codegen (`pnpm api:gen`) — 백엔드 snake_case ↔ 프론트 camelCase 자동 변환 (http.ts 인터셉터)
- DB: snake_case table/column names, JSONB for flexible metadata
- Auth: 세션 기반 (쿠키), 로그인/회원가입 외 모든 API는 세션 검증 필수

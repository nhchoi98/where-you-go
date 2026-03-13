# Where You Go - Frontend

여행/외출 목적지를 저장하고 스페이스 단위로 멤버와 공유하는 앱의 프론트엔드.

## 기술 스택

Vue 3 (Composition API, `<script setup>`) + TypeScript + Naive UI + Pinia + VueUse + Vite

패키지 매니저는 pnpm을 사용한다.

## 시작하기

```bash
pnpm install && pnpm dev
```

## Mock 모드

백엔드 없이 프론트엔드만으로 모든 페이지를 확인할 수 있다.

`.env.development` 파일에 다음 설정이 되어 있으면 mock 데이터로 동작한다:

```
VITE_MOCK=true
```

- Mock 데이터는 `src/mock/data.ts`에 정의되어 있다 (유저, 스페이스 3개, 태스크 5개, 저널 2개).
- mock 모드를 끄려면 `VITE_MOCK=false`로 변경한다.
- 프로덕션 빌드에는 영향 없음 (`import.meta.env.DEV` 조건으로 분기).

## 빌드

```bash
pnpm build
```

## 디자인 토큰

- `src/styles/tokens.css` — CSS custom properties로 색상, 간격, 폰트 등의 디자인 토큰을 관리한다.
- `src/theme/naiveOverrides.ts` — Naive UI 테마 오버라이드를 정의한다.

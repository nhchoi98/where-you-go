# Where You Go - Implementation Plan

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                   Client (CSR)                   │
│          Vue 3 + Naive UI + Pinia                │
│    S3 + CloudFront (prod) / Vite dev (local)     │
└──────────────────────┬──────────────────────────┘
                       │ HTTP/REST
              ┌────────▼────────┐
              │    Traefik      │  ← Route53 DNS
              └────────┬────────┘
                       │
              ┌────────▼────────┐
              │    FastAPI       │
              │  (Backend API)   │
              ├─────────────────┤
              │  Auth (OAuth)    │
              │  Space Service   │
              │  Task Service    │
              │  AI Agent Svc    │
              │  Recommend Svc   │
              └────────┬────────┘
                       │
            ┌──────────┼──────────┐
            │          │          │
      ┌─────▼───┐ ┌───▼────┐ ┌──▼───────┐
      │PostgreSQL│ │ Redis  │ │OpenAI API│
      │ (JSONB)  │ │(cache) │ │(GPT-5+)  │
      └─────────┘ └────────┘ └──────────┘
```

---

## Data Model

### 1. accounts (계정)
| Column | Type | Note |
|--------|------|------|
| id | UUID | PK |
| email | VARCHAR | unique |
| name | VARCHAR | 표시명 |
| avatar_url | VARCHAR | nullable |
| oauth_provider | VARCHAR | google / kakao |
| oauth_id | VARCHAR | provider별 고유 ID |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### 2. spaces (스페이스)
| Column | Type | Note |
|--------|------|------|
| id | UUID | PK |
| name | VARCHAR | 스페이스명 |
| description | TEXT | nullable |
| created_by | UUID | FK → accounts.id |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### 3. space_members (스페이스 멤버)
| Column | Type | Note |
|--------|------|------|
| id | UUID | PK |
| space_id | UUID | FK → spaces.id |
| user_id | UUID | FK → accounts.id |
| role | VARCHAR | owner / member |
| joined_at | TIMESTAMP | |

### 4. tasks (태스크) — 비정형 metadata는 JSONB
| Column | Type | Note |
|--------|------|------|
| id | UUID | PK |
| space_id | UUID | FK → spaces.id |
| created_by | UUID | FK → accounts.id |
| location | VARCHAR | 어디인지 |
| priority | INT | 1~5 (5가 최고) |
| metadata | JSONB | 비정형 데이터 (아래 구조) |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**metadata JSONB 구조:**
```json
{
  "entries": [
    {
      "type": "memo",        // memo | map_link | image (추후)
      "content": "여기 분위기 좋음",
      "created_at": "2026-03-08T10:00:00Z"
    },
    {
      "type": "map_link",
      "content": "https://map.naver.com/...",
      "created_at": "2026-03-08T10:00:00Z"
    }
  ]
}
```

### 5. journals (특정 기간 task 묶음 — "저널")
| Column | Type | Note |
|--------|------|------|
| id | UUID | PK |
| space_id | UUID | FK → spaces.id |
| created_by | UUID | FK → accounts.id |
| date_from | DATE | 시작 날짜 |
| date_to | DATE | 종료 날짜 (당일이면 date_from == date_to) |
| title | VARCHAR | 저널 제목 (e.g., "홍대 나들이", "제주 2박3일") |
| task_ids | UUID[] | 연결된 task들 |
| metadata | JSONB | 비정형 (아래 구조) |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**journal metadata JSONB 구조:**
```json
{
  "description": "2박3일 제주 여행",
  "review": "정말 재밌었다. 다음에 또 오고 싶음.",
  "entries": [
    {
      "type": "memo",
      "content": "비가 와서 실내 위주로 돌아다님"
    }
  ]
}
```

---

## Phase 0: Project Bootstrap

### Task 0.1: 프로젝트 초기화
- **목표**: Frontend/Backend 프로젝트 scaffolding
- **파일**:
  - `frontend/` — `pnpm create vite` (vue-ts template)
  - `backend/` — FastAPI skeleton
  - `docker-compose.yml` — PostgreSQL + Redis
  - `.env.example`
- **완료 조건**: `pnpm dev`로 Vue 앱 실행, `uvicorn`으로 FastAPI 실행

### Task 0.2: DB 엔티티 정의
- **목표**: SQLAlchemy 모델 정의 (마이그레이션 없이 create_all 사용)
- **파일**: `backend/app/models/*.py` (Account, Space, SpaceMember, Task, Journal)
- **의존성**: Task 0.1
- **완료 조건**: 앱 시작 시 5개 테이블 자동 생성
- **상태**: ✅ 완료

---

## Phase 1: 인증 (Auth) — 자체 인증 우선, OAuth 추후 추가

### Task 1.1: Backend 자체 인증 API
- **목표**: 이메일/비밀번호 기반 회원가입 + 로그인 + 세션 쿠키 발급
- **파일**:
  - `backend/app/core/security.py` — Argon2 비밀번호 해싱
  - `backend/app/api/auth.py` — `/auth/register`, `/auth/login`, `/auth/me`
  - `backend/app/schemas/auth.py` — RegisterRequest, LoginRequest, TokenResponse
- **의존성**: Task 0.2
- **완료 조건**: 회원가입 → 로그인 → JWT 발급 → /auth/me로 인증 확인

### Task 1.2: Frontend 로그인/회원가입 페이지
- **목표**: 이메일/비밀번호 로그인 + 회원가입 UI
- **파일**:
  - `frontend/src/pages/LoginPage.vue` — 로그인 폼
  - `frontend/src/pages/RegisterPage.vue` — 회원가입 폼
  - `frontend/src/api/auth.ts`
  - `frontend/src/stores/auth.ts` — Pinia store (토큰, 유저 정보)
  - `frontend/src/composables/useAuth.ts`
  - `frontend/src/router/index.ts` — 인증 가드
- **의존성**: Task 1.1
- **완료 조건**: 회원가입 → 로그인 → JWT 저장 → 인증 상태 유지

### Task 1.3: (추후) OAuth 연동
- **목표**: Google, Kakao OAuth 추가 연동
- **상태**: 보류 — 앱 등록/심사 완료 후 진행
- **파일**:
  - `backend/app/core/oauth.py` — authlib 기반 OAuth 설정
  - `backend/app/api/auth.py` — `/auth/google`, `/auth/kakao` 추가

---

## Phase 2: 스페이스 (Space)

### Task 2.1: Backend Space CRUD API
- **목표**: 스페이스 생성, 조회, 멤버 초대/목록 API
- **파일**:
  - `backend/app/api/spaces.py`
  - `backend/app/schemas/space.py`
  - `backend/app/services/space_service.py`
- **의존성**: Task 1.1
- **완료 조건**: 스페이스 CRUD + 멤버 초대(owner만) + 멤버 목록 조회

### Task 2.2: Frontend 스페이스 UI
- **목표**: 스페이스 목록/생성/상세 페이지
- **파일**:
  - `frontend/src/pages/SpaceListPage.vue` — 내 스페이스 목록 (없으면 생성 유도)
  - `frontend/src/pages/SpaceDetailPage.vue` — 스페이스 상세 + 멤버 목록
  - `frontend/src/components/space/CreateSpaceModal.vue`
  - `frontend/src/components/space/InviteMemberModal.vue`
  - `frontend/src/api/spaces.ts`
  - `frontend/src/stores/space.ts`
- **의존성**: Task 2.1, Task 1.2
- **완료 조건**: 스페이스 생성 → 멤버 초대 → 멤버 목록 확인

---

## Phase 3: 태스크 (Task)

### Task 3.1: Backend Task CRUD API
- **목표**: 태스크 CRUD + metadata 관리
- **파일**:
  - `backend/app/api/tasks.py`
  - `backend/app/schemas/task.py` — metadata entry 타입 포함
  - `backend/app/services/task_service.py`
- **의존성**: Task 2.1
- **완료 조건**: Task CRUD + JSONB metadata 저장/조회 + priority 필터링

### Task 3.2: Frontend 태스크 UI
- **목표**: 태스크 목록/추가/편집 UI
- **파일**:
  - `frontend/src/pages/TaskListPage.vue` — 태스크 목록 (우선순위 표시)
  - `frontend/src/components/task/TaskCard.vue` — 태스크 카드
  - `frontend/src/components/task/TaskFormModal.vue` — 생성/편집 폼
  - `frontend/src/components/task/MetadataEntry.vue` — metadata 타입별 렌더링
  - `frontend/src/api/tasks.ts`
  - `frontend/src/stores/task.ts`
  - `frontend/src/types/task.ts`
- **의존성**: Task 3.1, Task 2.2
- **완료 조건**: 태스크 추가(위치, 우선순위, metadata) → 목록에서 확인 → 편집/삭제

---

## Phase 4: 저널 (Journal — 특정날 task 묶음)

### Task 4.1: Backend Journal API
- **목표**: 저널 CRUD + task 연결
- **파일**:
  - `backend/app/api/journals.py`
  - `backend/app/schemas/journal.py`
  - `backend/app/services/journal_service.py`
- **의존성**: Task 3.1
- **완료 조건**: 날짜별 저널 생성, task 연결, metadata(감상문 등) 저장

### Task 4.2: Frontend 저널 UI
- **목표**: 달력/날짜별 저널 뷰 + task 연결 UI
- **파일**:
  - `frontend/src/pages/JournalPage.vue` — 달력 기반 저널 목록
  - `frontend/src/components/journal/JournalCard.vue`
  - `frontend/src/components/journal/JournalFormModal.vue` — task 선택 + 메타 입력
  - `frontend/src/api/journals.ts`
  - `frontend/src/stores/journal.ts`
- **의존성**: Task 4.1, Task 3.2
- **완료 조건**: 날짜 선택 → task 연결 → 감상문 작성 → 저널 확인

---

## Phase 5: AI Agent (Dual-Agent Debate)

### Task 5.1: Backend AI Agent 서비스
- **목표**: 두 GPT 에이전트가 토론하여 최적 답변을 생성하는 서비스
- **파일**:
  - `backend/app/services/ai_agent.py` — dual-agent debate 로직
  - `backend/app/api/ai.py` — `/ai/suggest` 엔드포인트
  - `backend/app/schemas/ai.py`
- **상세**:
  - Agent A: task 목록 + 기준 task를 받아 주변 추천 생성
  - Agent B: Agent A의 추천을 비판/보완
  - Judge: 두 답변을 평가하여 최종 답변 선택
  - 기간 지정 파라미터 지원
- **의존성**: Task 3.1
- **완료 조건**: 기준 task + 기간 → AI 토론 → 최종 추천 결과 반환

### Task 5.2: Frontend AI 추천 UI
- **목표**: AI 추천 요청/결과 표시 UI
- **파일**:
  - `frontend/src/pages/AiSuggestPage.vue`
  - `frontend/src/components/ai/SuggestForm.vue` — task 선택 + 기간 설정
  - `frontend/src/components/ai/SuggestResult.vue` — 결과 표시 (토론 과정 토글)
  - `frontend/src/api/ai.ts`
- **의존성**: Task 5.1, Task 3.2
- **완료 조건**: task 선택 → 기간 설정 → AI 추천 결과 표시

---

## Phase 6: 자동 추천 봇

### Task 6.1: Backend 추천 봇 서비스
- **목표**: 외부 데이터(전시회, 행사) 기반 task 추천
- **파일**:
  - `backend/app/services/recommend_bot.py` — GPT + 웹 검색 기반 추천
  - `backend/app/api/recommend.py` — `/recommend/events` 엔드포인트
  - `backend/app/schemas/recommend.py`
- **상세**:
  - 카테고리: 전시회, 미식행사, 시음행사, 코엑스 행사 등
  - GPT에게 최신 행사 정보를 검색하게 하여 추천 생성
  - 사용자 요청 시 on-demand로 생성
- **의존성**: Task 5.1
- **완료 조건**: 카테고리 선택 → 추천 행사 목록 반환

### Task 6.2: Frontend 추천 UI
- **목표**: 추천 행사 목록 + task로 변환
- **파일**:
  - `frontend/src/pages/RecommendPage.vue`
  - `frontend/src/components/recommend/EventCard.vue`
  - `frontend/src/api/recommend.ts`
- **의존성**: Task 6.1, Task 3.2
- **완료 조건**: 추천 요청 → 결과 목록 → "task로 추가" 버튼

---

## Phase 7: 랜덤 뽑기 (Fun Features)

### Task 7.1: Frontend 랜덤 뽑기 UI
- **목표**: 사다리 게임, 돌림판, 가위바위보 구현 (프론트엔드 only)
- **파일**:
  - `frontend/src/pages/RandomPickPage.vue` — 모드 선택
  - `frontend/src/components/random/LadderGame.vue` — Canvas/SVG 사다리 게임
  - `frontend/src/components/random/SpinWheel.vue` — Canvas 돌림판
  - `frontend/src/components/random/RockPaperScissors.vue` — 가위바위보
  - `frontend/src/composables/useRandomPick.ts`
- **상세**:
  - task 목록에서 선택 → 선택된 task들로 랜덤 뽑기
  - 사다리: 멤버 수 × task 수 매핑
  - 돌림판: task 이름 표시, 회전 애니메이션
  - 가위바위보: task 2개 선택 → 각각에 가위/바위/보 배정 → 승자 task
- **의존성**: Task 3.2
- **완료 조건**: 3가지 모드 모두 동작, task 선택 → 애니메이션 → 결과

---

## Phase 8: 배포 (Deployment) — GitHub Actions + docker-compose on EC2

### Task 8.1: Docker 구성
- **목표**: Frontend/Backend/DB/Traefik Docker Compose (로컬 & 프로덕션 공용)
- **파일**:
  - `Dockerfile.frontend` — nginx + Vite static build
  - `Dockerfile.backend` — Python FastAPI
  - `docker-compose.yml` — 로컬 개발용
  - `docker-compose.prod.yml` — 프로덕션용 (override)
  - `traefik/traefik.yml` — Traefik 설정 (SSL 자동 발급 포함)
  - `traefik/dynamic.yml` — 라우팅 규칙
  - `.env.example` — 환경변수 템플릿
- **완료 조건**: `docker-compose up`으로 전체 서비스 로컬 실행

### Task 8.2: GitHub Actions CI/CD 파이프라인
- **목표**: push → build → ECR push → EC2 배포 자동화
- **파일**:
  - `.github/workflows/deploy.yml`
- **상세 플로우**:
  ```
  git push (main branch)
    → GitHub Actions 트리거
      → Step 1: Docker 이미지 빌드 (frontend + backend)
      → Step 2: AWS ECR에 이미지 push
      → Step 3: SSH로 EC2 접속
      → Step 4: EC2에서 docker-compose pull & up -d
  ```
- **GitHub Secrets 필요**:
  - `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
  - `EC2_HOST`, `EC2_SSH_KEY`
  - `ECR_REGISTRY`
- **의존성**: Task 8.1
- **완료 조건**: main push → 자동 빌드 → ECR push → EC2 배포 완료

### Task 8.3: AWS 인프라 설정 가이드
- **목표**: 수동 AWS 설정 절차 문서화
- **파일**:
  - `infra/README.md` — 전체 AWS 설정 가이드
- **상세 (설정 순서)**:
  1. **ECR**: 프라이빗 리포지토리 2개 생성 (frontend, backend)
  2. **EC2**: t3.small 인스턴스 생성
     - Amazon Linux 2023 또는 Ubuntu 22.04
     - Docker + docker-compose 설치
     - Security Group: 80, 443, 22 포트 오픈
  3. **RDS** (선택): PostgreSQL 인스턴스 또는 EC2 내 Docker PostgreSQL
  4. **Route53**: 도메인 → EC2 Elastic IP 연결 (A record)
  5. **Traefik**: Let's Encrypt 자동 SSL 인증서 발급
     - Route53 DNS 챌린지 또는 HTTP 챌린지
  6. **IAM**: GitHub Actions용 배포 전용 유저 생성
     - ECR push 권한
     - 최소 권한 원칙 적용
- **의존성**: Task 8.2
- **완료 조건**: 가이드대로 따라하면 배포 완료되는 상태

### 배포 아키텍처
```
GitHub (main push)
    │
    ▼
GitHub Actions
    ├─ Build frontend image ──► ECR (frontend)
    └─ Build backend image  ──► ECR (backend)
                                    │
                                    ▼ docker pull
                              ┌──────────┐
                              │   EC2     │
                              │ ┌──────┐  │
Route53 ──► Elastic IP ──►   │ │Traefik│  │ :80/:443
                              │ └──┬───┘  │
                              │    │      │
                              │ ┌──▼───┐  │
                              │ │ nginx │  │ frontend (CSR)
                              │ └──────┘  │
                              │ ┌──────┐  │
                              │ │FastAPI│  │ backend API
                              │ └──────┘  │
                              │ ┌──────┐  │
                              │ │Postgres│ │ DB
                              │ └──────┘  │
                              └──────────┘
```

---

## Execution Order (Dependency Graph)

```
Phase 0 (Bootstrap)
  └─ Phase 1 (Auth)
       ├─ Phase 2 (Space)
       │    └─ Phase 3 (Task)
       │         ├─ Phase 4 (Journal)
       │         ├─ Phase 5 (AI Agent)
       │         │    └─ Phase 6 (Recommend Bot)
       │         └─ Phase 7 (Random Pick)
       └────────────────────────────────────┐
                                            │
Phase 8 (Deploy) ◄──────────────────────────┘
```

---

## Key Technical Decisions

| 결정 사항 | 선택 | 이유 |
|-----------|------|------|
| DB | PostgreSQL + JSONB | 정형(accounts, spaces) + 비정형(metadata) 동시 처리 |
| Auth | OAuth2 + JWT | Google/Kakao 지원, 서버리스 가능 |
| UI Library | Naive UI | Vue 3 네이티브, TypeScript 지원, 컴포넌트 풍부 |
| AI | OpenAI GPT API | Dual-agent debate 구현 용이 |
| Backend | FastAPI | 비동기, 타입 안전, AI 연동 편리 |
| 저널 명칭 | Journal | "하루 기록"의 의미를 담는 범용 용어 |
| CI/CD | GitHub Actions + ECR + EC2 | K8s 불필요, docker-compose 기반 단순 배포 |
| Deploy | EC2 + Traefik + Route53 | CSR SPA + API 서버 구조에 적합, 단일 EC2로 비용 절감 |

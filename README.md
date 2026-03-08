# Where You Go

여행/외출 목적지를 저장하고 스페이스 단위로 멤버와 공유하는 앱.

## Features

- **스페이스**: 멤버를 초대하여 목적지를 함께 관리
- **태스크**: 가고 싶은 장소를 우선순위와 메모와 함께 저장
- **저널**: 특정 날짜에 다녀온 장소들을 묶어 기록
- **AI 추천**: 듀얼 에이전트 토론 기반 코스 추천 (OpenAI GPT + 웹 검색)
- **행사 추천**: 전시회, 미식행사 등 최신 이벤트 추천
- **랜덤 뽑기**: 사다리 게임, 돌림판, 가위바위보로 목적지 선택

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | Vue 3 + TypeScript + Vite + Naive UI + Pinia |
| Backend | FastAPI (Python) |
| DB | PostgreSQL (JSONB) |
| Auth | 이메일/비밀번호 + 세션 쿠키 (Argon2) |
| AI | OpenAI GPT API (dual-agent debate) |
| Deploy | AWS EC2 + ECR + Traefik + GitHub Actions |

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm
- Python 3.11+
- Docker & Docker Compose

### 1. PostgreSQL 실행

```bash
sudo docker compose up -d db
```

### 2. Backend 실행

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # 환경변수 설정
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend 실행

```bash
cd frontend
pnpm install
pnpm dev --host
```

앱이 http://localhost:5173 에서 실행됩니다.

## Project Structure

```
where-you-go/
├── frontend/          # Vue 3 SPA
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
├── backend/           # FastAPI
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── core/
│   │   └── main.py
│   └── ...
└── docker-compose.yml
```

## License

Private

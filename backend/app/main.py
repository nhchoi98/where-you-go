from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.api import auth, spaces, tasks, journals, ai, recommend
from app.core.config import settings
from app.core.csrf import CSRFMiddleware
from app.core.database import engine, Base
from app.models import Account, Space, SpaceMember, Task, Journal  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(title="Where You Go API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SESSION_SECRET_KEY,
    max_age=settings.SESSION_MAX_AGE,
    same_site="lax",
    https_only=False,  # True in production
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(CSRFMiddleware)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(spaces.router, prefix="/api/spaces", tags=["spaces"])
app.include_router(tasks.router, prefix="/api", tags=["tasks"])
app.include_router(journals.router, prefix="/api", tags=["journals"])
app.include_router(ai.router, prefix="/api", tags=["ai"])
app.include_router(recommend.router, prefix="/api", tags=["recommend"])


@app.get("/api/health")
async def health():
    return {"status": "ok"}

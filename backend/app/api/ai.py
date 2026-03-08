from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.account import Account
from app.models.space import SpaceMember
from app.models.task import Task
from app.schemas.ai import AiSuggestRequest, AiOptionsResponse, AiDetailRequest, AiDetailResponse
from app.services.ai_agent import generate_options, detail_course

router = APIRouter()


async def _get_task_context(space_id: str, anchor_task_id: str, user_id, db: AsyncSession):
    """공통: 멤버 확인 + 태스크 컨텍스트 구성"""
    membership = await db.execute(
        select(SpaceMember).where(
            SpaceMember.space_id == space_id,
            SpaceMember.user_id == user_id,
        )
    )
    if not membership.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a member of this space")

    anchor_result = await db.execute(
        select(Task).where(Task.id == anchor_task_id, Task.space_id == space_id)
    )
    anchor_task = anchor_result.scalar_one_or_none()
    if not anchor_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Anchor task not found")

    all_tasks_result = await db.execute(
        select(Task).where(Task.space_id == space_id).order_by(Task.priority.desc())
    )
    all_tasks = all_tasks_result.scalars().all()

    tasks_context = "\n".join(
        f"- {t.title}{f' ({t.place_name})' if t.place_name else ''} (우선순위: {t.priority})" for t in all_tasks
    )
    anchor_label = anchor_task.title + (f" ({anchor_task.place_name})" if anchor_task.place_name else "")

    return tasks_context, anchor_label


@router.post("/spaces/{space_id}/ai/suggest", response_model=AiOptionsResponse)
async def ai_suggest(
    space_id: str,
    body: AiSuggestRequest,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Step 1: 전문가 3명이 코스 옵션 제안"""
    if not settings.OPENAI_API_KEY:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="OpenAI API key not configured")

    tasks_context, anchor_label = await _get_task_context(
        space_id, body.anchor_task_id, current_user.id, db
    )

    result = await generate_options(
        tasks_context=tasks_context,
        anchor_task=anchor_label,
        date_range=body.date_range,
    )

    return AiOptionsResponse(**result)


@router.post("/spaces/{space_id}/ai/detail", response_model=AiDetailResponse)
async def ai_detail(
    space_id: str,
    body: AiDetailRequest,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Step 2: 선택한 옵션 기반 상세 코스 생성"""
    if not settings.OPENAI_API_KEY:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="OpenAI API key not configured")

    tasks_context, anchor_label = await _get_task_context(
        space_id, body.anchor_task_id, current_user.id, db
    )

    detail = await detail_course(
        selected_summary=body.selected_summary,
        tasks_context=tasks_context,
        anchor_task=anchor_label,
        date_range=body.date_range,
    )

    return AiDetailResponse(detail=detail)

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.account import Account
from app.models.space import SpaceMember
from app.models.task import Task
from app.schemas.task import CreateTaskRequest, UpdateTaskRequest, TaskResponse

router = APIRouter()


async def _check_membership(space_id: str, user_id, db: AsyncSession):
    result = await db.execute(
        select(SpaceMember).where(
            SpaceMember.space_id == space_id,
            SpaceMember.user_id == user_id,
        )
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a member of this space")


@router.get("/spaces/{space_id}/tasks", response_model=list[TaskResponse])
async def list_tasks(
    space_id: str,
    priority: int | None = Query(default=None, ge=1, le=5),
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _check_membership(space_id, current_user.id, db)

    query = select(Task).where(Task.space_id == space_id)
    if priority is not None:
        query = query.where(Task.priority == priority)
    query = query.order_by(Task.priority.desc(), Task.created_at.desc())

    result = await db.execute(query)
    return result.scalars().all()


@router.post("/spaces/{space_id}/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    space_id: str,
    body: CreateTaskRequest,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _check_membership(space_id, current_user.id, db)

    task = Task(
        space_id=space_id,
        created_by=current_user.id,
        title=body.title,
        place_name=body.place_name,
        priority=body.priority,
        meta=body.metadata.model_dump(),
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


@router.put("/spaces/{space_id}/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    space_id: str,
    task_id: str,
    body: UpdateTaskRequest,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _check_membership(space_id, current_user.id, db)

    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.space_id == space_id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    if body.title is not None:
        task.title = body.title
    if body.place_name is not None:
        task.place_name = body.place_name
    if body.priority is not None:
        task.priority = body.priority
    if body.metadata is not None:
        task.meta = body.metadata.model_dump()

    await db.commit()
    await db.refresh(task)
    return task


@router.delete("/spaces/{space_id}/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    space_id: str,
    task_id: str,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _check_membership(space_id, current_user.id, db)

    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.space_id == space_id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    await db.delete(task)
    await db.commit()

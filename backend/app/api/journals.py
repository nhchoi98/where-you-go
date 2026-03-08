from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.account import Account
from app.models.space import SpaceMember
from app.models.journal import Journal
from app.schemas.journal import CreateJournalRequest, UpdateJournalRequest, JournalResponse

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


@router.get("/spaces/{space_id}/journals", response_model=list[JournalResponse])
async def list_journals(
    space_id: str,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _check_membership(space_id, current_user.id, db)

    result = await db.execute(
        select(Journal)
        .where(Journal.space_id == space_id)
        .order_by(Journal.date_from.desc())
    )
    return result.scalars().all()


@router.post("/spaces/{space_id}/journals", response_model=JournalResponse, status_code=status.HTTP_201_CREATED)
async def create_journal(
    space_id: str,
    body: CreateJournalRequest,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _check_membership(space_id, current_user.id, db)

    journal = Journal(
        space_id=space_id,
        created_by=current_user.id,
        title=body.title,
        date_from=body.date_from,
        date_to=body.date_to,
        task_ids=body.task_ids,
        meta=body.metadata.model_dump(),
    )
    db.add(journal)
    await db.commit()
    await db.refresh(journal)
    return journal


@router.get("/spaces/{space_id}/journals/{journal_id}", response_model=JournalResponse)
async def get_journal(
    space_id: str,
    journal_id: str,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _check_membership(space_id, current_user.id, db)

    result = await db.execute(
        select(Journal).where(Journal.id == journal_id, Journal.space_id == space_id)
    )
    journal = result.scalar_one_or_none()
    if not journal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Journal not found")
    return journal


@router.put("/spaces/{space_id}/journals/{journal_id}", response_model=JournalResponse)
async def update_journal(
    space_id: str,
    journal_id: str,
    body: UpdateJournalRequest,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _check_membership(space_id, current_user.id, db)

    result = await db.execute(
        select(Journal).where(Journal.id == journal_id, Journal.space_id == space_id)
    )
    journal = result.scalar_one_or_none()
    if not journal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Journal not found")

    if body.title is not None:
        journal.title = body.title
    if body.date_from is not None:
        journal.date_from = body.date_from
    if body.date_to is not None:
        journal.date_to = body.date_to
    if body.task_ids is not None:
        journal.task_ids = body.task_ids
    if body.metadata is not None:
        journal.meta = body.metadata.model_dump()

    await db.commit()
    await db.refresh(journal)
    return journal


@router.delete("/spaces/{space_id}/journals/{journal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_journal(
    space_id: str,
    journal_id: str,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _check_membership(space_id, current_user.id, db)

    result = await db.execute(
        select(Journal).where(Journal.id == journal_id, Journal.space_id == space_id)
    )
    journal = result.scalar_one_or_none()
    if not journal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Journal not found")

    await db.delete(journal)
    await db.commit()

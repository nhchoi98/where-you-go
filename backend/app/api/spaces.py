from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.account import Account
from app.models.space import Space, SpaceMember
from app.schemas.space import (
    CreateSpaceRequest,
    SpaceResponse,
    SpaceMemberResponse,
    SpaceDetailResponse,
    InviteMemberRequest,
)

router = APIRouter()


@router.get("", response_model=list[SpaceResponse])
async def list_spaces(
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """현재 유저가 속한 스페이스 목록"""
    result = await db.execute(
        select(Space)
        .join(SpaceMember, SpaceMember.space_id == Space.id)
        .where(SpaceMember.user_id == current_user.id)
        .order_by(Space.created_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=SpaceResponse, status_code=status.HTTP_201_CREATED)
async def create_space(
    body: CreateSpaceRequest,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """스페이스 생성 — 생성자는 자동으로 owner"""
    space = Space(
        name=body.name,
        description=body.description,
        created_by=current_user.id,
    )
    db.add(space)
    await db.flush()

    member = SpaceMember(
        space_id=space.id,
        user_id=current_user.id,
        role="owner",
    )
    db.add(member)
    await db.commit()
    await db.refresh(space)
    return space


@router.get("/{space_id}", response_model=SpaceDetailResponse)
async def get_space(
    space_id: str,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """스페이스 상세 + 멤버 목록"""
    # 멤버인지 확인
    membership = await db.execute(
        select(SpaceMember).where(
            SpaceMember.space_id == space_id,
            SpaceMember.user_id == current_user.id,
        )
    )
    if not membership.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a member of this space")

    space_result = await db.execute(select(Space).where(Space.id == space_id))
    space = space_result.scalar_one_or_none()
    if not space:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Space not found")

    members_result = await db.execute(
        select(SpaceMember, Account)
        .join(Account, Account.id == SpaceMember.user_id)
        .where(SpaceMember.space_id == space_id)
        .order_by(SpaceMember.joined_at)
    )
    rows = members_result.all()

    members = [
        SpaceMemberResponse(
            id=m.id,
            user_id=m.user_id,
            role=m.role,
            joined_at=m.joined_at,
            user_name=a.name,
            user_email=a.email,
        )
        for m, a in rows
    ]

    return SpaceDetailResponse(space=space, members=members)


@router.post("/{space_id}/invite", response_model=SpaceMemberResponse)
async def invite_member(
    space_id: str,
    body: InviteMemberRequest,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """멤버 초대 — owner만 가능"""
    # owner 확인
    ownership = await db.execute(
        select(SpaceMember).where(
            SpaceMember.space_id == space_id,
            SpaceMember.user_id == current_user.id,
            SpaceMember.role == "owner",
        )
    )
    if not ownership.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only owner can invite members")

    # 초대할 유저 조회
    user_result = await db.execute(select(Account).where(Account.email == body.email))
    target_user = user_result.scalar_one_or_none()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # 이미 멤버인지 확인
    existing = await db.execute(
        select(SpaceMember).where(
            SpaceMember.space_id == space_id,
            SpaceMember.user_id == target_user.id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already a member")

    member = SpaceMember(
        space_id=space_id,
        user_id=target_user.id,
        role="member",
    )
    db.add(member)
    await db.commit()
    await db.refresh(member)

    return SpaceMemberResponse(
        id=member.id,
        user_id=member.user_id,
        role=member.role,
        joined_at=member.joined_at,
        user_name=target_user.name,
        user_email=target_user.email,
    )

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.security import hash_password, verify_password
from app.models.account import Account
from app.schemas.auth import RegisterRequest, LoginRequest, UserResponse, MessageResponse

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(request: Request, body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Account).where(Account.email == body.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    account = Account(
        email=body.email,
        name=body.name,
        hashed_password=hash_password(body.password),
    )
    db.add(account)
    await db.commit()
    await db.refresh(account)

    request.session["user_id"] = str(account.id)
    return account


@router.post("/login", response_model=UserResponse)
async def login(request: Request, body: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Account).where(Account.email == body.email))
    account = result.scalar_one_or_none()

    if not account or not verify_password(body.password, account.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    request.session["user_id"] = str(account.id)
    return account


@router.post("/logout", response_model=MessageResponse)
async def logout(request: Request):
    request.session.clear()
    return MessageResponse(message="Logged out")


@router.get("/me", response_model=UserResponse)
async def me(current_user: Account = Depends(get_current_user)):
    return current_user

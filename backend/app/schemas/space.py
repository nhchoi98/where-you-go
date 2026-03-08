from uuid import UUID

from pydantic import BaseModel
from datetime import datetime


class CreateSpaceRequest(BaseModel):
    name: str
    description: str | None = None


class SpaceResponse(BaseModel):
    id: UUID
    name: str
    description: str | None
    created_by: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SpaceMemberResponse(BaseModel):
    id: UUID
    user_id: UUID
    role: str
    joined_at: datetime
    user_name: str | None = None
    user_email: str | None = None

    model_config = {"from_attributes": True}


class InviteMemberRequest(BaseModel):
    email: str


class SpaceDetailResponse(BaseModel):
    space: SpaceResponse
    members: list[SpaceMemberResponse]

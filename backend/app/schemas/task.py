from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime


class MetadataEntry(BaseModel):
    type: str  # memo | map_link | image (추후)
    content: str
    created_at: datetime | None = None


class TaskMetadata(BaseModel):
    entries: list[MetadataEntry] = []


class CreateTaskRequest(BaseModel):
    title: str
    place_name: str | None = None
    priority: int = Field(default=3, ge=1, le=5)
    metadata: TaskMetadata = TaskMetadata()


class UpdateTaskRequest(BaseModel):
    title: str | None = None
    place_name: str | None = None
    priority: int | None = Field(default=None, ge=1, le=5)
    metadata: TaskMetadata | None = None


class TaskResponse(BaseModel):
    id: UUID
    space_id: UUID
    created_by: UUID
    title: str
    place_name: str | None
    priority: int
    metadata: dict = Field(alias="meta")
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

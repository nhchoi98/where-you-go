from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict
from datetime import date, datetime


class JournalMetadataEntry(BaseModel):
    type: str  # memo | image (추후)
    content: str


class JournalMetadata(BaseModel):
    description: str | None = None
    review: str | None = None
    entries: list[JournalMetadataEntry] = []


class CreateJournalRequest(BaseModel):
    title: str
    date_from: date
    date_to: date
    task_ids: list[str] = []
    metadata: JournalMetadata = JournalMetadata()


class UpdateJournalRequest(BaseModel):
    title: str | None = None
    date_from: date | None = None
    date_to: date | None = None
    task_ids: list[str] | None = None
    metadata: JournalMetadata | None = None


class JournalResponse(BaseModel):
    id: UUID
    space_id: UUID
    created_by: UUID
    title: str
    date_from: date
    date_to: date
    task_ids: list[UUID]
    metadata: dict = Field(alias="meta")
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

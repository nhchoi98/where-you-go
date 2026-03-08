from pydantic import BaseModel


class AiSuggestRequest(BaseModel):
    anchor_task_id: str
    date_range: str | None = None


class AiOptionItem(BaseModel):
    key: str
    label: str
    summary: str


class AiOptionsResponse(BaseModel):
    options: list[AiOptionItem]


class AiDetailRequest(BaseModel):
    anchor_task_id: str
    date_range: str | None = None
    selected_key: str
    selected_summary: str


class AiDetailResponse(BaseModel):
    detail: str

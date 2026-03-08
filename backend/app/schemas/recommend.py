from pydantic import BaseModel


class RecommendRequest(BaseModel):
    category: str  # exhibition | food_event | coex | festival | popup
    location: str | None = None


class RecommendResponse(BaseModel):
    category: str
    result: str

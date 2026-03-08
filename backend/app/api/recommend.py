from fastapi import APIRouter, Depends, HTTPException, status

from app.core.config import settings
from app.core.deps import get_current_user
from app.models.account import Account
from app.schemas.recommend import RecommendRequest, RecommendResponse
from app.services.recommend_bot import recommend_events

router = APIRouter()


@router.post("/recommend/events", response_model=RecommendResponse)
async def get_recommendations(
    body: RecommendRequest,
    current_user: Account = Depends(get_current_user),
):
    if not settings.OPENAI_API_KEY:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="OpenAI API key not configured")

    result = await recommend_events(body.category, body.location)
    return RecommendResponse(category=body.category, result=result)

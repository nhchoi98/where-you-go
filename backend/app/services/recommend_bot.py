from datetime import date

from openai import AsyncOpenAI

from app.core.config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
MODEL = settings.OPENAI_MODEL

CATEGORIES = {
    "exhibition": "전시회",
    "food_event": "미식 행사 (푸드 페스티벌, 시음회 등)",
    "coex": "코엑스 행사",
    "festival": "축제 및 문화 행사",
    "popup": "팝업스토어",
}


async def recommend_events(category: str, location: str | None = None) -> str:
    category_name = CATEGORIES.get(category, category)
    location_context = f" {location} 주변에서" if location else " 서울/수도권에서"
    today = date.today().isoformat()

    instructions = (
        "너는 최신 행사/이벤트 추천 전문가야. "
        "웹 검색을 활용해서 현재 진행 중이거나 곧 열릴 실제 행사를 찾아 추천해줘. "
        f"오늘 날짜는 {today}이야. 반드시 {today} 기준으로 현재 진행 중이거나 앞으로 열릴 행사만 추천해. "
        "이미 종료된 행사는 절대 추천하지 마. "
        "각 행사에 대해 이름, 장소, 기간, 간단한 설명, 예상 비용, 공식 링크를 포함해줘. "
        "마크다운 형식으로 깔끔하게 작성해줘. "
        "한국어로 답변해."
    )

    user_prompt = (
        f"오늘 날짜: {today}\n"
        f"카테고리: {category_name}\n"
        f"위치:{location_context}\n\n"
        f"{today} 기준으로 현재 진행 중이거나 곧 열리는 {category_name} 관련 행사를 5개 이상 웹 검색해서 추천해줘. "
        "이미 종료된 행사는 제외해줘. "
        "각 항목마다 마크다운으로 아래 정보를 포함해줘:\n"
        "### 행사명\n"
        "- **장소**: \n- **기간**: \n- **설명**: \n- **예상 비용**: \n- **링크**: [공식 사이트](URL)\n"
    )

    response = await client.responses.create(
        model=MODEL,
        instructions=instructions,
        input=user_prompt,
        tools=[{"type": "web_search"}],
        max_output_tokens=2000,
    )
    return response.output_text or ""

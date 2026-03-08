import asyncio
import logging
from datetime import date

from openai import AsyncOpenAI

from app.core.config import settings

logger = logging.getLogger(__name__)

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
MODEL = settings.OPENAI_MODEL


async def _call_with_search(instructions: str, user_prompt: str) -> str:
    """Responses API + web_search 도구를 사용한 호출"""
    response = await client.responses.create(
        model=MODEL,
        instructions=instructions,
        input=user_prompt,
        tools=[{"type": "web_search"}],
        max_output_tokens=2000,
    )
    content = response.output_text or ""
    logger.info(f"GPT response (model={MODEL}): {content[:100]}...")
    return content


async def generate_options(
    tasks_context: str,
    anchor_task: str,
    date_range: str | None = None,
) -> dict:
    """
    Step 1: 전문가 A, B가 각각 맛집+카페+관광+체험 통합 코스를 독립 제안 (병렬)
    """
    today = date.today().isoformat()
    date_context = f"\n여행 기간: {date_range}" if date_range else ""

    date_constraint = (
        f"오늘 날짜는 {today}이야. "
        f"반드시 {today} 이후 기준으로 현재 운영 중인 장소와 행사만 추천해. "
        "폐업했거나 과거 정보는 절대 포함하지 마. "
        "웹 검색으로 반드시 최신 정보를 확인해. "
    )

    shared_instructions = (
        "너는 데이트/여행 코스 전문 플래너야. "
        + date_constraint
        + "맛집, 카페, 관광 명소, 체험 활동을 골고루 포함한 하루 코스를 짜줘. "
        "웹 검색으로 각 장소가 현재 영업/운영 중인지 확인하고, "
        "동선, 시간 배분, 식사 타이밍을 고려해서 시간순으로 구성해. "
        "한국어로 답변해."
    )

    shared_prompt = (
        f"⚠️ 오늘 날짜: {today} — 이 날짜 기준으로만 추천해줘.\n\n"
        f"가고 싶은 곳 목록:\n{tasks_context}\n\n"
        f"기준 장소: {anchor_task}{date_context}\n\n"
        "이 장소를 기준으로 맛집, 카페, 관광, 체험을 골고루 포함한 데이트/여행 코스를 웹 검색해서 만들어줘.\n\n"
        "마크다운으로 아래 형식을 따라줘:\n"
        "## 코스 제목\n"
        "한 줄 컨셉 요약\n\n"
        "### 1. 장소명 (카테고리)\n"
        "- 예상 시간: HH:MM ~ HH:MM\n"
        "- 한 줄 설명\n"
        "- 예상 비용: X원\n\n"
        "(4~6개 장소)\n\n"
        "---\n"
        "**총 예상 시간**: X시간 | **총 예상 비용**: 약 X원"
    )

    # 같은 질문, 같은 역할 — 독립 실행으로 다른 결과
    plan_a, plan_b = await asyncio.gather(
        _call_with_search(shared_instructions, shared_prompt),
        _call_with_search(shared_instructions, shared_prompt),
    )

    return {
        "options": [
            {"key": "A", "label": "플랜 A", "summary": plan_a},
            {"key": "B", "label": "플랜 B", "summary": plan_b},
        ]
    }


async def detail_course(
    selected_summary: str,
    tasks_context: str,
    anchor_task: str,
    date_range: str | None = None,
) -> str:
    """
    Step 2: 유저가 선택한 플랜을 기반으로 상세 코스 생성
    """
    today = date.today().isoformat()
    date_context = f"\n여행 기간: {date_range}" if date_range else ""

    instructions = (
        "너는 데이트/여행 코스 종합 플래너야. "
        f"오늘 날짜는 {today}이야. 반드시 현재 기준 최신 정보만 사용해. "
        "유저가 선택한 코스를 기반으로 구체적인 일정을 만들어줘. "
        "웹 검색으로 각 장소의 영업시간, 가격, 예약 정보 등을 확인해. "
        "마크다운 형식으로 깔끔하게 작성해줘. "
        "한국어로 답변해."
    )

    prompt = (
        f"⚠️ 오늘 날짜: {today}\n\n"
        f"가고 싶은 곳 목록:\n{tasks_context}\n\n"
        f"기준 장소: {anchor_task}{date_context}\n\n"
        f"유저가 선택한 코스:\n{selected_summary}\n\n"
        "이 코스를 기반으로 구체적인 일정을 만들어줘. 각 장소에 대해:\n"
        "- 추천 방문 시간대\n"
        "- 상세 주소 (웹 검색)\n"
        "- 영업시간 (웹 검색으로 확인)\n"
        "- 추천 메뉴 또는 활동\n"
        "- 예상 비용\n"
        "- 다음 장소로의 이동 방법과 소요시간\n"
        "- 예약 필요 여부\n"
        "- 팁 (웨이팅, 주차, 꿀팁 등)\n\n"
        "마지막에 **총 예상 소요시간**과 **총 예상 예산**을 정리해줘."
    )

    return await _call_with_search(instructions, prompt)

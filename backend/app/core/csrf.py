from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings

SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}


class CSRFMiddleware(BaseHTTPMiddleware):
    """
    Origin 헤더 검증으로 CSRF 방지.
    state-changing 요청(POST/PUT/DELETE 등)에서
    Origin 또는 Referer가 허용된 도메인인지 확인.
    """

    async def dispatch(self, request: Request, call_next):
        if request.method in SAFE_METHODS:
            return await call_next(request)

        origin = request.headers.get("origin")
        referer = request.headers.get("referer")
        allowed = settings.CORS_ORIGINS.split(",")

        # Origin 헤더가 있으면 검증
        if origin:
            if origin not in allowed:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="CSRF: Origin not allowed",
                )
            return await call_next(request)

        # Origin 없으면 Referer로 검증
        if referer:
            if any(referer.startswith(o) for o in allowed):
                return await call_next(request)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="CSRF: Referer not allowed",
            )

        # curl 등 직접 호출은 허용 (Origin/Referer 둘 다 없음)
        return await call_next(request)

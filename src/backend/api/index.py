import fastapi as _fastapi
import traceback as _traceback

# Fallback app — always defined at top level so Vercel's static analyser is satisfied.
app = _fastapi.FastAPI()

try:
    from app.main import app as _real_app  # type: ignore[assignment]
    app = _real_app
except Exception:
    _err = _traceback.format_exc()

    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    async def _boot_error(path: str = "") -> _fastapi.responses.PlainTextResponse:
        return _fastapi.responses.PlainTextResponse(_err, status_code=500)

__all__ = ["app"]


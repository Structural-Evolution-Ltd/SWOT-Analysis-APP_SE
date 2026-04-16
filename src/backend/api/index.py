import traceback

try:
    from app.main import app
except Exception:
    import fastapi
    from fastapi.responses import PlainTextResponse

    _error = traceback.format_exc()
    app = fastapi.FastAPI()

    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    def _import_error(path: str = ""):
        return PlainTextResponse(_error, status_code=500)

__all__ = ["app"]

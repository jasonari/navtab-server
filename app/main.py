import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHttpException

from app.config import settings
from app.database import close_database_pool, create_database_pool
from app.errors import ApiError
from app.logging_config import configure_logging
from app.routers import auth, uploads, users


configure_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(application: FastAPI) -> AsyncIterator[None]:
    settings.upload_directory.mkdir(parents=True, exist_ok=True)
    database_pool = await create_database_pool(settings)
    application.state.database_pool = database_pool
    try:
        yield
    finally:
        await close_database_pool(database_pool)


app = FastAPI(
    title="NavTab Server",
    version="0.2.0",
    lifespan=lifespan,
)


@app.middleware("http")
async def reject_oversized_request(request: Request, call_next):
    content_length_header = request.headers.get("content-length")
    if content_length_header is not None:
        try:
            content_length = int(content_length_header)
        except ValueError:
            content_length = 0

        request_body_limit = (
            settings.upload_request_max_bytes
            if request.url.path in {"/upload", "/upload/"}
            else settings.request_body_max_bytes
        )
        if content_length > request_body_limit:
            return JSONResponse(
                status_code=413,
                content={
                    "code": 413,
                    "message": "Request body is too large",
                    "data": {},
                },
            )

    return await call_next(request)


@app.middleware("http")
async def log_http_request(request: Request, call_next):
    logger.info("HTTP %s %s", request.method, request.url.path)
    return await call_next(request)


@app.exception_handler(ApiError)
async def api_error_handler(request: Request, error: ApiError) -> JSONResponse:
    return JSONResponse(
        status_code=error.status_code,
        content={
            "code": error.status_code,
            "message": error.message,
            "data": {},
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_error_handler(
    request: Request,
    error: RequestValidationError,
) -> JSONResponse:
    logger.warning("Invalid request: %s", error)
    return JSONResponse(
        status_code=400,
        content={"code": 400, "message": "Invalid request", "data": {}},
    )


@app.exception_handler(StarletteHttpException)
async def http_error_handler(
    request: Request,
    error: StarletteHttpException,
):
    if error.status_code == 404:
        logger.warning("404 Not Found: %s %s", request.method, request.url.path)
        return PlainTextResponse("404 Not Found", status_code=404)

    return JSONResponse(
        status_code=error.status_code,
        content={
            "code": error.status_code,
            "message": str(error.detail),
            "data": {},
        },
    )


@app.exception_handler(Exception)
async def unhandled_error_handler(request: Request, error: Exception):
    logger.error(
        "Unhandled server error",
        exc_info=(type(error), error, error.__traceback__),
    )
    return PlainTextResponse("Server Error", status_code=500)


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(uploads.router)
app.mount(
    "/",
    StaticFiles(directory=settings.public_directory, check_dir=False),
    name="public",
)

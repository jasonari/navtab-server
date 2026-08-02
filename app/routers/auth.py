import logging

from asyncmy.errors import OperationalError
from fastapi import APIRouter, Depends

from app.dependencies import (
    DatabasePool,
    parse_credentials_request,
    parse_refresh_token_request,
)
from app.errors import ApiError
from app.schemas import (
    CREDENTIALS_REQUEST_OPENAPI,
    REFRESH_TOKEN_REQUEST_OPENAPI,
    CredentialsRequest,
    RefreshTokenRequest,
)
from app.services import auth as auth_service


logger = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "/user/register",
    status_code=201,
    openapi_extra=CREDENTIALS_REQUEST_OPENAPI,
)
async def register_user(
    pool: DatabasePool,
    credentials: CredentialsRequest = Depends(parse_credentials_request),
) -> dict:
    try:
        tokens = await auth_service.register_user(
            pool,
            credentials.username,
            credentials.password,
        )
    except Exception as error:
        logger.error("Failed to register user %s: %s", credentials.username, error)
        raise ApiError(400, f"Failed to create: {error}") from error

    logger.info("Registered user: %s", credentials.username)
    return {"code": 200, "message": "Created", "data": tokens}


@router.post("/user/login", openapi_extra=CREDENTIALS_REQUEST_OPENAPI)
async def login_user(
    pool: DatabasePool,
    credentials: CredentialsRequest = Depends(parse_credentials_request),
) -> dict:
    try:
        tokens = await auth_service.login_user(
            pool,
            credentials.username,
            credentials.password,
        )
    except OperationalError as error:
        logger.error("Database connection failed during login: %s", error)
        raise ApiError(500, f"Failed to login: {error}") from error
    except Exception as error:
        logger.error("Failed to login user %s: %s", credentials.username, error)
        raise ApiError(400, f"Failed to login: {error}") from error

    logger.info("Logged in user: %s", credentials.username)
    return {"code": 200, "message": "OK", "data": tokens}


@router.post(
    "/auth/refreshToken",
    openapi_extra=REFRESH_TOKEN_REQUEST_OPENAPI,
)
async def refresh_tokens(
    pool: DatabasePool,
    token_request: RefreshTokenRequest = Depends(parse_refresh_token_request),
) -> dict:
    try:
        tokens = await auth_service.refresh_user_tokens(
            pool,
            token_request.refresh_token,
        )
    except Exception as error:
        logger.error("Failed to refresh token: %s", error)
        raise ApiError(400, f"Failed to refresh token: {error}") from error

    logger.info("Refreshed token")
    return {"code": 200, "message": "OK", "data": tokens}

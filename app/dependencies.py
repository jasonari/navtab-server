from typing import Annotated, Any, TypeVar

from asyncmy.pool import Pool
from fastapi import Depends, Header, Request
from pydantic import BaseModel, ValidationError

from app.errors import ApiError
from app.schemas import (
    CredentialsRequest,
    RefreshTokenRequest,
    SetBookmarkListRequest,
    TokenPayload,
)
from app.security import verify_access_token


RequestModel = TypeVar("RequestModel", bound=BaseModel)


def get_database_pool(request: Request) -> Pool:
    return request.app.state.database_pool


async def get_current_token_payload(
    authorization: Annotated[str | None, Header()] = None,
) -> TokenPayload:
    access_token = authorization.replace("Bearer ", "", 1) if authorization else ""
    if access_token == "":
        raise ApiError(401, "Invaild token")

    try:
        return verify_access_token(access_token)
    except ValueError as error:
        raise ApiError(401, str(error)) from error


async def parse_credentials_request(request: Request) -> CredentialsRequest:
    return await parse_request_model(request, CredentialsRequest)


async def parse_refresh_token_request(request: Request) -> RefreshTokenRequest:
    return await parse_request_model(request, RefreshTokenRequest)


async def parse_bookmark_list_request(request: Request) -> SetBookmarkListRequest:
    return await parse_request_model(request, SetBookmarkListRequest)


async def parse_request_model(
    request: Request,
    model: type[RequestModel],
) -> RequestModel:
    try:
        request_payload = await read_request_payload(request)
        return model.model_validate(request_payload)
    except (TypeError, ValueError, ValidationError) as error:
        raise ApiError(400, "Invalid request") from error


async def read_request_payload(request: Request) -> dict[str, Any]:
    content_type = request.headers.get("content-type", "").lower()
    if "application/x-www-form-urlencoded" in content_type:
        form_data = await request.form()
        return dict(form_data)

    request_payload = await request.json()
    if not isinstance(request_payload, dict):
        raise TypeError("Request body must be an object")
    return request_payload


DatabasePool = Annotated[Pool, Depends(get_database_pool)]
CurrentTokenPayload = Annotated[
    TokenPayload,
    Depends(get_current_token_payload),
]


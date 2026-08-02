from typing import Any

from pydantic import BaseModel, Field


class CredentialsRequest(BaseModel):
    username: str
    password: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(alias="refreshToken")


class SetBookmarkListRequest(BaseModel):
    bookmark_list: Any = Field(alias="bookmarkList")


class TokenPayload(BaseModel):
    uid: str | int
    username: str


def create_request_body_openapi(model: type[BaseModel]) -> dict:
    request_schema = model.model_json_schema(by_alias=True)
    return {
        "requestBody": {
            "required": True,
            "content": {
                "application/json": {"schema": request_schema},
                "application/x-www-form-urlencoded": {"schema": request_schema},
            },
        }
    }


CREDENTIALS_REQUEST_OPENAPI = create_request_body_openapi(CredentialsRequest)
REFRESH_TOKEN_REQUEST_OPENAPI = create_request_body_openapi(RefreshTokenRequest)
BOOKMARK_LIST_REQUEST_OPENAPI = create_request_body_openapi(SetBookmarkListRequest)

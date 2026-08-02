import logging

from fastapi import APIRouter, Depends

from app.dependencies import (
    CurrentTokenPayload,
    DatabasePool,
    parse_bookmark_list_request,
)
from app.errors import ApiError
from app.schemas import BOOKMARK_LIST_REQUEST_OPENAPI, SetBookmarkListRequest
from app.services import users as user_service


logger = logging.getLogger(__name__)
router = APIRouter(prefix="/user")


@router.get("/getBookmarkList")
async def get_bookmark_list(
    pool: DatabasePool,
    token_payload: CurrentTokenPayload,
) -> dict:
    try:
        bookmark_list = await user_service.get_bookmark_list(
            pool,
            token_payload.username,
        )
    except Exception as error:
        logger.error(
            "Failed to get bookmark list for %s: %s",
            token_payload.username,
            error,
        )
        raise ApiError(400, str(error)) from error

    logger.info("Read bookmark list for: %s", token_payload.username)
    return {
        "code": 200,
        "message": "OK",
        "data": {"bookmarkList": bookmark_list},
    }


@router.post(
    "/setBookmarkList",
    status_code=201,
    openapi_extra=BOOKMARK_LIST_REQUEST_OPENAPI,
)
async def set_bookmark_list(
    pool: DatabasePool,
    token_payload: CurrentTokenPayload,
    bookmark_request: SetBookmarkListRequest = Depends(
        parse_bookmark_list_request
    ),
) -> dict:
    try:
        await user_service.set_bookmark_list(
            pool,
            token_payload.username,
            bookmark_request.bookmark_list,
        )
    except Exception as error:
        logger.error(
            "Failed to set bookmark list for %s: %s",
            token_payload.username,
            error,
        )
        raise ApiError(400, str(error)) from error

    logger.info("Updated bookmark list for: %s", token_payload.username)
    return {"code": 201, "message": "Created", "data": {}}

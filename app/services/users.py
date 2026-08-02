import json
from typing import Any

from asyncmy.pool import Pool

from app.repositories import users as user_repository


async def set_bookmark_list(
    pool: Pool,
    username: str,
    bookmark_list: Any,
) -> None:
    if username == "" or bookmark_list_is_invalid(bookmark_list):
        raise ValueError("BookmarkList invalid")

    bookmark_list_json = json.dumps(bookmark_list, ensure_ascii=False)
    await user_repository.update_bookmark_list_by_username(
        pool,
        username,
        bookmark_list_json,
    )


async def get_bookmark_list(pool: Pool, username: str) -> Any:
    return await user_repository.get_bookmark_list_by_username(
        pool,
        username,
    )


def bookmark_list_is_invalid(bookmark_list: Any) -> bool:
    return (
        bookmark_list is None
        or bookmark_list is False
        or bookmark_list == ""
        or bookmark_list == 0
    )

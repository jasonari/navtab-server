import json
from typing import Any

from asyncmy.constants import FIELD_TYPE
from asyncmy.cursors import DictCursor
from asyncmy.pool import Pool


async def create_user(
    pool: Pool,
    uid: str,
    username: str,
    password: str,
    bookmark_list: str,
) -> None:
    async with pool.acquire() as connection:
        async with connection.cursor() as cursor:
            await cursor.execute(
                "INSERT INTO user_data "
                "(uid, username, password, bookmark_list) VALUES (%s, %s, %s, %s)",
                (uid, username, password, bookmark_list),
            )


async def get_user_by_username(
    pool: Pool,
    username: str,
) -> dict[str, Any] | None:
    async with pool.acquire() as connection:
        async with connection.cursor(DictCursor) as cursor:
            await cursor.execute(
                "SELECT * FROM user_data WHERE username = %s",
                (username,),
            )
            return await cursor.fetchone()


async def update_password_by_username(
    pool: Pool,
    username: str,
    password: str,
) -> None:
    async with pool.acquire() as connection:
        async with connection.cursor() as cursor:
            await cursor.execute(
                "UPDATE user_data SET password = %s WHERE username = %s",
                (password, username),
            )


async def update_bookmark_list_by_username(
    pool: Pool,
    username: str,
    bookmark_list: str,
) -> None:
    async with pool.acquire() as connection:
        async with connection.cursor() as cursor:
            await cursor.execute(
                "UPDATE user_data SET bookmark_list = %s WHERE username = %s",
                (bookmark_list, username),
            )


async def get_bookmark_list_by_username(pool: Pool, username: str) -> Any:
    async with pool.acquire() as connection:
        async with connection.cursor(DictCursor) as cursor:
            await cursor.execute(
                "SELECT bookmark_list FROM user_data WHERE username = %s",
                (username,),
            )
            row = await cursor.fetchone()
            bookmark_list_field_type = cursor.description[0][1]

    if row is None:
        raise ValueError("User not found")
    return deserialize_bookmark_list(
        row["bookmark_list"],
        bookmark_list_field_type,
    )


def deserialize_bookmark_list(bookmark_list: Any, field_type: int) -> Any:
    if field_type != FIELD_TYPE.JSON or not isinstance(
        bookmark_list,
        (str, bytes, bytearray),
    ):
        return bookmark_list

    try:
        return json.loads(bookmark_list)
    except (UnicodeDecodeError, json.JSONDecodeError):
        return bookmark_list

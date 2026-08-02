import asyncio
import json
from typing import Any
from uuid import uuid4

from asyncmy.pool import Pool

from app.defaults import DEFAULT_BOOKMARK_LIST
from app.repositories import users as user_repository
from app.security import (
    generate_token_pair,
    hash_password,
    password_needs_upgrade,
    verify_password,
    verify_refresh_token,
)


PASSWORD_OPERATION_SEMAPHORE = asyncio.Semaphore(2)


async def register_user(
    pool: Pool,
    username: str,
    password: str,
) -> dict[str, str]:
    uid = str(uuid4())
    password_hash = await hash_password_without_blocking(password)
    await user_repository.create_user(
        pool=pool,
        uid=uid,
        username=username,
        password=password_hash,
        bookmark_list=json.dumps(DEFAULT_BOOKMARK_LIST, ensure_ascii=False),
    )
    registered_user = await get_user_allowed_to_receive_tokens(pool, username)
    return generate_token_pair(registered_user["uid"], username)


async def login_user(
    pool: Pool,
    username: str,
    password: str,
) -> dict[str, str]:
    user = await user_repository.get_user_by_username(pool, username)
    if user is None:
        raise ValueError("User not found")

    stored_password = str(user["password"])
    password_matches = await verify_password_without_blocking(
        password,
        stored_password,
    )
    if not password_matches:
        raise ValueError("Wrong password")
    if user.get("is_banned") == 1:
        raise ValueError("User is Banned")

    needs_password_upgrade = await password_needs_upgrade_without_blocking(
        stored_password
    )
    if needs_password_upgrade:
        await user_repository.update_password_by_username(
            pool,
            username,
            await hash_password_without_blocking(password),
        )

    return generate_token_pair(user["uid"], username)


async def refresh_user_tokens(
    pool: Pool,
    refresh_token: str,
) -> dict[str, str]:
    token_payload = verify_refresh_token(refresh_token)
    await get_user_allowed_to_receive_tokens(pool, token_payload.username)
    return generate_token_pair(token_payload.uid, token_payload.username)


async def get_user_allowed_to_receive_tokens(
    pool: Pool,
    username: str,
) -> dict[str, Any]:
    user = await user_repository.get_user_by_username(pool, username)
    if user is None:
        raise ValueError("User not found")
    if user.get("is_banned") == 1:
        raise ValueError("User is Banned")
    return user


async def hash_password_without_blocking(password: str) -> str:
    async with PASSWORD_OPERATION_SEMAPHORE:
        return await asyncio.to_thread(hash_password, password)


async def verify_password_without_blocking(
    password: str,
    stored_password: str,
) -> bool:
    async with PASSWORD_OPERATION_SEMAPHORE:
        return await asyncio.to_thread(verify_password, password, stored_password)


async def password_needs_upgrade_without_blocking(stored_password: str) -> bool:
    async with PASSWORD_OPERATION_SEMAPHORE:
        return await asyncio.to_thread(password_needs_upgrade, stored_password)

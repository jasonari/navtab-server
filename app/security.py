import hashlib
import hmac
import re
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError
from pydantic import ValidationError

from app.config import settings
from app.schemas import TokenPayload


JWT_ALGORITHM = "HS256"
LEGACY_MD5_PATTERN = re.compile(r"^[0-9a-f]{32}$")
password_hasher = PasswordHasher()


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(password: str, stored_password: str) -> bool:
    if password_uses_legacy_md5(stored_password):
        password_md5 = hashlib.md5(password.encode("utf-8")).hexdigest()
        return hmac.compare_digest(password_md5, stored_password)

    try:
        return password_hasher.verify(stored_password, password)
    except (InvalidHashError, VerificationError, VerifyMismatchError):
        return False


def password_needs_upgrade(stored_password: str) -> bool:
    if password_uses_legacy_md5(stored_password):
        return True

    try:
        return password_hasher.check_needs_rehash(stored_password)
    except InvalidHashError:
        return False


def password_uses_legacy_md5(stored_password: str) -> bool:
    return LEGACY_MD5_PATTERN.fullmatch(stored_password) is not None


def generate_token_pair(uid: str | int, username: str) -> dict[str, str]:
    issued_at = datetime.now(timezone.utc)
    token_payload: dict[str, Any] = {
        "uid": uid,
        "username": username,
        "iat": issued_at,
    }
    access_token = jwt.encode(
        {
            **token_payload,
            "exp": issued_at
            + timedelta(minutes=settings.access_token_expire_minutes),
        },
        settings.access_token_secret.get_secret_value(),
        algorithm=JWT_ALGORITHM,
    )
    refresh_token = jwt.encode(
        {
            **token_payload,
            "exp": issued_at + timedelta(days=settings.refresh_token_expire_days),
        },
        settings.refresh_token_secret.get_secret_value(),
        algorithm=JWT_ALGORITHM,
    )
    return {"accessToken": access_token, "refreshToken": refresh_token}


def verify_access_token(token: str) -> TokenPayload:
    return verify_token(
        token,
        settings.access_token_secret.get_secret_value(),
        "Invalid access-token",
    )


def verify_refresh_token(token: str) -> TokenPayload:
    return verify_token(
        token,
        settings.refresh_token_secret.get_secret_value(),
        "Invalid refresh-token",
    )


def verify_token(token: str, secret: str, error_message: str) -> TokenPayload:
    try:
        decoded_payload = jwt.decode(token, secret, algorithms=[JWT_ALGORITHM])
        return TokenPayload.model_validate(decoded_payload)
    except (jwt.InvalidTokenError, ValidationError) as error:
        raise ValueError(error_message) from error


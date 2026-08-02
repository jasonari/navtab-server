from asyncmy import create_pool
from asyncmy.pool import Pool

from app.config import Settings


async def create_database_pool(settings: Settings) -> Pool:
    return await create_pool(
        host=settings.db_host,
        port=settings.db_port,
        user=settings.db_user,
        password=settings.db_password.get_secret_value(),
        db=settings.db_name,
        minsize=settings.db_pool_min_size,
        maxsize=settings.db_pool_max_size,
        autocommit=True,
        charset="utf8mb4",
        pool_recycle=3600,
    )


async def close_database_pool(pool: Pool) -> None:
    pool.close()
    await pool.wait_closed()


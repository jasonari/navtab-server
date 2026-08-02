import uvicorn

from app.config import settings


def run_server() -> None:
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
    )


if __name__ == "__main__":
    run_server()


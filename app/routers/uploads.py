import logging
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, UploadFile

from app.config import settings
from app.errors import ApiError


logger = logging.getLogger(__name__)
router = APIRouter(prefix="/upload")

ALLOWED_IMAGE_EXTENSIONS = {".gif", ".jpeg", ".jpg", ".png"}
ALLOWED_IMAGE_CONTENT_TYPES = {
    "image/gif",
    "image/jpeg",
    "image/jpg",
    "image/png",
}
UPLOAD_CHUNK_SIZE = 1024 * 1024


@router.post("", status_code=201, include_in_schema=False)
@router.post("/", status_code=201)
async def upload_image(image: UploadFile | None = File(default=None)) -> dict:
    if image is None:
        raise ApiError(400, "No file uploaded")

    filename = image.filename or ""
    file_extension = Path(filename).suffix.lower()
    if (
        file_extension not in ALLOWED_IMAGE_EXTENSIONS
        or image.content_type not in ALLOWED_IMAGE_CONTENT_TYPES
    ):
        await image.close()
        raise ApiError(400, "Only images are allowed")

    stored_filename = f"{uuid4().hex}{file_extension}"
    stored_file_path = settings.upload_directory / stored_filename
    uploaded_bytes = 0

    try:
        with stored_file_path.open("xb") as stored_file:
            while upload_chunk := await image.read(UPLOAD_CHUNK_SIZE):
                uploaded_bytes += len(upload_chunk)
                if uploaded_bytes > settings.upload_max_bytes:
                    raise ApiError(400, "File is too large")
                stored_file.write(upload_chunk)
    except Exception:
        stored_file_path.unlink(missing_ok=True)
        raise
    finally:
        await image.close()

    logger.info("Uploaded image: %s", stored_filename)
    return {
        "code": 201,
        "message": "Created",
        "data": {"imagePath": f"/images/{stored_filename}"},
    }

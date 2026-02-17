"""Raw YAML read/write endpoints for direct editing."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from zoo.config import get_settings

router = APIRouter(prefix="/api/raw", tags=["raw"])


class RawYaml(BaseModel):
    content: str


@router.get("/{filename}")
def get_raw(filename: str) -> RawYaml:
    path = get_settings().configs_dir / filename
    if not path.is_file():
        raise HTTPException(404, f"Config not found: {filename}")
    return RawYaml(content=path.read_text())


@router.put("/{filename}")
def put_raw(filename: str, body: RawYaml) -> RawYaml:
    path = get_settings().configs_dir / filename
    path.write_text(body.content)
    return RawYaml(content=path.read_text())

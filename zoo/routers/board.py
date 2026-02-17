"""Board config API endpoints — thin layer over PANDA_CORE board schema."""

from typing import Any, Dict

from board.yaml_schema import BoardYamlSchema
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from zoo.config import ZooSettings
from zoo.services.yaml_io import list_configs, read_yaml, write_yaml

router = APIRouter(prefix="/api/board", tags=["board"])
settings = ZooSettings()
configs_dir = settings.panda_core_path / "configs"


# ── Response models (API shape only) ──────────────────────────────────


class BoardResponse(BaseModel):
    filename: str
    instruments: Dict[str, Dict[str, Any]]


# ── Routes ─────────────────────────────────────────────────────────────


@router.get("/configs")
def list_board_configs() -> list[str]:
    return list_configs(configs_dir, "board")


@router.get("/{filename}")
def get_board(filename: str) -> BoardResponse:
    path = configs_dir / filename
    if not path.is_file():
        raise HTTPException(404, f"Config not found: {filename}")

    raw = read_yaml(path)
    # Validate through PANDA_CORE's schema.
    try:
        BoardYamlSchema.model_validate(raw)
    except Exception as e:
        raise HTTPException(400, str(e))

    instruments = {
        name: entry
        for name, entry in raw.get("instruments", {}).items()
    }
    return BoardResponse(filename=filename, instruments=instruments)


@router.put("/{filename}")
def put_board(filename: str, body: dict) -> BoardResponse:
    path = configs_dir / filename
    write_yaml(path, body)
    return get_board(filename)

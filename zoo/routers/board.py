"""Board config API endpoints."""

from fastapi import APIRouter, HTTPException

from zoo.config import ZooSettings
from zoo.models.board import BoardConfig, BoardResponse
from zoo.services.yaml_io import list_configs, read_yaml, write_yaml

router = APIRouter(prefix="/api/board", tags=["board"])
settings = ZooSettings()
configs_dir = settings.panda_core_path / "configs"


@router.get("/configs")
def list_board_configs() -> list[str]:
    return list_configs(configs_dir, "board")


@router.get("/{filename}")
def get_board(filename: str) -> BoardResponse:
    path = configs_dir / filename
    if not path.is_file():
        raise HTTPException(404, f"Config not found: {filename}")
    data = read_yaml(path)
    board = BoardConfig.model_validate(data)
    return BoardResponse(filename=filename, instruments=board.instruments)


@router.put("/{filename}")
def put_board(filename: str, body: BoardConfig) -> BoardResponse:
    path = configs_dir / filename
    write_yaml(path, body.model_dump())
    return get_board(filename)

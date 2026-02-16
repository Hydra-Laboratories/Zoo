"""Gantry config + position API endpoints."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from zoo.config import ZooSettings
from zoo.models.gantry import GantryConfig, GantryPosition, GantryResponse
from zoo.services.grbl_status import grbl_poller
from zoo.services.yaml_io import list_configs, read_yaml, write_yaml

router = APIRouter(prefix="/api/gantry", tags=["gantry"])
settings = ZooSettings()
configs_dir = settings.panda_core_path / "configs"


@router.get("/configs")
def list_gantry_configs() -> list[str]:
    return list_configs(configs_dir, "gantry")


@router.get("/position")
def get_position() -> GantryPosition:
    return grbl_poller.get_position()


class ConnectRequest(BaseModel):
    port: str
    baudrate: int = 115200


@router.post("/connect")
def connect(req: ConnectRequest) -> GantryPosition:
    try:
        grbl_poller.connect(req.port, req.baudrate)
    except Exception as e:
        raise HTTPException(500, f"Failed to connect: {e}")
    return grbl_poller.get_position()


@router.post("/disconnect")
def disconnect() -> GantryPosition:
    grbl_poller.disconnect()
    return GantryPosition(connected=False, status="Disconnected")


@router.get("/{filename}")
def get_gantry(filename: str) -> GantryResponse:
    path = configs_dir / filename
    if not path.is_file():
        raise HTTPException(404, f"Config not found: {filename}")
    data = read_yaml(path)
    config = GantryConfig.model_validate(data)
    return GantryResponse(filename=filename, config=config)


@router.put("/{filename}")
def put_gantry(filename: str, body: GantryConfig) -> GantryResponse:
    path = configs_dir / filename
    write_yaml(path, body.model_dump(exclude_none=True))
    return get_gantry(filename)

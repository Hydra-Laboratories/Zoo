"""Gantry config + position API endpoints."""

from typing import Optional

from fastapi import APIRouter, HTTPException
from gantry import Gantry
from pydantic import BaseModel

from zoo.config import get_settings
from zoo.models.gantry import GantryConfig, GantryPosition, GantryResponse
from zoo.services.yaml_io import list_configs, read_yaml, resolve_config_path, write_yaml

router = APIRouter(prefix="/api/gantry", tags=["gantry"])

# Single Gantry instance shared across requests.
_gantry: Optional[Gantry] = None


@router.get("/configs")
def list_gantry_configs() -> list[str]:
    return list_configs(get_settings().configs_dir, "gantry")


@router.get("/position")
def get_position() -> GantryPosition:
    if _gantry is None or not _gantry.is_healthy():
        return GantryPosition(connected=False, status="Not connected")
    try:
        info = _gantry.get_position_info()
        coords = info["coords"]
        wpos = info["work_pos"]
        return GantryPosition(
            x=coords["x"],
            y=coords["y"],
            z=coords["z"],
            work_x=wpos["x"] if wpos else None,
            work_y=wpos["y"] if wpos else None,
            work_z=wpos["z"] if wpos else None,
            status=info["status"],
            connected=True,
        )
    except Exception:
        return GantryPosition(connected=False, status="Connection lost")


@router.post("/home")
def home() -> GantryPosition:
    """Home the gantry using PANDA_CORE Gantry.home."""
    if _gantry is None or not _gantry.is_healthy():
        raise HTTPException(400, "Gantry not connected")
    try:
        _gantry.home()
    except Exception as e:
        raise HTTPException(500, f"Homing failed: {e}")
    return get_position()


class JogRequest(BaseModel):
    x: float = 0.0
    y: float = 0.0
    z: float = 0.0


@router.post("/jog")
def jog(req: JogRequest) -> GantryPosition:
    """Move the gantry by a relative offset using PANDA_CORE Gantry.move_to."""
    if _gantry is None or not _gantry.is_healthy():
        raise HTTPException(400, "Gantry not connected")
    if req.x == 0 and req.y == 0 and req.z == 0:
        return get_position()
    try:
        coords = _gantry.get_coordinates()
        _gantry.move_to(
            x=coords["x"] + req.x,
            y=coords["y"] + req.y,
            z=coords["z"] + req.z,
        )
    except Exception as e:
        raise HTTPException(500, f"Jog failed: {e}")
    return get_position()


@router.post("/connect")
def connect() -> GantryPosition:
    global _gantry
    try:
        gantry_configs = list_configs(get_settings().configs_dir, "gantry")
        config = {}
        if gantry_configs:
            config = read_yaml(resolve_config_path(get_settings().configs_dir, "gantry", gantry_configs[0]))
        _gantry = Gantry(config=config)
        _gantry.connect()
    except Exception as e:
        _gantry = None
        raise HTTPException(500, f"Failed to connect: {e}")
    return get_position()


@router.post("/disconnect")
def disconnect() -> GantryPosition:
    global _gantry
    if _gantry:
        _gantry.disconnect()
    _gantry = None
    return GantryPosition(connected=False, status="Disconnected")


@router.get("/{filename}")
def get_gantry(filename: str) -> GantryResponse:
    path = resolve_config_path(get_settings().configs_dir, "gantry", filename)
    if not path.is_file():
        raise HTTPException(404, f"Config not found: {filename}")
    data = read_yaml(path)
    config = GantryConfig.model_validate(data)
    return GantryResponse(filename=filename, config=config)


@router.put("/{filename}")
def put_gantry(filename: str, body: dict) -> GantryResponse:
    path = resolve_config_path(get_settings().configs_dir, "gantry", filename)
    write_yaml(path, body)
    return get_gantry(filename)

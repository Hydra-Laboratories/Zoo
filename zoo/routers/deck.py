"""Deck config API endpoints."""

from fastapi import APIRouter, HTTPException

from zoo.config import ZooSettings
from zoo.models.deck import (
    DeckConfig,
    DeckResponse,
    LabwareResponse,
    WellPlateConfig,
)
from zoo.services.well_calculator import derive_wells
from zoo.services.yaml_io import list_configs, read_yaml, write_yaml

router = APIRouter(prefix="/api/deck", tags=["deck"])
settings = ZooSettings()
configs_dir = settings.panda_core_path / "configs"


@router.get("/configs")
def list_deck_configs() -> list[str]:
    return list_configs(configs_dir, "deck")


@router.get("/{filename}")
def get_deck(filename: str) -> DeckResponse:
    path = configs_dir / filename
    if not path.is_file():
        raise HTTPException(404, f"Config not found: {filename}")
    data = read_yaml(path)
    deck = DeckConfig.model_validate(data)
    items: list[LabwareResponse] = []
    for key, entry in deck.labware.items():
        wells = None
        if isinstance(entry, WellPlateConfig):
            wells = derive_wells(entry)
        items.append(LabwareResponse(key=key, config=entry, wells=wells))
    return DeckResponse(filename=filename, labware=items)


@router.put("/{filename}")
def put_deck(filename: str, body: DeckConfig) -> DeckResponse:
    path = configs_dir / filename
    write_yaml(path, body.model_dump(exclude_none=True))
    return get_deck(filename)

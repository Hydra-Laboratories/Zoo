"""Pydantic models mirroring PANDA_CORE deck YAML schema (standalone)."""

from __future__ import annotations

from typing import Annotated, Dict, Literal, Optional, Union

from pydantic import BaseModel, ConfigDict, Field, model_validator


class Coordinate3D(BaseModel):
    model_config = ConfigDict(extra="forbid")
    x: float
    y: float
    z: float


class CalibrationPoints(BaseModel):
    model_config = ConfigDict(extra="forbid")
    a1: Optional[Coordinate3D] = None
    a2: Coordinate3D


class WellPlateConfig(BaseModel):
    model_config = ConfigDict(extra="forbid", protected_namespaces=())

    type: Literal["well_plate"] = "well_plate"
    name: str
    model_name: str
    rows: int = Field(..., gt=0)
    columns: int = Field(..., gt=0)
    length_mm: float
    width_mm: float
    height_mm: float
    a1: Optional[Coordinate3D] = None
    calibration: CalibrationPoints
    x_offset_mm: float
    y_offset_mm: float
    capacity_ul: float
    working_volume_ul: float

    @property
    def a1_point(self) -> Coordinate3D:
        a1 = self.calibration.a1 or self.a1
        if a1 is None:
            raise ValueError("Calibration must define `a1`.")
        return a1

    @model_validator(mode="after")
    def _validate_calibration(self) -> WellPlateConfig:
        a1, a2 = self.a1_point, self.calibration.a2
        if a1.x == a2.x and a1.y == a2.y:
            raise ValueError("A1 and A2 must not be identical.")
        same_x = abs(a1.x - a2.x) < 1e-9
        same_y = abs(a1.y - a2.y) < 1e-9
        if not same_x and not same_y:
            raise ValueError("A2 must be axis-aligned with A1.")
        return self


class VialConfig(BaseModel):
    model_config = ConfigDict(extra="forbid", protected_namespaces=())

    type: Literal["vial"] = "vial"
    name: str
    model_name: str
    height_mm: float
    diameter_mm: float
    location: Coordinate3D
    capacity_ul: float
    working_volume_ul: float


LabwareEntry = Annotated[
    Union[WellPlateConfig, VialConfig],
    Field(discriminator="type"),
]


class DeckConfig(BaseModel):
    model_config = ConfigDict(extra="forbid")
    labware: Dict[str, LabwareEntry]


class WellPosition(BaseModel):
    x: float
    y: float
    z: float


class LabwareResponse(BaseModel):
    """Enriched labware with computed wells for well plates."""
    key: str
    config: Union[WellPlateConfig, VialConfig]
    wells: Optional[Dict[str, WellPosition]] = None


class DeckResponse(BaseModel):
    filename: str
    labware: list[LabwareResponse]

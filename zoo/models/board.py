"""Pydantic models for board (instruments) config."""

from __future__ import annotations

from typing import Dict

from pydantic import BaseModel, ConfigDict


class InstrumentConfig(BaseModel):
    model_config = ConfigDict(extra="allow")

    type: str
    offset_x: float = 0.0
    offset_y: float = 0.0


class BoardConfig(BaseModel):
    model_config = ConfigDict(extra="forbid")
    instruments: Dict[str, InstrumentConfig]


class BoardResponse(BaseModel):
    filename: str
    instruments: Dict[str, InstrumentConfig]

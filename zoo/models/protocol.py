"""Pydantic models for protocol configs."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class CommandArg(BaseModel):
    """Description of a single argument for a protocol command."""
    name: str
    type: str
    required: bool
    default: Any = None


class CommandInfo(BaseModel):
    """Description of a registered protocol command."""
    name: str
    args: List[CommandArg]
    description: str = ""


class ProtocolStepConfig(BaseModel):
    """One step in a protocol: a command name with its arguments."""
    command: str
    args: Dict[str, Any]


class ProtocolConfig(BaseModel):
    """Protocol YAML body: a list of steps."""
    protocol: List[ProtocolStepConfig]


class ProtocolResponse(BaseModel):
    """Parsed protocol file returned by the API."""
    filename: str
    steps: List[ProtocolStepConfig]


class ProtocolValidationResponse(BaseModel):
    """Result of protocol validation."""
    valid: bool
    errors: List[str] = []

"""Protocol router: CRUD for protocol YAML files + command registry."""

from __future__ import annotations

from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException

from zoo.config import ZooSettings
from zoo.models.protocol import (
    CommandArg,
    CommandInfo,
    ProtocolConfig,
    ProtocolResponse,
    ProtocolStepConfig,
    ProtocolValidationResponse,
)
from zoo.services.yaml_io import list_configs, read_yaml, write_yaml

router = APIRouter(prefix="/api/protocol", tags=["protocol"])
_settings = ZooSettings()


# ---------------------------------------------------------------------------
# Command registry introspection
# ---------------------------------------------------------------------------

# Protocol commands are defined in PANDA_CORE via @protocol_command decorators.
# We hardcode the command schemas here so Zoo has no import-time dependency
# on PANDA_CORE (which may require serial drivers, DLLs, etc.).
# Keep this in sync with src/protocol_engine/commands/*.py.

_COMMANDS: List[CommandInfo] = [
    CommandInfo(
        name="move",
        description="Move an instrument to a deck position.",
        args=[
            CommandArg(name="instrument", type="str", required=True),
            CommandArg(name="position", type="str", required=True),
        ],
    ),
    CommandInfo(
        name="aspirate",
        description="Move pipette to position, then aspirate.",
        args=[
            CommandArg(name="position", type="str", required=True),
            CommandArg(name="volume_ul", type="float", required=True),
            CommandArg(name="speed", type="float", required=False, default=50.0),
        ],
    ),
    CommandInfo(
        name="dispense",
        description="Move pipette to position, then dispense.",
        args=[
            CommandArg(name="position", type="str", required=True),
            CommandArg(name="volume_ul", type="float", required=True),
            CommandArg(name="speed", type="float", required=False, default=50.0),
        ],
    ),
    CommandInfo(
        name="blowout",
        description="Move pipette to position, then blowout.",
        args=[
            CommandArg(name="position", type="str", required=True),
            CommandArg(name="speed", type="float", required=False, default=50.0),
        ],
    ),
    CommandInfo(
        name="mix",
        description="Move pipette to position, then mix.",
        args=[
            CommandArg(name="position", type="str", required=True),
            CommandArg(name="volume_ul", type="float", required=True),
            CommandArg(name="repetitions", type="int", required=False, default=3),
            CommandArg(name="speed", type="float", required=False, default=50.0),
        ],
    ),
    CommandInfo(
        name="pick_up_tip",
        description="Move pipette to position, then pick up a tip.",
        args=[
            CommandArg(name="position", type="str", required=True),
            CommandArg(name="speed", type="float", required=False, default=50.0),
        ],
    ),
    CommandInfo(
        name="drop_tip",
        description="Move pipette to position, then drop the tip.",
        args=[
            CommandArg(name="position", type="str", required=True),
            CommandArg(name="speed", type="float", required=False, default=50.0),
        ],
    ),
    CommandInfo(
        name="scan",
        description="Scan every well on a plate using an instrument method.",
        args=[
            CommandArg(name="plate", type="str", required=True),
            CommandArg(name="instrument", type="str", required=True),
            CommandArg(name="method", type="str", required=True),
        ],
    ),
]

_COMMANDS_BY_NAME: Dict[str, CommandInfo] = {c.name: c for c in _COMMANDS}


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@router.get("/commands")
def get_commands() -> List[CommandInfo]:
    """Return all registered protocol commands with their argument schemas."""
    return _COMMANDS


@router.get("/commands/{name}")
def get_command(name: str) -> CommandInfo:
    """Return schema for a single protocol command."""
    if name not in _COMMANDS_BY_NAME:
        raise HTTPException(404, f"Unknown command '{name}'")
    return _COMMANDS_BY_NAME[name]


@router.get("/configs")
def list_protocol_configs() -> List[str]:
    configs_dir = _settings.panda_core_path / "configs"
    return list_configs(configs_dir, "protocol")


@router.get("/{filename}")
def get_protocol(filename: str) -> ProtocolResponse:
    path = _settings.panda_core_path / "configs" / filename
    if not path.is_file():
        raise HTTPException(404, f"Protocol file not found: {filename}")
    data = read_yaml(path)
    if "protocol" not in data or not isinstance(data["protocol"], list):
        raise HTTPException(400, f"File '{filename}' is not a valid protocol YAML")

    steps = []
    for raw_step in data["protocol"]:
        if not isinstance(raw_step, dict) or len(raw_step) != 1:
            continue
        cmd_name = next(iter(raw_step))
        args = raw_step[cmd_name] or {}
        steps.append(ProtocolStepConfig(command=cmd_name, args=args))

    return ProtocolResponse(filename=filename, steps=steps)


@router.put("/{filename}")
def save_protocol(filename: str, body: ProtocolConfig) -> dict:
    path = _settings.panda_core_path / "configs" / filename
    # Convert to YAML-native format: list of {command: {args}}
    protocol_list = []
    for step in body.protocol:
        protocol_list.append({step.command: step.args if step.args else None})
    write_yaml(path, {"protocol": protocol_list})
    return {"status": "ok", "filename": filename}


@router.post("/validate")
def validate_protocol(body: ProtocolConfig) -> ProtocolValidationResponse:
    """Validate a protocol against the known command schemas."""
    errors: List[str] = []
    for i, step in enumerate(body.protocol):
        if step.command not in _COMMANDS_BY_NAME:
            available = ", ".join(sorted(_COMMANDS_BY_NAME.keys()))
            errors.append(
                f"Step {i}: Unknown command '{step.command}'. "
                f"Available: {available}"
            )
            continue

        cmd = _COMMANDS_BY_NAME[step.command]
        required_args = {a.name for a in cmd.args if a.required}
        known_args = {a.name for a in cmd.args}
        provided = set(step.args.keys())

        missing = required_args - provided
        if missing:
            errors.append(
                f"Step {i} ({step.command}): missing required args: {', '.join(sorted(missing))}"
            )

        unknown = provided - known_args
        if unknown:
            errors.append(
                f"Step {i} ({step.command}): unknown args: {', '.join(sorted(unknown))}"
            )

    return ProtocolValidationResponse(valid=len(errors) == 0, errors=errors)

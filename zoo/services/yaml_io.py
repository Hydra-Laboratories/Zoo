"""Read/write YAML config files safely."""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List, Optional

import yaml


def read_yaml(path: Path) -> Dict[str, Any]:
    with path.open() as f:
        data = yaml.safe_load(f)
    return data if data is not None else {}


def write_yaml(path: Path, data: Dict[str, Any]) -> None:
    with path.open("w") as f:
        yaml.dump(data, f, default_flow_style=False, sort_keys=False, allow_unicode=True)


def classify_config(data: Dict[str, Any]) -> Optional[str]:
    """Classify a YAML config by its top-level keys."""
    if "labware" in data:
        return "deck"
    if "instruments" in data:
        return "board"
    if "working_volume" in data:
        return "gantry"
    if "protocol" in data:
        return "protocol"
    return None


def list_configs(configs_dir: Path, kind: str) -> List[str]:
    """List YAML filenames in configs_dir matching the given kind."""
    results = []
    if not configs_dir.is_dir():
        return results
    for p in sorted(configs_dir.glob("*.yaml")):
        try:
            data = read_yaml(p)
            if classify_config(data) == kind:
                results.append(p.name)
        except Exception:
            continue
    return results

"""Settings API — manage Zoo configuration like PANDA_CORE path."""

import subprocess
import sys

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from zoo.config import ZooSettings

router = APIRouter(prefix="/api/settings", tags=["settings"])
_settings = ZooSettings()


class SettingsResponse(BaseModel):
    panda_core_path: str


class UpdatePathRequest(BaseModel):
    panda_core_path: str


@router.get("")
def get_settings() -> SettingsResponse:
    return SettingsResponse(panda_core_path=str(_settings.panda_core_path.resolve()))


@router.put("")
def update_settings(body: UpdatePathRequest) -> SettingsResponse:
    from pathlib import Path

    path = Path(body.panda_core_path)
    if not path.is_dir():
        raise HTTPException(400, f"Directory does not exist: {body.panda_core_path}")
    _settings.panda_core_path = path
    return SettingsResponse(panda_core_path=str(path.resolve()))


@router.post("/browse")
def browse_directory() -> SettingsResponse:
    """Open a native directory picker and return the selected path."""
    if sys.platform == "darwin":
        script = (
            'POSIX path of (choose folder with prompt "Select PANDA_CORE directory")'
        )
        result = subprocess.run(
            ["osascript", "-e", script],
            capture_output=True,
            text=True,
            timeout=120,
        )
        if result.returncode != 0:
            raise HTTPException(400, "No directory selected")
        selected = result.stdout.strip().rstrip("/")
    else:
        # Fallback: tkinter for Linux/Windows
        import tkinter as tk
        from tkinter import filedialog

        root = tk.Tk()
        root.withdraw()
        selected = filedialog.askdirectory(title="Select PANDA_CORE directory")
        root.destroy()
        if not selected:
            raise HTTPException(400, "No directory selected")

    return SettingsResponse(panda_core_path=selected)

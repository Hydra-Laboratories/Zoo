"""Lightweight serial poller for GRBL gantry position (read-only)."""

from __future__ import annotations

import re
import time
from typing import Optional

import serial

from zoo.models.gantry import GantryPosition

_mpos_pattern = re.compile(r"MPos:([\d.-]+),([\d.-]+),([\d.-]+)")
_status_pattern = re.compile(r"<(\w+)")


class GrblPoller:
    def __init__(self) -> None:
        self._ser: Optional[serial.Serial] = None

    @property
    def connected(self) -> bool:
        return self._ser is not None and self._ser.is_open

    def connect(self, port: str, baudrate: int = 115200) -> None:
        if self._ser and self._ser.is_open:
            self._ser.close()
        self._ser = serial.Serial(port, baudrate, timeout=1)
        time.sleep(2)  # GRBL wake-up
        self._ser.read_all()  # flush startup messages

    def disconnect(self) -> None:
        if self._ser and self._ser.is_open:
            self._ser.close()
        self._ser = None

    def get_position(self) -> GantryPosition:
        if not self.connected:
            return GantryPosition(connected=False, status="Not connected")

        assert self._ser is not None
        try:
            self._ser.write(b"?")
            time.sleep(0.2)
            response = self._ser.read_all().decode("ascii", errors="replace")
        except (serial.SerialException, OSError):
            self.disconnect()
            return GantryPosition(connected=False, status="Connection lost")

        status = "Unknown"
        sm = _status_pattern.search(response)
        if sm:
            status = sm.group(1)

        mm = _mpos_pattern.search(response)
        if mm:
            return GantryPosition(
                x=round(float(mm.group(1)), 3),
                y=round(float(mm.group(2)), 3),
                z=round(float(mm.group(3)), 3),
                status=status,
                connected=True,
            )

        return GantryPosition(connected=True, status=status)


# Singleton instance used by the gantry router.
grbl_poller = GrblPoller()

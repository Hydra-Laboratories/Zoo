"""Derive well positions from calibration points — replicates PANDA_CORE logic."""

from __future__ import annotations

from typing import Dict

from zoo.models.deck import Coordinate3D, WellPlateConfig, WellPosition


def _row_labels(rows: int) -> list[str]:
    labels: list[str] = []
    for index in range(rows):
        label = ""
        value = index + 1
        while value > 0:
            value, remainder = divmod(value - 1, 26)
            label = chr(65 + remainder) + label
        labels.append(label)
    return labels


def derive_wells(entry: WellPlateConfig) -> Dict[str, WellPosition]:
    """Build well ID -> WellPosition from calibration A1/A2 and offsets."""
    a1 = entry.a1_point
    a2 = entry.calibration.a2
    rounding = 3
    wells: Dict[str, WellPosition] = {}
    row_labels = _row_labels(entry.rows)
    column_indices = list(range(1, entry.columns + 1))

    same_x = abs(a1.x - a2.x) < 1e-9
    same_y = abs(a1.y - a2.y) < 1e-9

    if same_y:
        col_step = a2.x - a1.x
        row_step = entry.y_offset_mm
        for row_idx, row_label in enumerate(row_labels):
            for col_idx, col_num in enumerate(column_indices):
                x = a1.x + col_step * col_idx
                y = a1.y + row_step * row_idx
                wells[f"{row_label}{col_num}"] = WellPosition(
                    x=round(x, rounding),
                    y=round(y, rounding),
                    z=round(a1.z, rounding),
                )
    elif same_x:
        col_step = a2.y - a1.y
        row_step = entry.x_offset_mm
        for row_idx, row_label in enumerate(row_labels):
            for col_idx, col_num in enumerate(column_indices):
                x = a1.x + row_step * row_idx
                y = a1.y + col_step * col_idx
                wells[f"{row_label}{col_num}"] = WellPosition(
                    x=round(x, rounding),
                    y=round(y, rounding),
                    z=round(a1.z, rounding),
                )
    else:
        raise ValueError("Calibration must be axis-aligned.")

    return wells

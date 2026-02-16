"""Test well position derivation against PANDA_CORE mofcat_deck.yaml values."""

from zoo.models.deck import CalibrationPoints, Coordinate3D, WellPlateConfig
from zoo.services.well_calculator import derive_wells


def _mofcat_wellplate() -> WellPlateConfig:
    """Replicate mofcat_deck.yaml wellplate_1."""
    return WellPlateConfig(
        type="well_plate",
        name="corning_96_well_360ul",
        model_name="corning_3590_96well",
        rows=8,
        columns=12,
        length_mm=127.76,
        width_mm=85.47,
        height_mm=14.22,
        calibration=CalibrationPoints(
            a1=Coordinate3D(x=-14.38, y=-11.24, z=-25.0),
            a2=Coordinate3D(x=-5.38, y=-11.24, z=-25.0),
        ),
        x_offset_mm=9.0,
        y_offset_mm=-9.0,
        capacity_ul=360.0,
        working_volume_ul=200.0,
    )


def test_well_count():
    wells = derive_wells(_mofcat_wellplate())
    assert len(wells) == 96  # 8 rows x 12 columns


def test_a1_position():
    wells = derive_wells(_mofcat_wellplate())
    a1 = wells["A1"]
    assert a1.x == -14.38
    assert a1.y == -11.24
    assert a1.z == -25.0


def test_a2_position():
    wells = derive_wells(_mofcat_wellplate())
    a2 = wells["A2"]
    # A2 is one column step from A1: col_step = a2.x - a1.x = 9.0
    assert a2.x == -5.38
    assert a2.y == -11.24
    assert a2.z == -25.0


def test_b1_position():
    wells = derive_wells(_mofcat_wellplate())
    b1 = wells["B1"]
    # B1 is one row step from A1: y_offset_mm = -9.0
    assert b1.x == -14.38
    assert b1.y == -20.24
    assert b1.z == -25.0


def test_last_well_h12():
    wells = derive_wells(_mofcat_wellplate())
    h12 = wells["H12"]
    # H12: col_idx=11, row_idx=7
    expected_x = round(-14.38 + 9.0 * 11, 3)  # 84.62
    expected_y = round(-11.24 + (-9.0) * 7, 3)  # -74.24
    assert h12.x == expected_x
    assert h12.y == expected_y
    assert h12.z == -25.0


def test_well_labels():
    wells = derive_wells(_mofcat_wellplate())
    assert "A1" in wells
    assert "A12" in wells
    assert "H1" in wells
    assert "H12" in wells

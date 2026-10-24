"""Regenerate the local JS payload after updating the original GeoJSON files."""
import json
from pathlib import Path

root = Path(__file__).resolve().parent
payload = {
    "grid": json.loads((root / "data/canopy-grid.geojson").read_text(encoding="utf-8-sig")),
    "boundary": json.loads((root / "data/atlanta-boundary.geojson").read_text(encoding="utf-8-sig")),
}
ids = [f["properties"]["id"] for f in payload["grid"]["features"]]
if len(ids) != len(set(ids)):
    raise ValueError("Duplicate grid IDs")
for feature in payload["grid"]["features"]:
    value = feature["properties"].get("canopy_pct_final")
    if value is not None and (not isinstance(value, (int, float)) or not 0 <= value <= 100):
        raise ValueError(f"Invalid canopy_pct_final: {value}")
(root / "data.js").write_text(
    "window.ATLANTA_CANOPY=" + json.dumps(payload, separators=(",", ":")) + ";",
    encoding="utf-8",
)
print(f"Updated data.js with {len(ids)} grids")

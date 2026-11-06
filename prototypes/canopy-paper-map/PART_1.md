# Part 1 — Canopy distribution

## Introduction
Tree canopy across Atlanta.
How evenly is tree canopy distributed across the city?

## Floating-card copy

### Atlanta’s tree canopy

This map uses Georgia Tech’s Atlanta tree-canopy data. The original raster records canopy at a 1 m resolution.

We’ve grouped it into 433 cells from a 1 km grid to make the city easier to explore. Cells at the edge are clipped to the city boundary.

### Seeing the spatial pattern

A city can look green overall while some places have much less canopy than others.

The grid keeps those places on the map, so we can see where coverage is concentrated and where the pattern changes.

### How different are two places?

Choose two cells on the map to compare their canopy coverage.

The colors show the broader pattern; the percentages show how far apart your two selected places are.

## Map instructions
Grid details: Hover or tap a cell to see coverage here. Click two cells to compare.
Comparison: Click a cell for A, then a different cell for B. A third cell starts a new comparison.
Legend: Darker means more canopy. Click a range to highlight it.

## Transition
How does this pattern look across communities?
Keep the geographic pattern in mind as the next visualization groups canopy coverage by NPU, census tract, and block group.

## Source
Urban Tree Canopy for the City of Atlanta · Georgia Tech Center for Urban Resilience and Analytics (CURA). Original raster: 1 m resolution. https://geospatial.gatech.edu/AtlantaUTC/

## Interpretation limits
Colors and displayed percentages represent the supplied canopy_pct_final field. They show spatial patterns, not causes, resident exposure, or verified neighborhood-level values. The grid does not follow census tract boundaries. Semi-transparent colors blend with the basemap; use the numeric values for exact comparisons. The A/B difference uses percentage points (for example, 60% minus 40% is 20 percentage points).

The team reports a full 1 km² denominator, but the exported fields differ (grid 16: canopy_pct=0.456 and canopy_pct_final=53.83). This revision preserves the final values without recalculation. Five zeros with empty canopymean fields remain flagged: 323, 324, 350, 351, 586. Confirm the original field calculation and missing-data handling before drawing final conclusions.

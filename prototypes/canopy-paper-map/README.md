# Atlanta canopy — floating introduction + interactive map

Open index.html. No build, API key, or network connection is required.

## Current design
Desktop: the introduction occupies a 300svh scroll track. Its 100svh stage stays fixed while three separate paper cards fade and float through the same position. Natural page scroll drives the transition. Topic links provide keyboard and click navigation; Explore the map skips directly to the explorer. No wheel/touch events are intercepted and there is no inner text scroller. Reduced-motion mode switches cards without motion. On screens at or below 760px the cards appear in a normal vertical stack, so text is not clipped.

The title is Tree canopy across Atlanta. The 3 QUESTIONS label and previous headline are removed. Map instructions now sit where they apply: details in the empty detail card, selection status in the comparison panel, and color/filter guidance beside the legend. Existing data, A/B selection, third-click restart, filters, opacity and basemap are retained.

## Integrate
Copy this entire folder into the website as canopy/. Keep both sections from index.html in order: section#canopy-context, then section#canopy-chapter. Load canopy/canopy-map.css and, after the sections, scripts in this order: canopy/assets/d3.min.js, canopy/data.js, canopy/basemap.js, canopy/canopy-map.js. Reuse compatible D3 7 if already loaded. Keep IDs unique; include one instance per document.

The sticky stage requires normal document scrolling. Do not put the introduction inside an overflow:hidden/auto ancestor or a fixed-height page wrapper. For an isolated embed, use an iframe with width:100%, height:100svh, min-height:720px and allow internal scrolling. Direct integration provides smoother continuity with the following team visualization.

Place the NPU → census tract → block group visualization after the map. The bridge is editorial text, not a fake navigation link; its actual section ID has not been provided. The project opening cover is separate and was not changed.

## Source and methodology
Source: Urban Tree Canopy for the City of Atlanta, Georgia Tech Center for Urban Resilience and Analytics (CURA). Original raster: 1 m resolution, as supplied by the team. Official study hub: https://geospatial.gatech.edu/AtlantaUTC/ . The 433-cell, 1 km grid is the team's aggregation, not the source raster resolution.

Display field: canopy_pct_final. All original grid values are unchanged. The final-field calculation basis remains unresolved (grid 16: canopy_pct=0.456 versus canopy_pct_final=53.83). Five zeros with empty canopymean remain hatched and flagged. Details are retained in the map's Data notes & methodology. Source attribution does not resolve these processing checks. Source files are in data/; update-data.py regenerates data.js after edits.

D3 and Nunito licenses are in assets/. The USGS basemap is a fixed snapshot aligned to the map projection; it must transform with the grid if future pan/zoom is introduced. The 5 km scale remains calibrated to the map projection. Current native interactions do not pan or zoom independently.

Copy revision: the cards now use brief, plain paragraphs without labels, bold emphasis or callout strips. The third card contains a single question. Card height has been reduced to suit the shorter copy.


Local interaction prompts: a translucent map hint says “Pick two squares to compare”; a separate hint next to the legend says “Click a color to highlight”. Each floats gently on a four-second cycle and disappears independently after its corresponding first interaction. Prompts do not intercept clicks. Reduced-motion preferences disable animation.

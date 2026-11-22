# Tree Huggers

Atlanta calls itself the City in the Forest. Tree canopy, urban heat, and historic neighborhood grades are not evenly distributed.

Tree Huggers is a scrolling story for Georgia Tech CS6730. It asks who gets the shade, and why. Each section is one full-screen view: a canopy atlas, a neighborhood hierarchy, a comparison of canopy and heat by HOLC grade, equal-distance rings from downtown, a citywide temperature trend, and a closing look at why the disparity matters.

**Group:** Weisheng Zhang, Aidan Murray, Yanni Xu, Christian Cardenas, Sophia Hawkins

## Project links

- **Code repository:** https://github.com/William-www/TreeHuggers
- **Narration / screencast:** https://drive.google.com/file/d/1tgrH9oVMlwd7fWkl9PDDBNWzGPw1GWO-/view?usp=sharing
- **Shared data folder:** https://drive.google.com/drive/folders/15RgW5E3iOhnyaqYXziHEhD5LTEZ5tR6j?usp=sharing

There is no separate hosted website. The hand-in is this repository. Run it locally with the steps below, then open http://localhost:8000.

## What we are handing in

The live story is `index.html` plus the styles and scripts it loads. `prototypes/` holds earlier drafts and is not the submission, except for the canopy atlas files the live page still loads from `prototypes/Tree_Huggers_Four_Pages/canopy/`.

### Our code

| Path | What it is |
| --- | --- |
| `index.html` | Story structure, copy, and the markup for every view. |
| `css/` | Layout and styles we wrote for the story, heat scene, hierarchy, equidistant rings, and climate chart. |
| `js/state.js` | Shared selection state so the canopy legend and later views can stay in sync. |
| `js/views/vis1.js` | Grade highlight on the canopy, heat, and redlining diagram. |
| `js/views/vis2.js` | Hierarchy tree and linked district map. |
| `js/views/vis7.js` | “Plant a tree” heat scene. |
| `js/views/equidistant.js` | Distance-ring map and beeswarm. |
| `js/views/climate.js` | Annual mean temperature chart. |
| `prototypes/Tree_Huggers_Four_Pages/canopy/` (`canopy-map.js`, `basemap.js`, `data.js`, `canopy-map.css`) | Canopy atlas used by the live page: grid drawing, comparison, legend filter, and USGS basemap overlay. |
| `data/` | Prepared JSON the charts fetch at runtime. |

### Libraries and outside assets

We did not write these. They are loaded as published libraries or map services.

| Piece | Where it comes from | How we use it |
| --- | --- | --- |
| [D3](https://d3js.org/) | Vendored at `prototypes/Tree_Huggers_Four_Pages/canopy/assets/d3.min.js` (license in `assets/D3-LICENSE.txt`) | Maps, scales, axes, and the beeswarm layout. |
| [Leaflet 1.9.4](https://leafletjs.com/) | CDN: `unpkg.com/leaflet@1.9.4` | District outlines in the hierarchy view. |
| [Apache ECharts 5](https://echarts.apache.org/) | CDN: `cdn.jsdelivr.net/npm/echarts@5` | Radial and horizontal hierarchy tree. |
| [Nunito](https://fonts.google.com/specimen/Nunito) | Google Fonts | Page type. License note: `prototypes/Tree_Huggers_Four_Pages/canopy/assets/Nunito-OFL.txt`. |
| USGS National Map topo | https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer | Optional basemap under the canopy grid. Credit is on the map. |
| Scene art in `assets/heat/` | Team image assets | Clouds in the heat scene. |

The page needs a network connection for Leaflet, ECharts, Nunito, and the USGS tiles. D3 is included in the repo, so the canopy atlas, equidistant view, and climate chart still draw if those CDNs are blocked. The hierarchy tree and district map will not.

## Preview locally

Charts and JSON load with `fetch`, so opening `index.html` as a file will not work. Serve the folder instead.

```bash
git clone https://github.com/William-www/TreeHuggers.git
cd TreeHuggers
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Interface notes

The page is one vertical story. A few controls are easy to miss.

**Canopy atlas.** Click a grid cell to fill the detail card, then click a second cell to compare the two. The A/B slots show which pick comes next; “Clear picks” empties both. “Basemap on” toggles the USGS topo under the grid. The opacity slider only fades the canopy layer; it does not change the percentages. Click a legend color to highlight that coverage band. Hatched cells marked ▧ report 0% and still need a data check; treat those comparisons as unverified. “Data notes & methodology” under the map explains the grid and the `canopy_pct_final` field.

**Hierarchy.** The tree and the map stay matched: hover or click a node on either side and the other side follows. Scroll over the tree to zoom. Click a tract to expand it. “Radial tree” and “Horizontal tree” change the layout only. Node size is the hierarchy level (city, NPU, tract, block group), not the canopy percentage. Color is canopy percent. “Reset full city map” returns the map to every NPU.

**Canopy, heat, and redlining.** Click a grade (A–D) on the left rail to highlight that tier of the tree and its averages. Crown widths are drawn to read as a story; the numbers in the right rail are the group averages. On a narrow screen, swipe the diagram sideways to see the averages.

**Equal distance.** Two sliders set an inner and outer ring around Five Points. The map and the dot plot both keep only block groups inside that ring. If the inner slider passes the outer one, the outer edge moves with it. Pale cells are outside the ring or were never graded. Hover a dot for that block group. Zero on the chart is the citywide surface-temperature average, not 0°F.

**Climate chart.** The solid line is each year’s annual average. The second line is the fitted trend. Hover a year for the exact value.

**Heat scene.** “CLICK ME!” plants one more tree, up to eight. The thermometer, sky, and chart move together as cover goes up and the temperature gap goes down. “Start over” clears the trees. The street is an illustration of that relationship, not a map of a real block.

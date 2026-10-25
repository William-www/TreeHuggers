# About

Atlanta calls itself the City in the Forest. But tree canopy, urban heat, and historic neighborhood grades are not evenly distributed.

We're team Tree Huggers. This is a scrolling story for Georgia Tech CS6730 course. It asks who gets the shade, and why. Each section is one full-screen view: a canopy atlas, a neighborhood hierarchy, equal-distance rings from downtown, a comparison of canopy and heat by HOLC grade, and a closing look at why the disparity matters.

**Group:** Weisheng Zhang, Aidan Murray, Yanni Xu, Christian Cardenas, Sophia Hawkins

## Preview locally

The page loads charts and JSON with `fetch`, so opening `index.html` as a file will not work. Serve the folder instead.

```bash
git clone https://github.com/William-www/TreeHuggers.git
cd TreeHuggers
python3 -m http.server 8000
```

Then open http://localhost:8000 on your browser.

## What’s in the repo

| Path | Role |
| --- | --- |
| `index.html` | The story, from the opening line through the team close. |
| `css/` | Shared layout plus styles for the heat, tree, and equidistant views. |
| `js/` | Shared selection state and the chart code for each view. |
| `data/` | Datasets used to create the visualizations. |
| `assets/` | Images and icons. |
| `prototypes/` | Earlier drafts. The live page is `index.html`. |

Shared source files live in the [Tree and Heat Drive folder](https://drive.google.com/drive/folders/15RgW5E3iOhnyaqYXziHEhD5LTEZ5tR6j?usp=sharing).

// list of instructions the browser runs from top to bottom
    // settings - can change for real data
    const START_COVERAGE = 10; // tree coverage (%) before any trees are added
    const STEP_PERCENT = 5; // coverage added per click
    const START_TEMP     = 95;   // temperature (°F) before any clicks
    const DROP_PER_STEP  = 1.5;  // degrees cooler per click  

    // thermometer scale (temp changes at top and btotom of the tube)
    const THERMO_MIN = 80;
    const THERMO_MAX = 100;

    // Scatterplot points. PLACEHOLDER values: replace with your real data.
    const scatterData = [
    { coverage: 3,  temp: 97.5 }, { coverage: 5,  temp: 96.0 },
    { coverage: 6,  temp: 97.0 }, { coverage: 8,  temp: 95.2 },
    { coverage: 10, temp: 95.8 }, { coverage: 12, temp: 94.1 },
    { coverage: 14, temp: 94.9 }, { coverage: 16, temp: 92.8 },
    { coverage: 18, temp: 93.6 }, { coverage: 21, temp: 91.9 },
    { coverage: 23, temp: 92.7 }, { coverage: 25, temp: 90.4 },
    { coverage: 28, temp: 91.2 }, { coverage: 30, temp: 89.3 },
    { coverage: 33, temp: 89.9 }, { coverage: 36, temp: 87.6 },
    { coverage: 38, temp: 88.5 }, { coverage: 41, temp: 86.8 },
    { coverage: 45, temp: 85.9 }, { coverage: 50, temp: 84.2 }
    ];


    // Tree picture
    const TREE_IMAGE = "prototypes/tree_icon.png";

    // Where each new tree is planted, in order.
    // x = how far across the street (%), size = 1 is normal, 1.2 is 20% bigger.
    const TREE_SPOTS = [
    { x: 54, size: 1.00 }, { x: 78, size: 0.92 },
    { x: 40, size: 0.86 }, { x: 88, size: 1.05 },
    { x: 66, size: 0.80 }, { x: 47, size: 1.10 },
    { x: 84, size: 0.76 }, { x: 31, size: 0.95 }
    ];
    const MAX_TREES = TREE_SPOTS.length;
    const TREE_WIDTH = 118;       // width in pixels of a size-1 tree

    // get the page elements needed
    const addButton    = document.getElementById("add-tree");
    const resetButton  = document.getElementById("reset");
    const treeLayer    = document.getElementById("tree-layer");
    const mercury      = document.getElementById("mercury");
    const scale        = document.getElementById("scale");
    const tempReadout  = document.getElementById("temp-readout");
    const coverReadout = document.getElementById("cover-readout");
    const countLabel   = document.getElementById("count");
    const skyCool      = document.getElementById("sky-cool");
    const sun          = document.getElementById("sun");
    const chartPanel   = document.getElementById("chart-panel");
    const chart        = document.getElementById("chart");

    document.getElementById("step-label").textContent = STEP_PERCENT; // replace the step-label element's text (which we set to a default earlier) with the step size set in settings
    
    // State: a number that changes
    let treesAdded = 0;

    function currentCoverage() { return START_COVERAGE + treesAdded * STEP_PERCENT; }
    function currentTemp() { return START_TEMP - treesAdded * DROP_PER_STEP; }

    // Write the degree labels next to the tube
    function buildScale() {
    for (let t = THERMO_MIN; t <= THERMO_MAX; t += 5) { // loop to run the code inside 5 times, creating one lael each time
        const label = document.createElement("span");
        label.textContent = t + "°";
        label.style.bottom = ((t - THERMO_MIN) / (THERMO_MAX - THERMO_MIN) * 100) + "%"; 
            // The tube runs from 80° (empty) to 100° (full). At 95°, the formula gives (95 − 80) / (100 − 80) × 100 = 75, so the red column is 75% tall. At 89°, it is 45%.
        scale.appendChild(label);
        }
    }

    // redraw everything from current state
    function update() {
        const temp = currentTemp();

        // Thermometer: turn the temp into percentage of the tube
        let pct = (temp - THERMO_MIN) / (THERMO_MAX - THERMO_MIN) * 100;
        pct = Math.max(0, Math.min(100, pct));
        mercury.style.height = pct + "%";

        tempReadout.textContent = temp.toFixed(1) + "°F";
        coverReadout.textContent = currentCoverage() + "% tree cover";

        countLabel.textContent = `${treesAdded} of ${MAX_TREES} trees planted`;
        addButton.disabled = treesAdded >= MAX_TREES; // greys out add tree button

        // cool the scene: change sky color
        const cool = treesAdded / MAX_TREES;
        const heat = 1 - cool;
        skyCool.style.opacity = cool;

        drawChart();
    }
// make one tree
function makeTreePicture() {
    const img = document.createElement("img");
    img.src = TREE_IMAGE;
    img.onerror = function () {
        console.warn("Could not load TREE_IMAGE '" + TREE_IMAGE);
    };
    return img;
}
// clicking the tree button
addButton.addEventListener("click", function () {
    if (treesAdded >= MAX_TREES) return;
    
    const spot = TREE_SPOTS[treesAdded];
    const tree = document.createElement("div");
    tree.className = "tree";
    tree.style.left = spot.x + "%";
    tree.style.width = (TREE_WIDTH * spot.size) + "px";
    tree.style.zIndex = Math.round(spot.size * 10);
    tree.appendChild(makeTreePicture());
    treeLayer.appendChild(tree);

    treesAdded = treesAdded + 1;
    update();
});

// start over
resetButton.addEventListener("click", function () {
  treeLayer.innerHTML = "";
  treesAdded = 0;
  update();
});

// draw the scatterplot as an svg
const X_MAX = 60;   // coverage axis runs from 0% to 60%

function drawChart() {
  const W = 400, H = 300, pad = 45;

  // Turn a data value into a position in the drawing
  const x = v => pad + v / X_MAX * (W - 2 * pad);
  const y = v => H - pad - (v - THERMO_MIN) / (THERMO_MAX - THERMO_MIN) * (H - 2 * pad);

  // Best-fit line (least squares)
  const n = scatterData.length;
  const meanX = scatterData.reduce((sum, d) => sum + d.coverage, 0) / n;
  const meanY = scatterData.reduce((sum, d) => sum + d.temp, 0) / n;
  let num = 0, den = 0;
  for (const d of scatterData) {
    num += (d.coverage - meanX) * (d.temp - meanY);
    den += (d.coverage - meanX) ** 2;
  }
  const slope = num / den;
  const intercept = meanY - slope * meanX;

  let svg = `<svg viewBox="0 0 ${W} ${H}" width="100%" font-size="11" fill="#55646A">`;

  // Axes and their titles
  svg += `<line x1="${pad}" y1="${H - pad}" x2="${W - pad}" y2="${H - pad}" stroke="#1F2A2E"/>`;
  svg += `<line x1="${pad}" y1="${pad}" x2="${pad}" y2="${H - pad}" stroke="#1F2A2E"/>`;
  svg += `<text x="${W / 2}" y="${H - 8}" text-anchor="middle" font-size="13" fill="#1F2A2E">Tree coverage</text>`;
  svg += `<text x="${pad}" y="${pad - 14}" text-anchor="middle" font-size="13" fill="#1F2A2E">Temp (°F)</text>`;

  // Tick labels
  for (let t = 0; t <= X_MAX; t += 10) {
    svg += `<text x="${x(t)}" y="${H - pad + 18}" text-anchor="middle">${t}%</text>`;
  }
  for (let t = THERMO_MIN; t <= THERMO_MAX; t += 5) {
    svg += `<text x="${pad - 8}" y="${y(t) + 4}" text-anchor="end">${t}°</text>`;
  }

  // Trend line, from 0% to X_MAX
  svg += `<line x1="${x(0)}" y1="${y(intercept)}" x2="${x(X_MAX)}" y2="${y(intercept + slope * X_MAX)}" stroke="#D7263D" stroke-width="2.5"/>`;

  // One dot per neighborhood
  for (const d of scatterData) {
    svg += `<circle cx="${x(d.coverage)}" cy="${y(d.temp)}" r="4.5" fill="#1F2A2E" fill-opacity="0.55"/>`;
  }

  // Your block
  svg += `<circle cx="${x(currentCoverage())}" cy="${y(currentTemp())}" r="8" fill="#2F6B47" stroke="white" stroke-width="2.5"/>`;

  chart.innerHTML = svg + `</svg>`;
}

// setup for when the page first loads
addButton.appendChild(makeTreePicture());
buildScale();
update();

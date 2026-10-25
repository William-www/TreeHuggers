const BINS = [
  { label: "0–17%", max: 17 },
  { label: "17–35%", max: 35 },
  { label: "35–52%", max: 52 },
  { label: "52–69%", max: 69 },
  { label: "69–100%", max: 101 }
];

function canopyBin(value) {
  const index = BINS.findIndex((bin) => value < bin.max);
  return index === -1 ? BINS.length - 1 : index;
}

function drawVis2(container, current) {
  const chart = container._chart;
  const root = container._tree;
  if (!chart || !root) return;

  const active = current.canopyBin;
  const paint = (node) => {
    const match = active === null || canopyBin(node.value) === active;
    if (!node._baseColor) node._baseColor = node.itemStyle.color;
    node.itemStyle = { ...node.itemStyle, color: match ? node._baseColor : "#E4DFD4", opacity: match ? 1 : 0.45 };
    node.label = { ...(node.label || {}), color: match ? "#1A1917" : "#C5C0B7" };
    (node.children || []).forEach(paint);
  };
  paint(root);
  chart.setOption({ series: [{ data: [root] }] });

  const note = document.getElementById("vis-2-link");
  if (note) {
    note.textContent = active === null
      ? ""
      : `Atlas highlight: ${BINS[active].label}. Click again to clear.`;
  }
}

function mountVis2(container, tree) {
  const chart = echarts.init(container);
  container._chart = chart;
  container._tree = tree;

  const option = (layout) => ({
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      triggerOn: "mousemove",
      backgroundColor: "#183e2c",
      borderColor: "#183e2c",
      textStyle: { color: "#f6f0dd", fontFamily: "Nunito, sans-serif", fontSize: 13 },
      formatter: (params) => {
        const d = params.data;
        return `<b>${d.name}</b><br/>Tree canopy: <b>${d.value}%</b>`;
      }
    },
    series: [{
      type: "tree",
      data: [tree],
      layout,
      top: layout === "radial" ? "2%" : "2%",
      bottom: layout === "radial" ? "2%" : "2%",
      left: layout === "radial" ? "2%" : "6%",
      right: layout === "radial" ? "2%" : "14%",
      roam: true,
      initialTreeDepth: 2,
      expandAndCollapse: false,
      animationDuration: 450,
      animationDurationUpdate: 600,
      lineStyle: { color: "#C5C0B7", width: 1, curveness: 0.5 },
      label: { fontFamily: "Nunito, sans-serif", fontSize: 11, color: "#183e2c" },
      leaves: { label: { fontSize: 10, color: "#386342" } }
    }]
  });

  chart.setOption(option("radial"));
  const findNode = (node, geoid) => {
    if (node.geoid === geoid) return node;
    for (const child of node.children || []) {
      const found = findNode(child, geoid);
      if (found) return found;
    }
    return null;
  };

  chart.on("click", (params) => {
    const clicked = params.data;
    if (!clicked || typeof clicked.value !== "number") return;
    const node = findNode(tree, clicked.geoid) || clicked;
    if (node.children && node.children.length) node.collapsed = !node.collapsed;
    const next = canopyBin(node.value);
    setState({ canopyBin: state.canopyBin === next ? null : next, geoid: node.geoid });
  });

  document.querySelectorAll("[data-tree-layout]").forEach((button) => {
    button.addEventListener("click", () => {
      const layout = button.dataset.treeLayout;
      document.querySelectorAll("[data-tree-layout]").forEach((other) => {
        other.classList.toggle("is-active", other === button);
        other.setAttribute("aria-pressed", String(other === button));
      });
      chart.setOption(option(layout), true);
      drawVis2(container, state);
    });
  });

  const resize = () => chart.resize();
  window.addEventListener("resize", resize);
  if (window.ResizeObserver) new ResizeObserver(resize).observe(container);
  drawVis2(container, state);
  onState((current) => drawVis2(container, current));
}

const vis2 = document.getElementById("vis-2-chart");
fetch("data/canopy-hierarchy.json")
  .then((response) => response.json())
  .then((tree) => mountVis2(vis2, tree))
  .catch(() => {
    vis2.textContent = "The neighborhood hierarchy could not be loaded.";
  });

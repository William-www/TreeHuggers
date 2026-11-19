function mountVis2(treeData, geojsonData, childrenMap) {
  const featureById = {};
  geojsonData.features.forEach((f) => {
    featureById[f.properties.geoid] = f;
  });

  const map = L.map("map", { zoomControl: true });
  L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
    maxZoom: 16
  }).addTo(map);

  const baseNpuLayer = L.geoJSON(geojsonData, {
    filter: (f) => f.properties.depth === 1,
    style: (f) => ({
      fillColor: f.properties.color,
      fillOpacity: 0.35,
      color: "#6E6B65",
      weight: 1,
      dashArray: "2,2"
    }),
    onEachFeature: (feature, layer) => {
      const geoid = feature.properties.geoid;
      layer.on("mouseover", () => showMatch(geoid, false));
      layer.on("click", () => showMatch(geoid, true));
    }
  }).addTo(map);

  map.fitBounds(baseNpuLayer.getBounds(), { padding: [18, 18] });
  const highlightGroup = L.layerGroup().addTo(map);

  function resetMap() {
    shownGeoid = null;
    highlightGroup.clearLayers();
    clearTreeSelection();
    map.flyToBounds(baseNpuLayer.getBounds(), { padding: [18, 18], duration: 0.6 });
    document.getElementById("map-level-indicator").innerText = "SCOPE: ALL NPUS";
    const hoverInfo = document.getElementById("hover-info");
    hoverInfo.hidden = false;
    hoverInfo.textContent = "Hover or click either side. The tree and the map stay matched.";
  }

  function highlightOnMap(geoid, adjustScope) {
    const feat = featureById[geoid];
    if (!feat) return;

    if (shownGeoid === geoid && highlightGroup.getLayers().length > 0 && !adjustScope) return;
    shownGeoid = geoid;

    highlightGroup.clearLayers();
    const levelNames = ["CITY ROOT", "NEIGHBORHOOD PLANNING UNIT", "CENSUS TRACT", "BLOCK GROUP"];
    const p = feat.properties;
    const boundsGroup = L.featureGroup();
    const childIds = childrenMap[geoid] || [];

    const selectedLayer = L.geoJSON(feat, {
      style: {
        fillColor: p.color,
        fillOpacity: childIds.length > 0 ? 0.12 : 0.80,
        color: "#F2B544",
        weight: 4
      }
    }).addTo(highlightGroup);
    selectedLayer.eachLayer((layer) => {
      layer.on("click", (event) => {
        L.DomEvent.stop(event);
        showMatch(geoid, true);
      });
    });
    boundsGroup.addLayer(selectedLayer);

    childIds.forEach((cid) => {
      const cFeat = featureById[cid];
      if (!cFeat) return;
      const cLayer = L.geoJSON(cFeat, {
        style: {
          fillColor: cFeat.properties.color,
          fillOpacity: 0.72,
          color: "#1A1917",
          weight: 1.3
        }
      }).addTo(highlightGroup);
      cLayer.eachLayer((layer) => {
        layer.on("click", (event) => {
          L.DomEvent.stop(event);
          showMatch(cid, true);
        });
      });
      boundsGroup.addLayer(cLayer);
    });

    if (adjustScope && boundsGroup.getLayers().length > 0) {
      map.flyToBounds(boundsGroup.getBounds(), { padding: [22, 22], duration: 0.65 });
    }

    document.getElementById("map-level-indicator").innerText = `SCOPE: ${p.name.toUpperCase()}`;
    const hoverInfo = document.getElementById("hover-info");
    hoverInfo.hidden = false;
    hoverInfo.innerHTML =
      `<b>${p.name}</b> [${levelNames[p.depth]}]<br/>` +
      `Tree Canopy: <b>${p.canopy}%</b> &nbsp;|&nbsp; Sub-districts outlined: ${childIds.length}`;
  }

  const chart = echarts.init(document.getElementById("tree-chart"));

  function getOption(layoutType) {
    return {
      tooltip: {
        trigger: "item",
        triggerOn: "mousemove",
        backgroundColor: "#183e2c",
        borderColor: "#183e2c",
        textStyle: { color: "#f6f0dd", fontFamily: "Nunito, Arial, sans-serif", fontSize: 13 },
        formatter: (params) => {
          const d = params.data;
          return `<b>${d.fullName || d.name}</b><br/>ID: ${d.geoid}<br/>Tree Canopy: <b>${d.value}%</b>`;
        }
      },
      series: [{
        id: "hierarchy",
        type: "tree",
        data: [treeData],
        layout: layoutType,
        top: layoutType === "radial" ? "7%" : "4%",
        bottom: layoutType === "radial" ? "7%" : "4%",
        left: layoutType === "radial" ? "7%" : "10%",
        right: layoutType === "radial" ? "7%" : "14%",
        roam: true,
        initialTreeDepth: 2,
        expandAndCollapse: true,
        lineStyle: { color: "#C5C0B7", width: 1, curveness: 0.5 },
        label: { fontFamily: "Nunito, Arial, sans-serif", fontSize: 11, color: "#183e2c", fontWeight: 700 },
        emphasis: {
          focus: "ancestor",
          itemStyle: { borderColor: "#F2B544", borderWidth: 3.5 }
        }
      }]
    };
  }

  let layoutType = "radial";

  function setLayout(type) {
    layoutType = type;
    document.getElementById("btn-radial").classList.toggle("active", type === "radial");
    document.getElementById("btn-ortho").classList.toggle("active", type === "orthogonal");
    chart.setOption(getOption(type), true);
    if (selectedGeoid) paintTreeNode(selectedGeoid);
  }

  const nodeByGeoid = {};
  const parentByGeoid = {};
  (function indexTree(node, parent) {
    node.id = node.geoid;
    nodeByGeoid[node.geoid] = node;
    parentByGeoid[node.geoid] = parent;
    (node.children || []).forEach((child) => indexTree(child, node));
  })(treeData, null);

  let shownGeoid = null;
  let selectedGeoid = null;
  const savedNodeStyle = {};

  function rememberNode(node) {
    if (savedNodeStyle[node.geoid]) return;
    savedNodeStyle[node.geoid] = {
      itemStyle: Object.assign({}, node.itemStyle),
      symbolSize: node.symbolSize,
      symbol: node.symbol || null,
      label: node.label || null
    };
  }

  function restoreNode(geoid) {
    const node = nodeByGeoid[geoid];
    const saved = node && savedNodeStyle[geoid];
    if (!node || !saved) return;
    node.itemStyle = Object.assign({}, saved.itemStyle);
    node.symbolSize = saved.symbolSize;
    if (saved.symbol) node.symbol = saved.symbol;
    else delete node.symbol;
    if (saved.label) node.label = saved.label;
    else delete node.label;
  }

  function paintTreeNode(geoid) {
    const node = nodeByGeoid[geoid];
    if (!node) return;
    if (selectedGeoid && selectedGeoid !== geoid) restoreNode(selectedGeoid);
    rememberNode(node);
    const saved = savedNodeStyle[geoid];
    let parent = parentByGeoid[geoid];
    while (parent) {
      parent.collapsed = false;
      parent = parentByGeoid[parent.geoid];
    }
    node.symbol = "circle";
    node.itemStyle = Object.assign({}, saved.itemStyle, {
      color: "#F2B544",
      borderColor: "#183e2c",
      borderWidth: 2
    });
    node.symbolSize = (saved.symbolSize || 10) + 14;
    node.label = {
      color: "#183e2c",
      fontWeight: 800,
      fontSize: 14
    };
    selectedGeoid = geoid;
    chart.dispatchAction({ type: "downplay", seriesIndex: 0 });
    chart.setOption(getOption(layoutType));
  }

  function clearTreeSelection() {
    if (selectedGeoid) restoreNode(selectedGeoid);
    selectedGeoid = null;
    chart.setOption(getOption(layoutType));
  }

  function treeDataIndex(geoid) {
    const data = chart.getModel().getSeriesByIndex(0).getData();
    for (let i = 0; i < data.count(); i++) {
      const raw = data.getRawDataItem(i);
      if (raw && raw.geoid === geoid) return i;
    }
    return -1;
  }

  function hoverTreeNode(geoid) {
    const dataIndex = treeDataIndex(geoid);
    if (dataIndex < 0) return;
    chart.dispatchAction({ type: "downplay", seriesIndex: 0 });
    chart.dispatchAction({ type: "highlight", seriesIndex: 0, dataIndex: dataIndex });
  }

  function showMatch(geoid, adjustScope) {
    highlightOnMap(geoid, adjustScope);
    if (adjustScope) paintTreeNode(geoid);
    else hoverTreeNode(geoid);
  }

  chart.setOption(getOption("radial"));
  chart.on("mouseover", (params) => {
    if (params.data && params.data.geoid) highlightOnMap(params.data.geoid, false);
  });
  chart.on("click", (params) => {
    if (!params.data || !params.data.geoid) return;
    highlightOnMap(params.data.geoid, true);
    paintTreeNode(params.data.geoid);
  });

  document.getElementById("btn-radial").addEventListener("click", () => setLayout("radial"));
  document.getElementById("btn-ortho").addEventListener("click", () => setLayout("orthogonal"));
  document.getElementById("btn-reset-map").addEventListener("click", resetMap);

  const resize = () => {
    chart.resize();
    map.invalidateSize();
  };
  window.addEventListener("resize", resize);
  if (window.ResizeObserver) new ResizeObserver(resize).observe(document.getElementById("vis-2"));
}

Promise.all([
  fetch("data/hierarchy-tree.json").then((r) => r.json()),
  fetch("data/hierarchy-geo.json").then((r) => r.json()),
  fetch("data/hierarchy-children.json").then((r) => r.json())
]).then(([tree, geo, children]) => mountVis2(tree, geo, children))
  .catch(() => {
    const panel = document.getElementById("tree-chart");
    if (panel) panel.textContent = "The neighborhood hierarchy could not be loaded.";
  });

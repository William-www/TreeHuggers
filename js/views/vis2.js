function drawVis2(container, current) {
  container.replaceChildren();
  // Draw this view into container. current.geoid is the shared neighborhood.
}

const vis2 = document.getElementById("vis-2-chart");
drawVis2(vis2, state);
onState((current) => drawVis2(vis2, current));

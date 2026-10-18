function drawVis1(container, current) {
  container.replaceChildren();
  // Draw this view into container. current.geoid is the shared neighborhood.
}

const vis1 = document.getElementById("vis-1-chart");
drawVis1(vis1, state);
onState((current) => drawVis1(vis1, current));

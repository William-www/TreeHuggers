(function () {
  const root = document.getElementById("vis-distance");
  if (!root || typeof d3 === "undefined") return;

  const holcColors = {
    A: "#386342",
    B: "#83b9b6",
    C: "#f2b544",
    D: "#b87950"
  };
  const grades = ["A", "B", "C", "D"];
  const mapHost = d3.select("#eq-map");
  const beeHost = d3.select("#eq-bee");
  const tip = d3.select("#eq-tip");

  d3.json("data/equidistant-geo.json").then(function (geojson) {
    const data = geojson.features.map(function (feature) {
      return feature.properties;
    });

    const mapSvg = mapHost.append("svg").attr("role", "img").attr("aria-label", "Atlanta block groups colored by HOLC grade inside the selected distance from Five Points.");
    const beeSvg = beeHost.append("svg").attr("role", "img").attr("aria-label", "Beeswarm of surface heat anomaly by HOLC grade for block groups inside the selected distance.");
    const mapG = mapSvg.append("g");
    const ringG = mapSvg.append("g");
    const beeG = beeSvg.append("g");
    const dotGroup = beeG.append("g");

    function sizeOf(node) {
      const box = node.getBoundingClientRect();
      return { width: Math.max(240, box.width), height: Math.max(220, box.height) };
    }

    const mapSize = sizeOf(mapHost.node());
    const beeSize = sizeOf(beeHost.node());
    const margin = { top: 12, right: 12, bottom: 36, left: 62 };
    const plotW = beeSize.width - margin.left - margin.right;
    const plotH = beeSize.height - margin.top - margin.bottom;

    const projection = d3.geoMercator().fitExtent([[12, 12], [mapSize.width - 12, mapSize.height - 12]], geojson);
    const path = d3.geoPath(projection);
    const center = [-84.3898, 33.7544];
    const five = projection(center);

    mapSvg.attr("viewBox", "0 0 " + mapSize.width + " " + mapSize.height);
    beeSvg.attr("viewBox", "0 0 " + beeSize.width + " " + beeSize.height);
    beeG.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const tracts = mapG.selectAll("path")
      .data(geojson.features)
      .join("path")
      .attr("d", path)
      .attr("fill", "#e7e1cc")
      .attr("stroke", "rgba(24,62,44,.28)")
      .attr("stroke-width", 0.4)
      .on("mouseover", function (event, d) { onHover(d.properties, event); })
      .on("mousemove", onMove)
      .on("mouseout", onLeave);

    mapSvg.append("circle").attr("cx", five[0]).attr("cy", five[1]).attr("r", 4).attr("fill", "#183e2c");
    mapSvg.append("text")
      .attr("x", five[0] + 7)
      .attr("y", five[1] + 3)
      .attr("fill", "#183e2c")
      .attr("font-size", 11)
      .attr("font-weight", 800)
      .text("Five Points");

    const x = d3.scaleLinear().domain([-10, 20]).range([0, plotW]);
    const y = d3.scalePoint().domain(grades).range([18, plotH - 10]).padding(0.45);

    grades.forEach(function (grade) {
      beeG.append("line")
        .attr("x1", 0).attr("x2", plotW)
        .attr("y1", y(grade)).attr("y2", y(grade))
        .attr("stroke", "rgba(217,205,169,.9)")
        .attr("stroke-dasharray", "3 5");
    });
    beeG.append("line")
      .attr("x1", x(0)).attr("x2", x(0))
      .attr("y1", 0).attr("y2", plotH)
      .attr("stroke", "#b87950")
      .attr("stroke-dasharray", "4 4");
    beeG.append("g")
      .attr("class", "eq-axis")
      .attr("transform", "translate(0," + plotH + ")")
      .call(d3.axisBottom(x).ticks(6).tickFormat(function (value) { return (value > 0 ? "+" : "") + value + "°F"; }));
    beeG.append("text")
      .attr("x", plotW / 2)
      .attr("y", plotH + 30)
      .attr("text-anchor", "middle")
      .attr("fill", "#386342")
      .attr("font-size", 11)
      .attr("font-weight", 800)
      .text("Surface heat vs. the city average");
    beeG.append("g")
      .attr("class", "eq-axis")
      .call(d3.axisLeft(y).tickFormat(function (grade) { return "HOLC " + grade; }))
      .selectAll("text")
      .attr("font-weight", 800)
      .attr("fill", function (grade) { return holcColors[grade]; });

    function ring(km) {
      const steps = 64;
      const coords = [];
      for (let i = 0; i <= steps; i++) {
        const angle = (i / steps) * Math.PI * 2;
        const lat = center[1] + (km / 111.32) * Math.sin(angle);
        const lon = center[0] + (km / (111.32 * Math.cos(center[1] * Math.PI / 180))) * Math.cos(angle);
        coords.push([lon, lat]);
      }
      return { type: "LineString", coordinates: coords };
    }

    function shortName(props) {
      const match = /Block Group (\d+); Census Tract ([^;]+)/.exec(props.name || "");
      return match ? "Block group " + match[1] + ", tract " + match[2] : (props.name || "Block group");
    }

    function update() {
      let minD = +d3.select("#eq-min").property("value");
      let maxD = +d3.select("#eq-max").property("value");
      if (minD >= maxD) {
        maxD = minD + 500;
        d3.select("#eq-max").property("value", maxD);
      }
      d3.select("#eq-min-label").text((minD / 1000).toFixed(1) + " km");
      d3.select("#eq-max-label").text((maxD / 1000).toFixed(1) + " km");

      tracts.attr("fill", function (d) {
        const props = d.properties;
        const inside = props.dist_m >= minD && props.dist_m <= maxD;
        if (!inside) return "#f3efe2";
        return props.holc ? holcColors[props.holc] : "#d9cda9";
      });

      ringG.selectAll("path")
        .data([ring(minD / 1000), ring(maxD / 1000)])
        .join("path")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#183e2c")
        .attr("stroke-width", 1.25)
        .attr("stroke-dasharray", "4 4");

      const subset = data.filter(function (d) {
        return d.dist_m >= minD && d.dist_m <= maxD && grades.indexOf(d.holc) !== -1;
      });
      d3.select("#eq-count").text(subset.length);

      const sim = d3.forceSimulation(subset)
        .force("x", d3.forceX(function (d) { return x(d.temp_diff); }).strength(1))
        .force("y", d3.forceY(function (d) { return y(d.holc); }).strength(0.35))
        .force("collide", d3.forceCollide(5))
        .stop();
      for (let i = 0; i < 80; i++) sim.tick();

      const dots = dotGroup.selectAll("circle").data(subset, function (d) { return d.GEOID; });
      dots.exit().remove();
      dots.enter()
        .append("circle")
        .attr("r", 4.2)
        .attr("fill", function (d) { return holcColors[d.holc]; })
        .attr("stroke", "#fffdf6")
        .attr("stroke-width", 0.8)
        .on("mouseover", function (event, d) { onHover(d, event); })
        .on("mousemove", onMove)
        .on("mouseout", onLeave)
        .merge(dots)
        .attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return d.y; });
    }

    function onHover(props, event) {
      tracts
        .attr("stroke", function (d) { return d.properties.GEOID === props.GEOID ? "#183e2c" : "rgba(24,62,44,.28)"; })
        .attr("stroke-width", function (d) { return d.properties.GEOID === props.GEOID ? 1.8 : 0.4; });
      dotGroup.selectAll("circle")
        .attr("r", function (d) { return d.GEOID === props.GEOID ? 7 : 4.2; })
        .attr("stroke", function (d) { return d.GEOID === props.GEOID ? "#183e2c" : "#fffdf6"; });
      const heat = (props.temp_diff > 0 ? "+" : "") + props.temp_diff;
      tip.style("display", "block").html(
        "<strong>" + shortName(props) + "</strong><br>HOLC " + (props.holc || "unrated") +
        "<br>Canopy " + (props.canopy * 100).toFixed(1) + "%" +
        "<br>Heat " + heat + "°F" +
        "<br>" + (props.dist_m / 1000).toFixed(2) + " km from Five Points"
      );
      onMove(event);
    }

    function onMove(event) {
      tip.style("left", (event.clientX + 14) + "px").style("top", (event.clientY + 14) + "px");
    }

    function onLeave() {
      tracts.attr("stroke", "rgba(24,62,44,.28)").attr("stroke-width", 0.4);
      dotGroup.selectAll("circle").attr("r", 4.2).attr("stroke", "#fffdf6");
      tip.style("display", "none");
    }

    d3.select("#eq-min").on("input", update);
    d3.select("#eq-max").on("input", update);
    update();
  });
})();

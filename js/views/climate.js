(function () {
  const host = document.getElementById("climate-chart");
  const tip = document.getElementById("climate-tip");
  if (!host || !tip || typeof d3 === "undefined") return;

  const rows = [
    { year: 2010, c: 15.827095647652945, f: 60.4887721657753, trendF: 61.73204907894129 },
    { year: 2011, c: 16.845178365707397, f: 62.32132105827331, trendF: 61.87616380665321 },
    { year: 2012, c: 17.527402480443318, f: 63.54932446479798, trendF: 62.02027853436513 },
    { year: 2013, c: 15.907676458358765, f: 60.63381762504578, trendF: 62.164393262077105 },
    { year: 2014, c: 15.935028572877249, f: 60.683051431179045, trendF: 62.30850798978903 },
    { year: 2015, c: 17.250412066777546, f: 63.05074172019958, trendF: 62.45262271750095 },
    { year: 2016, c: 17.852938890457153, f: 64.13529000282287, trendF: 62.59673744521292 },
    { year: 2017, c: 17.677977561950684, f: 63.82035961151123, trendF: 62.740852172924846 },
    { year: 2018, c: 17.121031761169434, f: 62.81785717010498, trendF: 62.88496690063677 },
    { year: 2019, c: 17.914958238601685, f: 64.24692482948304, trendF: 63.02908162834869 },
    { year: 2020, c: 17.156053344408672, f: 62.880896019935605, trendF: 63.17319635606067 },
    { year: 2021, c: 17.120718836784363, f: 62.81729390621185, trendF: 63.317311083772594 },
    { year: 2022, c: 17.059303045272827, f: 62.70674548149109, trendF: 63.46142581148452 },
    { year: 2023, c: 17.339295466740925, f: 63.21073184013367, trendF: 63.60554053919649 }
  ];

  const svg = d3.select(host).append("svg")
    .attr("role", "img")
    .attr("aria-label", "Atlanta annual average mean temperature from 2010 to 2023, with a rising trend line.");
  const plot = svg.append("g");
  const meanLine = plot.append("path").attr("fill", "none").attr("stroke", "#b87950").attr("stroke-width", 2.6);
  const trendLine = plot.append("path").attr("fill", "none").attr("stroke", "#183e2c").attr("stroke-width", 2).attr("stroke-dasharray", "6 5");
  const dots = plot.append("g");
  const xAxis = plot.append("g").attr("class", "climate-axis");
  const yAxis = plot.append("g").attr("class", "climate-axis");
  const yLabel = plot.append("text").attr("fill", "#386342").attr("font-size", 11).attr("font-weight", 800).attr("text-anchor", "middle");
  const grid = plot.append("g");

  function draw() {
    const box = host.getBoundingClientRect();
    if (box.width < 40 || box.height < 40) return;
    const margin = { top: 16, right: 18, bottom: 36, left: 52 };
    const width = box.width;
    const height = box.height;
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    svg.attr("viewBox", "0 0 " + width + " " + height);
    plot.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const x = d3.scalePoint().domain(rows.map(function (d) { return d.year; })).range([0, innerW]).padding(0.2);
    const y = d3.scaleLinear().domain([59, 66]).range([innerH, 0]);
    const line = d3.line().x(function (d) { return x(d.year); }).y(function (d) { return y(d.f); }).curve(d3.curveLinear);
    const trend = d3.line().x(function (d) { return x(d.year); }).y(function (d) { return y(d.trendF); });

    grid.selectAll("line")
      .data(y.ticks(7))
      .join("line")
      .attr("x1", 0)
      .attr("x2", innerW)
      .attr("y1", function (value) { return y(value); })
      .attr("y2", function (value) { return y(value); })
      .attr("stroke", "#d9cda9")
      .attr("stroke-dasharray", "3 5");

    trendLine.attr("d", trend(rows));
    meanLine.attr("d", line(rows));
    dots.selectAll("circle")
      .data(rows)
      .join("circle")
      .attr("cx", function (d) { return x(d.year); })
      .attr("cy", function (d) { return y(d.f); })
      .attr("r", 5)
      .attr("fill", "#b87950")
      .attr("stroke", "#fffdf6")
      .attr("stroke-width", 1.5)
      .on("mouseenter", function (event, d) { showTip(d, event); })
      .on("mousemove", moveTip)
      .on("mouseleave", hideTip);

    xAxis.attr("transform", "translate(0," + innerH + ")").call(d3.axisBottom(x).tickFormat(d3.format("d")));
    yAxis.call(d3.axisLeft(y).ticks(7).tickFormat(function (value) { return value + "°"; }));
    yLabel.attr("transform", "translate(-38," + (innerH / 2) + ") rotate(-90)").text("Mean temperature (°F)");
  }

  function showTip(d, event) {
    tip.innerHTML = "<strong>" + d.year + "</strong><br>Mean " + d.f.toFixed(1) + "°F (" + d.c.toFixed(1) + "°C)<br>Trend " + d.trendF.toFixed(1) + "°F";
    tip.style.display = "block";
    moveTip(event);
  }

  function moveTip(event) {
    tip.style.left = Math.min(event.clientX + 14, window.innerWidth - 220) + "px";
    tip.style.top = (event.clientY + 14) + "px";
  }

  function hideTip() {
    tip.style.display = "none";
  }

  draw();
  window.addEventListener("resize", draw);
  if (window.ResizeObserver) new ResizeObserver(draw).observe(document.getElementById("vis-climate"));
})();

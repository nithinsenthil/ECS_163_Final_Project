// Window dimensions
const width = window.innerWidth;
const height = window.innerHeight;

// Margins
const margins = {
  top: 50,
  bottom: 40,
  left: 80,
  right: 50,
};

// Title Height
const headerHeight = 100;

// Dimensions for all three charts
const chartDims = {
  chloropleth: {
    width: width,
    height: height,
    innerWidth: width - margins.left - margins.right,
    innerHeight: height - headerHeight - margins.top - margins.bottom,
  },
  bar: {
    width: width,
    height: height,
    innerWidth: width - margins.left - margins.right,
    innerHeight: height - headerHeight - margins.top - margins.bottom,
  },
  scatter: {
    width: width / 2,
    height: height / 2 - headerHeight / 2,
    innerWidth: width / 2 - margins.left - margins.right,
    innerHeight: height / 2 - headerHeight / 2 - margins.top - margins.bottom,
  },
};

const color = d3.scaleLinear().domain([0, 2000]).range(["#e0f2fe", "#0369a1"]);

d3.csv("data/calenviroscreen.csv").then((rawData) => {
  console.log("rawData", rawData);

  // Get border information
  const cts = new Map(
    ca.objects.cb_2015_california_county_20m.geometries.map((d) => [
      d.properties.GEOID,
      d.properties.NAME,
    ]),
  );
  const ctsDecoder = new Map(
    ca.objects.cb_2015_california_county_20m.geometries.map((d) => [
      d.properties.NAME,
      d.properties.GEOID,
    ]),
  );

  const rolled = d3.rollup(
    rawData,
    (v) => d3.mean(v, (d) => d.Pesticides),
    (d) => d.county.trim(),
  );
  const chloroplethData = new Map(
    Array.from(rolled, ([county, pesticides]) => [
      ctsDecoder.get(county),
      pesticides,
    ]),
  );
  console.log("chloroplethData", chloroplethData);

  const landArea = topojson.merge(
    ca,
    ca.objects.cb_2015_california_county_20m.geometries,
  );
  const projection = d3
    .geoConicConformal()
    .parallels([37 + 4 / 60, 38 + 26 / 60])
    .rotate([120 + 30 / 60], 0)
    .fitSize(
      [chartDims.chloropleth.innerWidth, chartDims.chloropleth.innerHeight],
      landArea,
    );
  const path = d3.geoPath(projection);
  countyFeats = topojson.feature(ca, ca.objects.cb_2015_california_county_20m);

  const chloroplethSvg = d3
    .select("#chloropleth-svg")
    .style("width", "100%")
    .style("height", "auto");

  // background
  chloroplethSvg
    .append("rect")
    .attr("width", chartDims.chloropleth.width)
    .attr("height", chartDims.chloropleth.height)
    .attr("x", 0)
    .attr("y", 0)
    .attr("fill", "white");

  // group for all map layers
  const g = chloroplethSvg.append("g").attr("id", "map-layers");

  // "land" from merged counties
  const land = g
    .append("g")
    .attr("id", "land")
    .append("path")
    .datum(landArea)
    .attr("fill", "white")
    .attr("stroke-width", 1.25)
    .attr("stroke", "white")
    .attr("stroke-line-join", "round")
    .attr("d", path);

  // county boundaries
  const countiesGroup = g.append("g").attr("id", "county-boundaries");

  countiesGroup
    .selectAll(".county")
    .data(countyFeats.features)
    .enter()
    .append("path")
    .attr("stroke-width", 1.25)
    .attr("stroke", "white")
    .attr("d", path)
    .attr("fill", (d) => color(chloroplethData.get(d.properties.GEOID)));
  // .on("mouseover", mouseover)
  // .on("mouseout", mouseout);




  // Select the bar-svg
  const barSvg = d3
    .selectAll("#bar-svg")
    .append("g")
    .attr("width", chartDims.bar.width)
    .attr("height", chartDims.bar.height);

  // Reduce data to Type_1 frequencies
  const barData = Array.from(
    d3.rollup(
      rawData,
      (v) => d3.mean(v, (d) => d.Pollution_Burden),
      (d) => d.county,
    ),
    ([county, Pollution_Burden]) => ({ county, Pollution_Burden }),
  );

  // Plot Title
  barSvg
    .append("text")
    .attr("x", chartDims.bar.width / 2)
    .attr("y", margins.top - 20)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .text("Counties vs Average Pollution Burden");

  // Create x and y axis

  // Compute x axis
  const barX1 = d3
    .scaleBand()
    .domain(barData.map((d) => d.county))
    .range([margins.left, margins.left + chartDims.bar.innerWidth])
    .padding(0.08);

  // Draw x axis
  barSvg
    .append("g")
    .attr(
      "transform",
      `translate(${0}, ${margins.top + chartDims.bar.innerHeight})`,
    )
    .call(d3.axisBottom(barX1))
    .selectAll("text")
    .attr("transform", `translate(0, 0) rotate(0)`)
    .attr("font-size", `0.6rem`)
    .attr("text-anchor", "start")
    .attr("transform", `translate(12, 8) rotate(75)`);
    

  // Label x axis
  barSvg
    .append("text")
    .attr("x", chartDims.bar.width / 2)
    .attr("y", chartDims.bar.height - 30)
    .attr("font-size", "14px")
    .attr("text-anchor", "middle")
    .text("Counties");

  // Compute y axis
  const barY1 = d3
    .scaleLinear()
    .domain([0, (d3.max(barData, (d) => d.Pollution_Burden) / 25 + 1) * 25])
    .range([margins.top + chartDims.bar.innerHeight, margins.top]);

  // Draw y axis
  barSvg
    .append("g")
    .attr("transform", `translate(${margins.left}, ${0})`)
    .call(d3.axisLeft(barY1))
    .selectAll("text")
    .attr("transform", `translate(0, 0) rotate(0)`)
    .attr("text-anchor", "end");

  // Label y axis
  barSvg
    .append("text")
    .attr(
      "transform",
      `translate(${margins.left - 30}, ${margins.top + chartDims.bar.innerHeight / 2}) rotate(-90)`,
    )
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .text("Average Pollution Burden");

  // Draw bars
  const rect = barSvg
    .append("g")
    .classed("mark", true)
    .selectAll("rect")
    .data(barData)
    .join("rect")
    .attr("class", "bars")
    .attr("x", (d) => barX1(d.county))
    .attr("y", (d) => barY1(d.Pollution_Burden))
    .attr("width", barX1.bandwidth())
    .attr(
      "height",
      (d) => margins.top + chartDims.bar.innerHeight - barY1(d.Pollution_Burden),
    )
    .style("fill", "#04787e")
    .attr("stroke", "black")
    .attr("stroke-width", 0.5);

  // Bar tooltips
  rect.append("title").text((d) => `County: ${d.county}\nPollution Burden: ${d.Pollution_Burden}`);
});

function zoom(s) {
  s.call(
    d3
      .zoom()
      .on("zoom", () =>
        s.select("#map-layers").attr("transform", d3.event.transform),
      )
      .scaleExtent([1, 18])
      .translateExtent([
        [0, 0],
        [chartDims.chloropleth.innerWidth, chartDims.chloropleth.innerHeight],
      ]),
  );
}

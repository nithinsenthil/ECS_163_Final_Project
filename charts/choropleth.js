const color = d3.scaleLinear().domain([0, 2000]).range(["#e0f2fe", "#0369a1"]);

function create_choropleth(rawData, id, chartDims, margins) {
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
    .select(id)
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
}

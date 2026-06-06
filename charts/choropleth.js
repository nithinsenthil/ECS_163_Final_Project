const colodr = d3.scaleLinear().domain([0, 2000]).range(["#e0f2fe", "#0369a1"]);

function color(value, dataType) {
  const pollutionBurdenColor = d3
    .scaleLinear()
    .domain([20, 55])
    .range(["#e0f2fe", "#0369a1"]);
  const pesticideColor = d3
    .scaleLinear()
    .domain([0, 4250])
    .range(["#e0f2fe", "#0369a1"]);
  const leadColor = d3
    .scaleLinear()
    .domain([20, 65])
    .range(["#e0f2fe", "#0369a1"]);
  const asthmaColor = d3
    .scaleLinear()
    .domain([20, 110])
    .range(["#e0f2fe", "#0369a1"]);
  const lowBirthWeightColor = d3
    .scaleLinear()
    .domain([0, 10])
    .range(["#e0f2fe", "#0369a1"]);

  switch (dataType) {
    case "Pollution Burden":
      return pollutionBurdenColor(value);
    case "Pesticides":
      return pesticideColor(value);
    case "Lead":
      return leadColor(value);
    case "Asthma":
      return asthmaColor(value);
    case "Low Birth Weight":
      return lowBirthWeightColor(value);
  }
}

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

  console.log(ctsDecoder);

  const pollutionBurdenRolled = d3.rollup(
    rawData,
    (v) => d3.mean(v, (d) => d.Pollution_Burden),
    (d) => d.county.trim(),
  );

  const pesticidesRolled = d3.rollup(
    rawData,
    (v) => d3.mean(v, (d) => d.Pesticides),
    (d) => d.county.trim(),
  );

  const leadRolled = d3.rollup(
    rawData,
    (v) => d3.mean(v, (d) => d.Lead),
    (d) => d.county.trim(),
  );

  const asthmaRolled = d3.rollup(
    rawData,
    (v) => d3.mean(v, (d) => d.Asthma),
    (d) => d.county.trim(),
  );

  const lowBirthWeightRolled = d3.rollup(
    rawData,
    (v) => d3.mean(v, (d) => d.Low_Birth_Weight),
    (d) => d.county.trim(),
  );

  console.log(lowBirthWeightRolled);

  const choroplethData = {
    "Pollution Burden": new Map(
      Array.from(pollutionBurdenRolled, ([county, Pollution_Burden]) => [
        ctsDecoder.get(county),
        Pollution_Burden,
      ]),
    ),
    Pesticides: new Map(
      Array.from(pesticidesRolled, ([county, Pesticides]) => [
        ctsDecoder.get(county),
        Pesticides,
      ]),
    ),
    Lead: new Map(
      Array.from(leadRolled, ([county, Lead]) => [
        ctsDecoder.get(county),
        Lead,
      ]),
    ),
    Asthma: new Map(
      Array.from(asthmaRolled, ([county, Asthma]) => [
        ctsDecoder.get(county),
        Asthma,
      ]),
    ),
    "Low Birth Weight": new Map(
      Array.from(lowBirthWeightRolled, ([county, Low_Birth_Weight]) => [
        ctsDecoder.get(county),
        Low_Birth_Weight,
      ]),
    ),
  };

  const maxVal = Math.max(
    ...[...choroplethData["Low Birth Weight"].values()].filter(
      (item) => item != undefined,
    ),
  ); // 42
  const minVal = Math.min(
    ...[...choroplethData["Low Birth Weight"].values()].filter(
      (item) => item != undefined,
    ),
  ); // 8
  console.log(minVal, maxVal);

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

  const dialDict = {};
  const dialOptions = ["Pollution Burden", "Pesticides", "Lead", "Asthma"];
  let selected = dialOptions[0];

  const chloroplethSvg = d3.select(id).style("width", "100%");

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
    .attr("transform", `translate(${margins.left}, ${margins.top})`)
    .attr("fill", "white")
    .attr("stroke-width", 1.25)
    .attr("stroke", "white")
    .attr("stroke-line-join", "round")
    .attr("d", path);

  drawCounties(selected);

  const radioGroup = chloroplethSvg
    .append("g")
    .attr(
      "transform",
      `translate(${chartDims.chloropleth.width / 4}, ${chartDims.chloropleth.height / 2})`,
    );

  const items = radioGroup
    .selectAll("g.radio-item")
    .data(dialOptions)
    .enter()
    .append("g")
    .attr("class", "radio-item")
    .attr("transform", (d, i) => `translate(0, ${i * 28})`)
    .style("cursor", "pointer")
    .on("click", function (event, d) {
      selected = d;
      updateRadios();
    });

  // Outer ring
  items
    .append("circle")
    .attr("cx", 8)
    .attr("cy", 8)
    .attr("r", 8)
    .attr("fill", "white")
    .attr("stroke", "#555")
    .attr("stroke-width", 1.5);

  // Inner dot (filled when selected)
  items
    .append("circle")
    .attr("class", "inner-dot")
    .attr("cx", 8)
    .attr("cy", 8)
    .attr("r", 4)
    .attr("fill", (d, i) => (i === 0 ? "#333" : "white"));

  // Label text
  items
    .append("text")
    .attr("x", 22)
    .attr("y", 13)
    .text((d) => d)
    .attr("font-size", "14px")
    .attr("fill", "#333");

  function updateRadios() {
    radioGroup
      .selectAll("g.radio-item")
      .select(".inner-dot")
      .attr("fill", (d) => (d === selected ? "#333" : "white"));

    // Redraw choropleth
    drawCounties(selected);
  }

  function drawCounties(selectedVar) {
    // county boundaries
    const countiesGroup = g.append("g").attr("id", "county-boundaries");

    const tooltip = document.getElementById("tooltip");
    const tooltipText = document.getElementById("tooltip-text");

    countiesGroup
      .selectAll(".county")
      .data(countyFeats.features)
      .enter()
      .append("path")
      .attr("class", "county")
      .attr("id", (d) => `county-${d.properties.GEOID}`)
      .attr("transform", `translate(${margins.left}, ${margins.top})`)
      .attr("stroke-width", 2)
      .attr("stroke-width", 1.25)
      .attr("stroke", "white")
      .attr("d", path)
      .attr("fill", (d) =>
        color(choroplethData[selectedVar].get(d.properties.GEOID), selectedVar),
      )
      .on("mouseover", function (event, d) {
        const [x, y] = path.centroid(d);
        d3.select(tooltip)
          .style("opacity", 1)
          .style("left", `${x + 28}px`)
          .style("top", `${y - 40}px`);

        tooltipText.textContent = `County: ${cts.get(d.properties.GEOID)}\n${getTextContent(selectedVar, d)}`;
        d3.selectAll(".county").style("stroke", "white");
        d3.select(this).raise().style("stroke", "black");
      })
      .on("mouseout", function (event, d) {
        d3.select(tooltip).style("opacity", 0);
        d3.selectAll(".county").style("stroke", "white");
      });
  }

  function getTextContent(selectedVar, d) {
    const pollutionBurden =
      (selectedVar == "Pollution Burden" ? "*" : "") +
      "Pollution Burden: " +
      choroplethData["Pollution Burden"].get(d.properties.GEOID).toFixed(2);
    const pesticides =
      (selectedVar == "Pesticides" ? "*" : "") +
      "Pesticides: " +
      choroplethData["Pesticides"].get(d.properties.GEOID).toFixed(2);
    const lead =
      (selectedVar == "Lead" ? "*" : "") +
      "Lead: " +
      choroplethData["Lead"].get(d.properties.GEOID).toFixed(2);
    const asthma =
      (selectedVar == "Asthma" ? "*" : "") +
      "Asthma: " +
      choroplethData["Asthma"].get(d.properties.GEOID).toFixed(2);

    return `${pollutionBurden}\n${pesticides}\n${lead}\n${asthma}\n`;
  }
}

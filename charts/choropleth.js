const colodr = d3.scaleLinear().domain([0, 2000]).range(["#e0f2fe", "#0369a1"]);

/**
 * Given a value and data type, calculate the corresponding color to use
 * for a county in the choropleth chart.
 *
 * @param {number} value Number value to use for the calculation.
 * @param {string} dataType Possible values: "Pollution Burden", "Pesticides", "Lead",
 *      "Asthma", "Low Birth Weight", "Poverty"
 * @returns
 */
function color(value, dataType) {
  const pollutionBurdenColor = d3
    .scaleLinear()
    .domain([20, 55])
    .range(["#E6F4EA", "#081C15"]);
  const pesticideColor = d3
    .scaleLinear()
    .domain([0, 4250])
    .range(["#E6F4EA", "#081C15"]);
  const leadColor = d3
    .scaleLinear()
    .domain([20, 65])
    .range(["#E6F4EA", "#081C15"]);
  const asthmaColor = d3
    .scaleLinear()
    .domain([20, 110])
    .range(["#FFF7ED", "#7C2D12"]);
  const lowBirthWeightColor = d3
    .scaleLinear()
    .domain([0, 10])
    .range(["#FFF7ED", "#7C2D12"]);
  const povertyColor = d3
    .scaleLinear()
    .domain([15, 50])
    .range(["#ede1ff", "#3b127c"]);

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
    case "Poverty":
      return povertyColor(value);
  }
}

/**
 * Create the choropleth for the page using d3.
 *
 * @param {any} rawData Data parsed by d3.csv from the dataset.
 * @param {string} id HTML element ID to create the visualization in.
 * @param {{width: number; height: number; innerWidth: number; innerHeight: number;}} chartDims
 *    Given dimensions for the chart (generally will be calculated dynamically)
 * @param {{top: number; right: number; bottom: number; left: number;}} margins
 *    Given margins for top, right, bottom, and left for the chart
 */
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

  // Create rollups for values that will be displayed

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

  const povertyRolled = d3.rollup(
    rawData,
    (v) => d3.mean(v, (d) => d.Poverty),
    (d) => d.county.trim(),
  );

  // Create object with mappings of counties to various metric values
  // for chosen attributes (pollution burden, pesticides, etc)
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
    Poverty: new Map(
      Array.from(povertyRolled, ([county, Poverty]) => [
        ctsDecoder.get(county),
        Poverty,
      ]),
    ),
  };

  // Merge counties
  const landArea = topojson.merge(
    ca,
    ca.objects.cb_2015_california_county_20m.geometries,
  );

  // Convert longitude/latitude values into x/y values for d3 to use
  const projection = d3
    .geoConicConformal()
    .parallels([37 + 4 / 60, 38 + 26 / 60])
    .rotate([120 + 30 / 60], 0)
    .fitSize(
      [chartDims.choropleth.innerWidth, chartDims.choropleth.innerHeight],
      landArea,
    );

  // Convert longitude/latitude values into SVG path
  const path = d3.geoPath(projection);

  // Convert TopoJSON into GeoJSON
  countyFeats = topojson.feature(ca, ca.objects.cb_2015_california_county_20m);

  // Radio dial options (1 per attribute)
  const dialOptions = [
    "Pollution Burden",
    "Pesticides",
    "Lead",
    "Asthma",
    "Poverty",
  ];

  // Store state of selected radio option
  let selected = dialOptions[0];

  // Select svg and initialize viewbox and configurations
  const svg = d3.select(id);
  svg
    .attr("viewBox", `0 0 ${chartDims.bar.width} ${chartDims.bar.height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  const choroplethSvg = svg.append("g");

  // background
  choroplethSvg
    .append("rect")
    .attr("width", chartDims.choropleth.width)
    .attr("height", chartDims.choropleth.height)
    .attr("x", 0)
    .attr("y", 0)
    .attr("fill", "white");

  // group for all map layers
  const g = choroplethSvg.append("g").attr("id", "map-layers");

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

  // Draw counties
  drawCounties(selected);

  // Create radio button group, used to toggle between variables
  const radioGroup = choroplethSvg
    .append("g")
    .attr("transform", `translate(20, ${chartDims.choropleth.height - 150})`);

  // Create items within the radio button group
  // Items have `click` event handlers
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

  // When a radio button is clicked, v
  /**
   * Visually update the selection within
   * the radio button group and redraw the choropleth to use values for the
   * newly selected attribute.
   */
  function updateRadios() {
    radioGroup
      .selectAll("g.radio-item")
      .select(".inner-dot")
      .attr("fill", (d) => (d === selected ? "#333" : "white"));

    // Redraw choropleth
    drawCounties(selected);
  }

  /**
   * Draw the counties on the map given a selected variable (lead, poverty, etc)
   * @param {string} selectedVar "Pollution burden", "Pesticides", "Lead", "Asthma", or "Poverty"
   */
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

      // On mousover, make the tooltip visible
      // and add a black outline to the
      .on("mouseover", function (event, d) {
        const [x, y] = path.centroid(d);
        d3.select(tooltip)
          .style("opacity", 1)
          .style("left", `${x + 28}px`)
          .style("top", `${y - 40}px`);

        tooltipText.textContent = `County: ${cts.get(d.properties.GEOID)}\n${getTextContent(selectedVar, d)}`;
        d3.selectAll(".county").style("stroke", "white");
        d3.select(this)
          .raise() // Move to front so adjacent outlines don't override black outline
          .style("stroke", "black")
          .attr("stroke-width", 2.5);
      })

      // When the mouse leaves hovering, restore the white outline
      // and hide the tooltip again
      .on("mouseout", function (event, d) {
        d3.select(tooltip).style("opacity", 0);
        d3.selectAll(".county")
          .style("stroke", "white")
          .attr("stroke-width", 1.25);
      });
  }

  /**
   * Generate the text content for the choropleth tooltip.
   * Compiles values for all variables, and marks selected variable with asterisk (*).
   *
   * @param {string} selectedVar "Pollution Burden", "Pesticides", "Lead", "Asthma", "Poverty"
   * @param {Object} d Data point for a specific county.
   * @returns {string} Text to use in tooltip.
   */
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
    const poverty =
      (selectedVar == "Asthma" ? "*" : "") +
      "Poverty: " +
      choroplethData["Poverty"].get(d.properties.GEOID).toFixed(2);

    return `${pollutionBurden}\n${pesticides}\n${lead}\n${asthma}\n${poverty}\n`;
  }
}

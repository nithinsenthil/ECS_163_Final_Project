/**
 * Create the barchart for the page using d3.
 *
 * @param {any} rawData Data parsed by d3.csv from the dataset.
 * @param {string} id HTML element ID to create the visualization in.
 * @param {{width: number; height: number; innerWidth: number; innerHeight: number;}} chartDims
 *    Given dimensions for the chart (generally will be calculated dynamically)
 * @param {{top: number; right: number; bottom: number; left: number;}} margins
 *    Given margins for top, right, bottom, and left for the chart
 */
function create_barchart(rawData, id, chartDims, margins) {
  // Select svg and initialize viewbox and configurations
  const svg = d3.select(id);
  svg
    .attr("viewBox", `0 0 ${chartDims.bar.width} ${chartDims.bar.height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  const barSvg = svg.append("g");

  const tooltip = d3.select("#bar-tooltip");
  const tooltipText = d3.select("#bar-tooltip-text");

  // Reduce data to Type_1 frequencies
  const barData = Array.from(
    d3.rollup(
      rawData,
      (v) => d3.mean(v, (d) => d.Pollution_Burden),
      (d) => d.county,
    ),
    ([county, Pollution_Burden]) => ({ county, Pollution_Burden }),
  );//.sort((a, b) => b.Pollution_Burden - a.Pollution_Burden);

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
    .style("fill", "#E5E7EB")
    .selectAll("text")
    .attr("transform", `translate(0, 0) rotate(0)`)
    .attr("font-size", `0.6rem`)
    .attr("text-anchor", "start")
    .attr("transform", `translate(12, 8) rotate(75)`);
    // .style("fill", "#E5E7EB")

  // Label x axis
  barSvg
    .append("text")
    .attr("x", chartDims.bar.width / 2)
    .attr("y", chartDims.bar.height - 10)
    .style("fill", "#374151")
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
    .style("fill", "#E5E7EB")
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
    .style("fill", "#374151")
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .text("Average Pollution Burden");

  // Draw bars
  const rect = window.bars = barSvg
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
    (d) =>
      margins.top + chartDims.bar.innerHeight - barY1(d.Pollution_Burden),
  )
  .style("fill", "#0F766E")
  .attr("stroke", "black")
  .attr("stroke-width", 0.5)
  .on("mouseover", function(event, d) {
    d3.select(this)
      .style("fill", "#FACC15")
      .attr("opacity", 0.8);

    tooltip
      .style("opacity", 1);

    tooltipText.text(
      `County: ${d.county}\nAverage Pollution Burden: ${d.Pollution_Burden.toFixed(2)}`
    );
  })
.on("mousemove", function(event) {
  tooltip
    .style("left", event.pageX + 12 + "px")
    .style("top", event.pageY - 28 + "px");
})
.on("mouseout", function() {
  d3.select(this)
    .style("fill", "#0F766E")
    .attr("opacity", 1);

  tooltip
    .style("opacity", 0);
});
}

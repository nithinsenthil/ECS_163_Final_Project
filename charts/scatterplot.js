function create_scatterplot(rawData, id, chartDims, margins) {
	// Select the scatter-svg
  const scatterSvg = d3
    .selectAll(id)
    .append("g")
    .attr("width", chartDims.scatter.width)
    .attr("height", chartDims.scatter.height);

  // Filter data attributes for scatterplot
  const scatterData = rawData.map((d) => ({
    Poverty: +d.Poverty,
    Education: +d.Education,
  }));

  // Plot Title
  scatterSvg
    .append("text")
    .attr("x", chartDims.scatter.width / 2)
    .attr("y", margins.top - 20)
    .attr("text-anchor", "middle")
    .style("font-size", `20px`)
    .style("font-weight", "bold")
    .text("Poverty vs Education");

  // Create x and y axis

  // Compute x axis
  const scatterX1 = d3
    .scaleLinear()
    .domain([0, d3.max(scatterData, (d) => d.Poverty)])
    .range([margins.left, margins.left + chartDims.scatter.innerWidth]);

  // Draw x axis
  scatterSvg
    .append("g")
    .attr(
      "transform",
      `translate(${0}, ${margins.top + chartDims.scatter.innerHeight})`,
    )
    .call(d3.axisBottom(scatterX1))
    .selectAll("text")
    .attr("transform", `translate(0, 0) rotate(0)`)
    .attr("text-anchor", "center");

  // Label x axis
  scatterSvg
    .append("text")
    .attr("x", chartDims.scatter.width / 2)
    .attr("y", chartDims.scatter.height - 90)
    .attr("font-size", "14px")
    .attr("text-anchor", "middle")
    .text("Poverty");

  // Compute y axis
  const scatterY1 = d3
    .scaleLinear()
    .domain([0, d3.max(scatterData, (d) => d.Education)])
    .range([margins.top + chartDims.scatter.innerHeight, margins.top]);

  // Draw y axis
  scatterSvg
    .append("g")
    .attr("transform", `translate(${margins.left}, ${0})`)
    .call(d3.axisLeft(scatterY1))
    .selectAll("text")
    .attr("transform", `translate(0, 0) rotate(0)`)
    .attr("text-anchor", "end");

  // Label y axis
  scatterSvg
    .append("text")
    .attr(
      "transform",
      `translate(${margins.left - 30}, ${margins.top + chartDims.scatter.innerHeight / 2}) rotate(-90)`,
    )
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .text("Education");

  // Draw circles
  const r = 2;
  const circles = scatterSvg
    .append("g")
    .classed("mark", true)
    .selectAll("circle")
    .data(scatterData)
    .join("circle")
    .classed("mark-circle", true)
    .attr("cx", (d) => scatterX1(d.Poverty))
    .attr("cy", (d) => scatterY1(d.Education))
    .attr("r", (d) => r)
    .style("fill", "#04787e")
    .style("fill-opacity", 0.9)
    .style("stroke", "black")
    .style("stroke-width", 0.8);

  // Circle tooltips
  circles
    .append("title")
    .text((d) => `Poverty: ${d.Poverty}\nEducation: ${d.Education}`);
}

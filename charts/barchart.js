function create_barchart(rawData, id, chartDims, margins) {
  const svg = d3.select(id);
  svg
    .attr("viewBox", `0 0 ${chartDims.bar.width} ${chartDims.bar.height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  const barSvg = svg.append("g");

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
    .attr("y", chartDims.bar.height - 10)
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
    .style("fill", "#04787e")
    .attr("stroke", "black")
    .attr("stroke-width", 0.5);

  // Bar tooltips
  rect
    .append("title")
    .text(
      (d) => `County: ${d.county}\nPollution Burden: ${d.Pollution_Burden}`,
    );
}
window.updateBar = function(step) {

  if (!window.bars) return;

  if (step === 1) {
    window.bars
      .transition()
      .duration(600)
      .style("fill", '#04787e')
      .attr("opacity", 0.7);
  }

  if (step === 2) {
    window.bars
      .transition()
      .duration(600)
      .style("fill", "#0F766E")
      .attr("opacity", 1);
  }

  if (step === 3) {
    window.bars
      .transition()
      .duration(600)
      .style("fill", '#FACC15')
      .attr("opacity", 0.5);
  }
};
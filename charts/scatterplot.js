function create_scatterplot(rawData, id, chartDims, margins) {
  const svg = d3.select(id);
  svg
    .attr("viewBox", `0 0 ${chartDims.bar.width} ${chartDims.bar.height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  const scatterSvg = svg.append("g");

  const clean = (v) => {
    if (v == null) return null;
    const n = +String(v).trim();
    return isNaN(n) ? null : n;
  };
    
  const scatterData = rawData.map(d => ({
      County: d.county.trim(),
      Poverty: clean(d.Poverty),
      Education: clean(d.Education)
    }))
    .filter(d =>
      d.Poverty != null &&
      d.Education != null
    );

  // Plot Title
  scatterSvg
    .append("text")
    .attr("x", chartDims.scatter.width / 2)
    .attr("y", margins.top - 20)
    .attr("text-anchor", "middle")
    .style("font-size", `20px`)
    .style("font-weight", "bold")
    .text("Poverty vs Education")
    .style("fill", "#1F2933");

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
    .attr("y", chartDims.scatter.height - 10)
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
  const r = 3;
  const circles = scatterSvg
    .append("g")
    .classed("mark", true)
    .selectAll("circle")
    .data(scatterData)
    .join("circle")
    .classed("mark-circle", true)
    .attr("cx", (d) => scatterX1(d.Poverty))
    .attr("cy", (d) => scatterY1(d.Education))
    .attr("r", 3)
    .style("fill", "#6D28D9")
    .style("fill-opacity", 0.9)
    .style("stroke", "#D1D5DB")
    .style("stroke-width", 0.8);

  // Circle tooltips
  circles
    .append("title")
    .text(
      (d) =>
        `County: ${d.County}\nPoverty: ${d.Poverty}\nEducation: ${d.Education}`,
    );

  circles
    .on("mouseover", function () {
      d3.select(this).raise().attr("r", 6).style("fill", "#FACC15");
    })
    .on("mouseout", function () {
      d3.select(this).attr("r", 3).style("fill", "#6D28D9");
    });
}

function create_barchart(rawData, id, chartDims, margins) {
  // Select the bar-svg
  const barSvg = d3
    .selectAll(id)
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

  // Sorting the counties from highest to lowest pollution burden

  const top10BarData = barData
    .sort((a, b) => b.Pollution_Burden - a.Pollution_Burden)
    //.slice(0, 10);

  // Plot Title
  barSvg
    .append("text")
    .attr("x", chartDims.bar.width / 2)
    .attr("y", margins.top - 20)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .text("Counties by Average Pollution Burden");

  // Create x and y axis

  // Compute x axis
  const barX1 = d3
    .scaleLinear()
    // [0, (d3.max(barData, (d) => d.Pollution_Burden) / 25 + 1) * 25]
    .domain([0, d3.max(top10BarData, (d) => d.Pollution_Burden)])
    .nice()
    .range([margins.left, margins.left + chartDims.bar.innerWidth])

  // Draw x axis
  barSvg
    .append("g")
    .attr(
      "transform",
      `translate(${0}, ${margins.top + chartDims.bar.innerHeight})`,
    )
    .call(d3.axisBottom(barX1))
    .selectAll("text")
    // .attr("transform", `translate(0, 0) rotate(0)`)
    // .attr("font-size", `0.6rem`)
    // .attr("text-anchor", "start")
    // .attr("transform", `translate(12, 8) rotate(75)`);

  // Label x axis
  barSvg
    .append("text")
    .attr("x", chartDims.bar.width / 2)
    .attr("y", chartDims.bar.height - 30)
    .attr("font-size", "14px")
    .attr("text-anchor", "middle")
    .text("Average Pollution Burden");

  // Compute y axis
  const barY1 = d3
    .scaleBand()
    .domain(top10BarData.map((d) => d.county))
    .range([margins.top + chartDims.bar.innerHeight, margins.top])
    .padding(0.05);

  // Draw y axis
  barSvg
    .append("g")
    .attr("transform", `translate(${margins.left}, ${0})`)
    .call(d3.axisLeft(barY1))
    .selectAll("text")
    .attr("font-size", "0.65rem")
    // .attr("transform", `translate(0, 0) rotate(0)`)
    .attr("text-anchor", "end");

  // Label y axis
  barSvg
    .append("text")
    .attr(
      "transform",
      `translate(${margins.left - 70}, ${margins.top + chartDims.bar.innerHeight / 2}) rotate(-90)`,
    )
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .text("County");

  // Draw horizontal bars
  const rect = barSvg
    .append("g")
    .classed("mark", true)
    .selectAll("rect")
    .data(top10BarData)
    .join("rect")
    .attr("class", "bars")
    .attr("x", margins.left)
    .attr("y", (d) => barY1(d.county))
    .attr("width", (d) => barX1(d.Pollution_Burden) - margins.left)
    .attr("height", barY1.bandwidth())
    // .attr(
    //   "height",
    //   (d) =>
    //     margins.top + chartDims.bar.innerHeight - barX1(d.Pollution_Burden),
    // )
    .style("fill", "#04787e")
    .attr("stroke", "black")
    .attr("stroke-width", 0.5);

  // Bar tooltips
  rect
    .append("title")
    .text(
      (d) => `County: ${d.county}\nPollution Burden: ${d.Pollution_Burden}`,
    );
  
  // Bar hover interaction
  rect
    .on("mouseover", function () {
    d3.select(this)
      .raise()
      .style("fill", "#FACC15")
      .attr("stroke", "#111827")
      .attr("stroke-width", 1.5);
    })
    .on("mouseout", function () {
    d3.select(this)
      .style("fill", "#04787e")
      .attr("stroke", "black")
      .attr("stroke-width", 0.5);
    });
}

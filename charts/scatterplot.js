/**
 * Create the scatterplot for the page using d3.
 *
 * @param {any} rawData Data parsed by d3.csv from the dataset.
 * @param {string} id HTML element ID to create the visualization in.
 * @param {{width: number; height: number; innerWidth: number; innerHeight: number;}} chartDims
 *    Given dimensions for the chart (generally will be calculated dynamically)
 * @param {{top: number; right: number; bottom: number; left: number;}} margins
 *    Given margins for top, right, bottom, and left for the chart
 */
function create_scatterplot(rawData, id, chartDims, margins) {
  // Select svg and initialize viewbox and configurations
  const svg = d3.select(id);
  svg
    .attr("viewBox", `0 0 ${chartDims.bar.width} ${chartDims.bar.height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  const scatterSvg = svg.append("g");

  /**
   *
   * @param {number} v Numerical value of a single datapoint
   * @returns A cleaned version of the value provided, or null if the provided value was invalid.
   */
  const clean = (v) => {
    if (v == null) return null;
    const n = +String(v).trim();
    return isNaN(n) ? null : n;
  };

  // Clean, trim, and filter data appropriately
  const scatterData = rawData
    .map((d) => ({
      County: d.county.trim(),
      Lead: clean(d.Lead),
      Asthma: clean(d.Asthma),
    }))
    .filter((d) => d.Lead != null && d.Asthma != null);

  // Plot Title
  scatterSvg
    .append("text")
    .attr("x", chartDims.scatter.width / 2)
    .attr("y", margins.top - 20)
    .attr("text-anchor", "middle")
    .style("font-size", `20px`)
    .style("font-weight", "bold")
    .text("Lead vs Asthma")
    .style("fill", "#1F2933");

  // Create x and y axis

  // Compute x axis
  const scatterX1 = d3
    .scaleLinear()
    .domain([0, d3.max(scatterData, (d) => d.Lead)])
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
    .text("Lead");

  // Compute y axis
  const scatterY1 = d3
    .scaleLinear()
    .domain([
      d3.min(scatterData, (d) => d.Asthma),
      d3.max(scatterData, (d) => d.Asthma),
    ])
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
    .text("Asthma");

  // Draw circles
  const r = 3;
  const circles = (window.circles = scatterSvg
    .append("g")
    .classed("mark", true)
    .selectAll("circle")
    .data(scatterData)
    .join("circle")
    .classed("mark-circle", true)
    .attr("cx", (d) => scatterX1(d.Lead))
    .attr("cy", (d) => scatterY1(d.Asthma))
    .attr("r", 3)
    .style("fill", "#0F766E")
    .style("fill-opacity", 0.9)
    .style("stroke", "#D1D5DB")
    .style("stroke-width", 0.8));

  // Circle tooltips
  circles
    .append("title")
    .text((d) => `County: ${d.County}\nLead: ${d.Lead}\nAsthma ${d.Asthma}`);

  circles
    // On mouseover, highlight and raise the circle to make it more visible
    .on("mouseover", function () {
      d3.select(this).raise().attr("r", 6).style("fill", "#FACC15");
    })
    // When the mouse leaves, restore the circle's original styling
    .on("mouseout", function () {
      d3.select(this).attr("r", 3).style("fill", "#0F766E");
    });
}

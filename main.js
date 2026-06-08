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

// Give special margins to the bar chart
// Bar chart requires more bottom margin to have enough space for county labels
const barChartMargins = {
  top: 50,
  bottom: 100,
  left: 80,
  right: 50,
};

/**
 * Given a JavaScript selector, target its wrapper and use the wrapper to calculate the chart dimensions
 *
 * @param {string} selector
 * @param {{top: number; right: number; bottom: number; left: number}} margins Object with
 *    the numerical values of margins to use for the chart visualization
 * @returns
 */
function getWrapperDims(selector, margins) {
  const wrapper = document.querySelector(selector).closest(".visWrapper");
  const { width, height } = wrapper.getBoundingClientRect();
  return {
    width,
    height,
    innerWidth: width - margins.left - margins.right,
    innerHeight: height - margins.top - margins.bottom,
  };
}

// Dimensions for all three charts, calculated with `getWrapperDims` helper function.
const chartDims = {
  bar: getWrapperDims("#bar-svg", barChartMargins),
  scatter: getWrapperDims("#scatter-svg", margins),
  chloropleth: getWrapperDims("#chloropleth-svg", margins),
};

/**
 * Process data from included SVG and create charts
 */
d3.csv("data/calenviroscreen.csv").then((rawData) => {
  create_choropleth(rawData, "#chloropleth-svg", chartDims, margins);
  create_barchart(rawData, "#bar-svg", chartDims, margins);
  create_scatterplot(rawData, "#scatter-svg", chartDims, margins);
});

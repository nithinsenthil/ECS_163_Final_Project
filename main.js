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

// Title Height
const headerHeight = 100;

/**
 * Given a JavaScript selector, target its wrapper and use the wrapper to calculate the chart dimensions
 * 
 * @param {string} selector 
 * @param {{top: number; right: number; bottom: number; left: number}} margins Object with
 *                          the numerical values of margins to use for the chart visualization
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

// Dimensions for all three charts
const chartDims = {
  chloropleth: {
    width: width,
    height: height,
    innerWidth: width - margins.left - margins.right,
    innerHeight: height - headerHeight - margins.top - margins.bottom,
  },
  bar: getWrapperDims(".chart", margins),
  scatter: {
    width: width,
    height: height,
    innerWidth: width - margins.left - margins.right,
    innerHeight: height - headerHeight - margins.top - margins.bottom,
  },
};

d3.csv("data/calenviroscreen.csv").then((rawData) => {
  console.log("rawData", rawData);

  create_choropleth(rawData, "#chloropleth-svg", chartDims, margins);

  create_barchart(rawData, "#bar-svg", chartDims, margins);

  create_scatterplot(rawData, "#scatter-svg", chartDims, margins);
});

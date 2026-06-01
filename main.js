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

// Dimensions for all three charts
const chartDims = {
  chloropleth: {
    width: width,
    height: height,
    innerWidth: width - margins.left - margins.right,
    innerHeight: height - headerHeight - margins.top - margins.bottom,
  },
  bar: {
    width: width,
    height: height,
    innerWidth: width - margins.left - margins.right,
    innerHeight: height - headerHeight - margins.top - margins.bottom,
  },
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

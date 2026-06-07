# Environmental Inequality in California
ECS 163 Final Project @ UC Davis \
Team 6 – Jessica Cornejo-Casildo, Nithin Senthil, Naomi Zhao, Annie Zuo

## Description
The repository is composed of three primary components: the data, the chart 
implementations and the structure that holds it together. The implementations 
were split in this format to reduce conflict in file changess when splitting 
work across the team. It also allows main.js to remain module in its use of 
creating visualizations.

### File Tree
```
ECS_163_Final_Project/
├── charts/
│   ├── barchart.js
│   ├── choropleth.js
│   └── scatterplot.js
├── data/
│   └── calenviroscreen.csv
│   └── california_06_counties.js
├── index.html
├── main.js
├── README.md
└── styles.css
```
### Files
`charts/barchart.js`: Holds all related d3 implementation components for the bar
chart \
`charts/choropleth.js`: Holds all related d3 implementation components for the 
choropleth \
`charts/scatterplot.js`: Holds all related d3 implementation components for the 
scatter plot \
`data/calenviroscreen.csv`: Dataset from which all the visualizations are 
derived \
`data/california_06_counties.js`: Holds coordinate mappings for all counties. It
is used in the choropleth to define the borders for each county \
`index.html`: Web page entry html, defines the page's static content \
`scrolljack.js`: Implements the transforms and opacity changes for
the scrolljacking animations by manually reading the scroll distance on the page on every scroll event.\
`main.js`: Defines chart margins, reads dataset and calls visualization 
implementations \
`README.md`: The current document \
`styles.css`: CSS stylesheet imported into index.html

## Installation
*Note: The dataset is relatively small so it has been included in the 
repository. No further action is required for the data.*

#### Requirements
- Visual Studio Code (or equivalent fork that can access extensions)
- [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension
- Web browser (Tested on Chrome/Firefox)

#### Install
- Clone the repository from [GitHub](https://github.com/nithinsenthil/ECS_163_Final_Project)

## Execution
#### Steps
- Open VS Code and navigate to the cloned repository
- Right click on the index.html file and select `Open with Live Server`
- Allow Live Server to spin up and note the port number used (can often be found
on the bottom toolbar in VS Code)
- Open your browser and enter the url `http://localhost:{port_number}` \
*Ex. http://localhost:5502/*

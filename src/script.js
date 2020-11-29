/*
    Malika Liyanage -101231500
    COS30045
*/

/**
 * Reads data from a csv file using the d3 library.
 * Returns null if the file cannot be read
 * @param {String} fileName - name of the file to be read
 */
const readFromCSV = async fileName => {
    let dataset = null;
    try {
        dataset = await d3.csv(fileName);
        return dataset;
    } catch (error) {
        alert(error);
    }
}

/**
 * Reads data from a json file using the d3 library.
 * Returns null if the file cannot be read
 * @param {String} fileName - name of the file to be read
 */
const readFromJSON = async fileName => {
    let dataset = null;
    try {
        dataset = await d3.json(fileName);
        return dataset;
    } catch (error) {
        alert(error);
    }
}

// taken from https://medium.com/@sahirnambiar/linear-least-squares-a-javascript-implementation-and-a-definitional-question-e3fba55a6d4b 
const findLineByLeastSquares = (values_x, values_y) => {
    let x_sum = 0;
    let y_sum = 0;
    let xy_sum = 0;
    let xx_sum = 0;
    let count = 0;

    /*
     * The above is just for quick access, makes the program faster
     */
    let x = 0;
    let y = 0;
    let values_length = values_x.length;

    if (values_length !== values_y.length) {
        throw new Error('The parameters values_x and values_y need to have same size!');
    }

    /*
     * Above and below cover edge cases
     */
    if (values_length === 0) {
        return [
            [],
            []
        ];
    }

    /*
     * Calculate the sum for each of the parts necessary.
     */
    for (let i = 0; i < values_length; i++) {
        x = values_x[i];
        y = values_y[i];
        x_sum += x;
        y_sum += y;
        xx_sum += x * x;
        xy_sum += x * y;
        count++;
    }

    /*
     * Calculate m and b for the line equation:
     * y = x * m + b
     */
    var m = (count * xy_sum - x_sum * y_sum) / (count * xx_sum - x_sum * x_sum);
    var b = (y_sum / count) - (m * x_sum) / count;

    /*
     * We then return the x and y data points according to our fit
     */
    var result_values_x = [];
    var result_values_y = [];

    for (let i = 0; i < values_length; i++) {
        x = values_x[i];
        y = x * m + b;
        result_values_x.push(x);
        result_values_y.push(y);
    }

    return [result_values_x, result_values_y];
}

/**
 * Draws a line chart using the chart.js library
 * 
 * @param {*} chart - Chart.js object
 * @param {*} dataset - Dataset to be plotted
 * @param {*} config - Chart.js configuration
 * @param {bool} drawTrendLine - Whether a trend line should be plotted or not
 */
const drawLineChart = (chart, dataset, config, drawTrendLine) => {
    let labels = new Array();
    let chartData = new Array();

    for (const data of dataset) {
        labels.push(parseFloat(data.Time))
        chartData.push(parseFloat(data.Amount))
    }

    config.data.labels = labels;
    config.data.datasets[0].data = chartData;
    if (drawTrendLine) {
        const trendLine = findLineByLeastSquares(labels, chartData);
        config.data.datasets[1].data = trendLine[1];
    }
    chart.config = config;
    chart.options = config.options;
    chart.update();
}

/**
 * Adds the passed options to a select element
 * @param {string} elementID - ID of the select element to add options to
 * @param {*} optionArray - Array containing option values
 */
const addSelectOptions = (elementID, optionArray) => {
    const element = document.getElementById(elementID);
    for (const option of optionArray) {
        const optionElement = document.createElement("option");
        optionElement.appendChild(document.createTextNode(option));
        optionElement.value = option;
        element.appendChild(optionElement);
    }

};

/**
 * Gets the year values from a line chart dataset and 
 * returns it as an array
 * @param {*} dataset - Line chart dataset
 */
const getYearValues = (dataset) => {
    let yearValues = new Array();
    for (const data of dataset) {
        const year = parseInt(data.Time, 10);
        if (!yearValues.includes(year)) {
            yearValues.push(year);
        }
    }
    return yearValues;
}


/**
 * Draws the co2 emission from fuel barchart
 * 
 * @param {*} datasets - Array which contains the three datasets which have to be plotted
 * @param {number} minYear - Starting year of teh dataset
 * @param {number} maxYear - Ending year of the dataset
 */
const drawCO2StackedBarChart = (datasets, minYear, maxYear) => {
    const ctx = document.getElementById("co2-fuel-chart").getContext("2d");
    const chart = new Chart(ctx);
    let co2GasFuelArr = [];
    let co2GLiquidFuelArr = [];
    let co2SolidFuelArr = [];
    let chartDatasets = [{
            label: "CO2 Emissions from Gaseous Fuel Consumption",
            data: new Array(maxYear - minYear + 1),
            backgroundColor: '#008837'
        },
        {
            label: "CO2 Emissions from Liquid Fuel Consumption",
            data: new Array(maxYear - minYear + 1),
            backgroundColor: '#f0544f'
        },
        {
            label: "CO2 Emissions from Solid Fuel Consumption",
            data: new Array(maxYear - minYear + 1),
            backgroundColor: '#7b3294'
        }
    ];
    chartDatasets[0].data.fill(0);
    chartDatasets[1].data.fill(0);
    chartDatasets[2].data.fill(0);
    const labels = [];

    /**
     * Loops through all three datasets and pushes the emission values from the
     * record with the World data
     */
    for (let i = minYear; i <= maxYear; i++) {
        let co2GasFuel = 0;
        let co2GLiquidFuel = 0;
        let co2SolidFuel = 0;

        labels.push(i);

        for (const element of datasets[0]) {
            if (element[i] !== "Not Recorded" && element["Country Name"] === "World") {
                co2GasFuel = parseFloat(element[i], 10);
            }
        }

        for (const element of datasets[1]) {
            if (element[i] !== "Not Recorded" && element["Country Name"] === "World") {
                co2GLiquidFuel = parseFloat(element[i], 10);
            }
        }

        for (const element of datasets[2]) {
            if (element[i] !== "Not Recorded" && element["Country Name"] === "World") {
                co2SolidFuel = parseFloat(element[i], 10);
            }
        }

        co2GasFuelArr.push(co2GasFuel);
        co2GLiquidFuelArr.push(co2GLiquidFuel);
        co2SolidFuelArr.push(co2SolidFuel);
    }

    chartDatasets[0].data = co2GasFuelArr;
    chartDatasets[1].data = co2GLiquidFuelArr;
    chartDatasets[2].data = co2SolidFuelArr;

    // chart.js config for stacked barchat
    const chartConfig = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: chartDatasets
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: "CO2 Emissions from Fuel Consumption",
                fontColor: "#fff"
            },
            tooltips: {
                mode: "index",
                intersect: false,
            },
            hover: {
                mode: "nearest",
                intersect: true
            },
            legend: {
                labels: {
                    fontColor: "#fff"
                }
            },
            scales: {
                xAxes: [{
                    display: true,
                    ticks: {
                        fontColor: "#fff"
                    },
                    scaleLabel: {
                        display: true,
                        labelString: "Year",
                        fontColor: "#fff"
                    },
                    gridLines: {
                        drawOnChartArea: false,
                        color: "#fff"
                    },
                    stacked: true,
                }],
                yAxes: [{
                    display: true,
                    ticks: {
                        fontColor: "#fff",
                        beginAtZero: true
                    },
                    scaleLabel: {
                        display: true,
                        labelString: "metric kiloton (kt)",
                        fontColor: "#fff"
                    },
                    gridLines: {
                        drawOnChartArea: false,
                        color: "#fff"
                    },
                    stacked: true,
                }]
            }
        }
    };

    chart.config = chartConfig;
    chart.options = chartConfig.options;
    chart.update();

    // adds event listener to filter element
    addSelectOptions("co2-fuel-year", labels);
    let selectedYear = "";
    document.getElementById("co2-fuel-year").addEventListener("change", function () {
        selectedYear = this.value;
        if (selectedYear !== "") {
            // disables stacking
            chartConfig.options.scales.xAxes[0].stacked = false;
            chartConfig.options.scales.yAxes[0].stacked = false;
            // gets the index of the selected year from the array
            const datasetIndex = labels.indexOf(parseInt(selectedYear, 10));
            chartConfig.data.labels = [labels[datasetIndex]];
            // gets the data for the selected year
            chartDatasets[0].data = [co2GasFuelArr[datasetIndex]];
            chartDatasets[1].data = [co2GLiquidFuelArr[datasetIndex]];
            chartDatasets[2].data = [co2SolidFuelArr[datasetIndex]];
        } else {
            // enables stacking
            chartConfig.options.scales.xAxes[0].stacked = true;
            chartConfig.options.scales.yAxes[0].stacked = true;
            chartConfig.data.labels = labels;
            chartDatasets[0].data = co2GasFuelArr;
            chartDatasets[1].data = co2GLiquidFuelArr;
            chartDatasets[2].data = co2SolidFuelArr;
        }
        chart.update();
    });
};


/**
 * Draws the co2 emission choropleth map
 * 
 * @param {*} dataset - Dataset with data to be plotted
 * @param {string} geoJSON - Name of the GeoJSON file
 * @param {number} minYear - Starting year of teh dataset
 * @param {number} maxYear - Ending year of the dataset
 */
const drawCO2GeoMap = (dataset, geoJSON, minYear, maxYear) => {
    let yearLabels = [];
    let countryInfoSet = [];

    let emissionIndex = 0;
    /**
     * Used to initialize yearLabels array with year value and fill the countryInfoSet object
     * array with data from the dataset
     */
    for (let i = minYear; i <= maxYear; i++) {
        yearLabels.push(i);

        for (const element of dataset) {

            /**
             * Checks if an element in the object array already with a particular country code
             * if not a new object is created and pushed into the array
             */
            if (!countryInfoSet.some(e => e.countryCode === element["Country Code"])) {
                let countryInfo = {
                    countryCode: element["Country Code"],
                    countryName: element["Country Name"],
                    emissions: new Array(maxYear - minYear + 1),
                    totalEmissions: 0
                }
                countryInfo.emissions.fill(0);
                countryInfoSet.push(countryInfo);
            }

            // gets the data from the dataset that matches the country code
            const selectedCountry = countryInfoSet.filter(e => e.countryCode === element["Country Code"]);
            if (element[i] !== "Not Recorded") {
                selectedCountry[0].emissions[emissionIndex] = parseFloat(element[i], 10);
            }
        }

        emissionIndex++;
    }

    // calculates the total emissions for every country in the countryInfoSet array
    for (const element of countryInfoSet) {
        element.totalEmissions = element.emissions.reduce((accumulator, currentValue) => accumulator + currentValue);
    }

    // adds the year filter options
    addSelectOptions("co2-global-year", yearLabels);


    /*
        The reset, zoomed and clicked function were created by referencing 
        https://observablehq.com/@d3/zoom-to-bounding-box?collection=@d3/d3-zoom
        an example from the d3-zoom documentation
    */
    const reset = () => {
        svg.transition().duration(750).call(
            zoom.transform,
            d3.zoomIdentity,
            d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
        );
    };

    const zoomed = event => {
        const g = svg.selectAll("path");
        const {
            transform
        } = event;
        g.attr("transform", transform);
        g.attr("stroke-width", 1 / transform.k);
    };

    const clicked = (event, d) => {
        const [
            [x0, y0],
            [x1, y1]
        ] = path.bounds(d);
        event.stopPropagation();
        svg.transition().duration(750).call(
            zoom.transform,
            d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
            .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
            d3.pointer(event, svg.node())
        );
    }


    const width = 300;
    const height = 300;

    const projection = d3.geoMercator()
        .center([0, 0])
        .translate([width / 2, height / 2])
        .scale(80);

    const path = d3.geoPath()
        .projection(projection);

    const color = d3.scaleThreshold()
        .range(
            ['#f2f0f7', '#cbc9e2', '#9e9ac8', '#756bb1', '#54278f']
        );

    const svg = d3.select("#co2-global-chart")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("fill", "grey")
        .on("click", reset);

    const legendContainer = d3.select("#co2-global-chart")
        .append("svg")
        .attr("viewBox", `0 0 ${100} ${100}`)
        .attr("fill", "grey")

    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", zoomed);

    /**
     * Calculates and returns the percentile of an array
     * Made by following this example
     * https://jsfiddle.net/PBrockmann/der72ot0/
     * 
     * @param {number[]) array - Number array
     * @param {number} percentile - Percentile to calculate
     */
    const quantile = (array, percentile) => {
        array.sort((a, b) => {
            return a - b;
        });
        const index = percentile / 100. * (array.length - 1);
        let result;
        if (Math.floor(index) == index) {
            result = array[index];
        } else {
            const i = Math.floor(index)
            const fraction = index - i;
            result = array[i] + (array[i + 1] - array[i]) * fraction;
        }
        return result;
    };

    /**
     * Filters the data according to passed year and draws the 
     * geo map using it
     * 
     * @param {string} selectedYear - The year the user has selected
     * @param {number} selectedYearIndex - The index of that year in the array
     */
    const drawGeoMap = (selectedYear, selectedYearIndex) => {
        // removes all child elements, used to reset the graph
        svg.selectAll('*').remove();

        d3.json(geoJSON)
            .then(json => {
                /*
                    selectedYear value is empty only when the user
                    selects the "All" option from the filter menu
                */
                if (selectedYear === "") {
                    let emissionValues = [];
                    for (const element of countryInfoSet) {
                        emissionValues.push(element.totalEmissions);
                    }
                    color.domain(
                        [
                            quantile(emissionValues, 80),
                            quantile(emissionValues, 84),
                            quantile(emissionValues, 88),
                            quantile(emissionValues, 92),
                            quantile(emissionValues, 96),
                        ]
                    );
                } else {
                    let emissionValues = [];
                    for (const element of countryInfoSet) {
                        emissionValues.push(element.emissions[selectedYearIndex]);
                    }
                    color.domain(
                        [
                            quantile(emissionValues, 80),
                            quantile(emissionValues, 84),
                            quantile(emissionValues, 88),
                            quantile(emissionValues, 92),
                            quantile(emissionValues, 96),
                        ]
                    );
                }

                /**
                 * legend was created following example from 
                 * https://d3-legend.susielu.com/#color-threshold
                 * the d3-legend documentation
                 */
                legendContainer
                    .attr("id", "legend-container")

                legendContainer.append("g")
                    .attr("class", "legendQuant")

                const legend = d3.legendColor()
                    .labelFormat(d3.format(".2f"))
                    .labels(d3.legendHelpers.thresholdLabels)
                    .scale(color)


                legendContainer.select(".legendQuant")
                    .call(legend);

                for (const row of countryInfoSet) {
                    const countryCode = row.countryCode;
                    let emissionValue = 0;

                    if (selectedYear === "") {
                        emissionValue = row.totalEmissions;
                    } else {
                        emissionValue = row.emissions[selectedYearIndex];
                    }

                    // writes the emission values in to the geo json
                    for (const element of json.features) {
                        if (element.properties.iso_a3 === countryCode) {
                            element.properties.value = parseFloat(emissionValue).toFixed(2);
                            break;
                        }
                    }

                }

                /**
                 * Loops through the geo json values. If it is undefined or 0 it's value
                 * is set to Not recorded
                 */
                for (const element of json.features) {
                    if (!("value" in element.properties) || element.properties.value <= 0) {
                        element.properties.value = "Not recorded";
                    }
                }

                // map plotting 
                svg.selectAll("path")
                    .data(json.features)
                    .enter()
                    .append("path")
                    .attr("d", path)
                    .style("fill", d => {
                        const value = d.properties.value;
                        if (value !== "Not recorded") {
                            return color(value);
                        } else {
                            return "#ccc";
                        }
                    })
                    .style("stroke", "transparent")
                    .attr("class", function (d) {
                        return "Country"
                    })
                    .style("opacity", .8)
                    /*
                        Hover effects were added following the example
                        https://www.d3-graph-gallery.com/graph/choropleth_hover_effect.html
                        on the d3 graph gallery page
                    */
                    .on("mouseover", function (d, i) {
                        d3.select("#tooltip")
                            .select("#tooltip-title")
                            .text(i.properties.name_sort);

                        d3.select("#tooltip")
                            .select("#tooltip-value")
                            .text(
                                `${i.properties.value === "Not recorded" ? "Not recorded" : `${i.properties.value} kt per capita`}`
                            );

                        d3.select("#tooltip").classed("hidden", false);

                        d3.selectAll(".Country")
                            .transition()
                            .duration(200)
                            .style("opacity", .4);

                        d3.select(this)
                            .transition()
                            .duration(200)
                            .style("opacity", 1);
                    })
                    .on("mouseleave", function (d, i) {
                        //Show the tooltip
                        d3.select("#tooltip").classed("hidden", true);
                        d3.selectAll(".Country")
                            .transition()
                            .duration(200)
                            .style("opacity", .8);
                    })
                    .on("click", clicked);


                svg.call(zoom);

            })
            .catch(error => {
                alert("There was a problem with loading the json file. Check the console for more details");
                console.error(error);
            });
    };

    // Adds event listener to the select options which redraws the map whenever the data is filtered
    let selectedYear = "";
    let selectedYearIndex = null;
    drawGeoMap(selectedYear, selectedYearIndex);
    document.getElementById("co2-global-year").addEventListener("change", function () {
        selectedYear = this.value;
        if (selectedYear !== "") {
            selectedYearIndex = yearLabels.indexOf(parseInt(selectedYear, 10));
        }
        drawGeoMap(selectedYear, selectedYearIndex);
    });



};


/**
 * Initializes all the charts that are shown in the page
 */
const initCharts = async () => {
    /**
     * Contains the chart.js configuration options for 
     * all the scatter/line charts that are to be plotted.
     * 
     * chartElementName: id of the html element the chart is to be drawn into
     * yearFilterElementName: id of the select element which is used to filter the chart data
     * datasetFile: filename of the dataset to be used
     * mainChartConfig: default chart configuration
     * filterChartConfig: chart config to be used after the dataset has been filtered
     * axisConfig: configuration of the chart axis
     */
    const lineChartConfig = [{
            chartElementName: "gistemp-chart",
            yearFilterElementName: "gistemp-year",
            datasetFile: "data/gistemp.csv",
            mainChartConfig: {
                type: "line",
                data: {
                    labels: null,
                    datasets: [{
                        showLine: false,
                        borderColor: "#663399",
                        data: null,
                        label: "LOTI Monthly Mean",
                    }, {
                        showLine: true,
                        fill: false,
                        borderColor: "#de1a1a",
                        data: null,
                        label: "Linear Trend (OLS)",
                        pointRadius: 0
                    }]
                },
            },
            filterChartConfig: {
                type: "line",
                data: {
                    labels: null,
                    datasets: [{
                        borderColor: "#663399",
                        data: null,
                        label: "LOTI Monthly Mean",
                        showLine: true,
                        fill: false
                    }]
                },
            },
            axisConfig: {
                options: {
                    responsive: true,
                    title: {
                        display: true,
                        text: "GISS Land-Ocean Temperature Index",
                        fontColor: "#fff"
                    },
                    tooltips: {
                        mode: "index",
                        intersect: false,
                    },
                    hover: {
                        mode: "nearest",
                        intersect: true
                    },
                    legend: {
                        labels: {
                            fontColor: "#fff"
                        }
                    },
                    scales: {
                        xAxes: [{
                            ticks: {
                                maxTicksLimit: 10,
                                fontColor: "#fff"
                            },
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: "Year",
                                fontColor: "#fff"
                            },
                            gridLines: {
                                drawOnChartArea: false,
                                color: "#fff"
                            }
                        }],
                        yAxes: [{
                            display: true,
                            ticks: {
                                fontColor: "#fff"
                            },
                            scaleLabel: {
                                display: true,
                                labelString: "Celsius (°C)",
                                fontColor: "#fff"
                            },
                            gridLines: {
                                drawOnChartArea: false,
                                color: "#fff"
                            }
                        }]
                    }
                }
            }
        },
        {
            chartElementName: "co2-chart",
            yearFilterElementName: "co2-year",
            datasetFile: "data/esrl-co2.csv",
            mainChartConfig: {
                type: "line",
                data: {
                    labels: null,
                    datasets: [{
                        borderColor: "#663399",
                        data: null,
                        label: "CO2 Monthly Mean",
                        showLine: false,
                    }, {
                        fill: false,
                        borderColor: "#de1a1a",
                        data: null,
                        label: "Linear Trend (OLS)",
                        pointRadius: 0
                    }]
                },
            },
            filterChartConfig: {
                type: "line",
                data: {
                    labels: null,
                    datasets: [{
                        borderColor: "#663399",
                        data: null,
                        label: "CO2 Monthly Mean",
                        showLine: true,
                        fill: false
                    }]
                },
            },
            axisConfig: {
                options: {
                    responsive: true,
                    title: {
                        display: true,
                        text: "Atmospheric CO2 at Mauna Loa Observatory",
                        fontColor: "#fff"
                    },
                    tooltips: {
                        mode: "index",
                        intersect: false,
                    },
                    hover: {
                        mode: "nearest",
                        intersect: true
                    },
                    legend: {
                        labels: {
                            fontColor: "#fff"
                        }
                    },
                    scales: {
                        xAxes: [{
                            ticks: {
                                maxTicksLimit: 10,
                                fontColor: "#fff"
                            },
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: "Year",
                                fontColor: "#fff"
                            },
                            gridLines: {
                                drawOnChartArea: false,
                                color: "#fff"
                            }
                        }],
                        yAxes: [{
                            display: true,
                            ticks: {
                                fontColor: "#fff"
                            },
                            scaleLabel: {
                                display: true,
                                labelString: "parts per million (ppm)",
                                fontColor: "#fff"
                            },
                            gridLines: {
                                drawOnChartArea: false,
                                color: "#fff"
                            }
                        }]
                    }
                }
            }
        },
        {
            chartElementName: "icelevel-n-chart",
            yearFilterElementName: "icelevel-n-year",
            datasetFile: "data/nsidc-seaice-n.csv",
            mainChartConfig: {
                type: "line",
                data: {
                    labels: null,
                    datasets: [{
                        borderColor: "#663399",
                        data: null,
                        label: "Monthly Sea Ice Index",
                        showLine: false,
                    }, {
                        fill: false,
                        borderColor: "#de1a1a",
                        data: null,
                        label: "Linear Trend (OLS)",
                        pointRadius: 0
                    }]
                },
            },
            filterChartConfig: {
                type: "line",
                data: {
                    labels: null,
                    datasets: [{
                        borderColor: "#663399",
                        data: null,
                        label: "Monthly Sea Ice Index",
                        showLine: true,
                        fill: false
                    }]
                },
            },
            axisConfig: {
                options: {
                    responsive: true,
                    title: {
                        display: true,
                        text: "NSIDC Arctic Sea Ice Index",
                        fontColor: "#fff"
                    },
                    tooltips: {
                        mode: "index",
                        intersect: false,
                    },
                    hover: {
                        mode: "nearest",
                        intersect: true
                    },
                    legend: {
                        labels: {
                            fontColor: "#fff"
                        }
                    },
                    scales: {
                        xAxes: [{
                            ticks: {
                                maxTicksLimit: 10,
                                fontColor: "#fff"
                            },
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: "Year",
                                fontColor: "#fff"
                            },
                            gridLines: {
                                drawOnChartArea: false,
                                color: "#fff"
                            }
                        }],
                        yAxes: [{
                            display: true,
                            ticks: {
                                fontColor: "#fff"
                            },
                            scaleLabel: {
                                display: true,
                                labelString: "%",
                                fontColor: "#fff"
                            },
                            gridLines: {
                                drawOnChartArea: false,
                                color: "#fff"
                            }
                        }]
                    }
                }
            }
        },
        {
            chartElementName: "icelevel-s-chart",
            yearFilterElementName: "icelevel-s-year",
            datasetFile: "data/nsidc-seaice-s.csv",
            mainChartConfig: {
                type: "line",
                data: {
                    labels: null,
                    datasets: [{
                        borderColor: "#663399",
                        data: null,
                        label: "Monthly Sea Ice Index",
                        showLine: false,
                    }, {
                        fill: false,
                        borderColor: "#de1a1a",
                        data: null,
                        label: "Linear Trend (OLS)",
                        pointRadius: 0
                    }]
                },
            },
            filterChartConfig: {
                type: "line",
                data: {
                    labels: null,
                    datasets: [{
                        borderColor: "#663399",
                        data: null,
                        label: "Monthly Sea Ice Index",
                        showLine: true,
                        fill: false
                    }]
                },
            },
            axisConfig: {
                options: {
                    responsive: true,
                    title: {
                        display: true,
                        text: "NSIDC Antarctic Sea Ice Index",
                        fontColor: "#fff"
                    },
                    tooltips: {
                        mode: "index",
                        intersect: false,
                    },
                    hover: {
                        mode: "nearest",
                        intersect: true
                    },
                    legend: {
                        labels: {
                            fontColor: "#fff"
                        }
                    },
                    scales: {
                        xAxes: [{
                            ticks: {
                                maxTicksLimit: 10,
                                fontColor: "#fff"
                            },
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: "Year",
                                fontColor: "#fff"
                            },
                            gridLines: {
                                drawOnChartArea: false,
                                color: "#fff"
                            }
                        }],
                        yAxes: [{
                            display: true,
                            ticks: {
                                fontColor: "#fff"
                            },
                            scaleLabel: {
                                display: true,
                                labelString: "%",
                                fontColor: "#fff"
                            },
                            gridLines: {
                                drawOnChartArea: false,
                                color: "#fff"
                            }
                        }]
                    }
                }
            }
        }
    ];

    // loops through all the chart configs and draws them
    for (const element of lineChartConfig) {
        const ctx = document.getElementById(element.chartElementName).getContext("2d");
        const chart = new Chart(ctx)
        const dataset = await readFromCSV(element.datasetFile);
        const datasetYearValues = getYearValues(dataset);

        element.mainChartConfig.options = element.axisConfig.options;
        element.filterChartConfig.options = element.axisConfig.options;

        // adds the year select options
        addSelectOptions(element.yearFilterElementName, datasetYearValues);
        // draws the chart
        drawLineChart(chart, dataset, element.mainChartConfig, true);

        let selectedYear = "";
        /*
            Adds an event listener to the select element used to filter the chart.
            This is used to switch configurations from the default to the filtered version and 
            vice versa
        */
        document.getElementById(element.yearFilterElementName).addEventListener("change", function () {
            selectedYear = this.value;
            if (selectedYear !== "") {
                /*
                    Filters the data according to selected year.
                */
                const filteredDataset = dataset.filter(data => data.Time >= selectedYear && data.Time <= selectedYear + 1);
                element.filterChartConfig.options.title.text = `${element.mainChartConfig.options.title.text} ${selectedYear}`;

                drawLineChart(chart, filteredDataset, element.filterChartConfig, false);
            } else {
                drawLineChart(chart, dataset, element.mainChartConfig, true);
            }
        });
    }

    //stacked bar chart
    const co2GasFuelDataset = await readFromCSV("data/API_EN.ATM.CO2E.GF.KT_DS2_en_csv_v2_1347792.csv");
    const co2GLiquidFuelDataset = await readFromCSV("data/API_EN.ATM.CO2E.LF.KT_DS2_en_csv_v2_1350621.csv");
    const co2SolidFuelDataset = await readFromCSV("data/API_EN.ATM.CO2E.SF.KT_DS2_en_csv_v2_1350043.csv");

    drawCO2StackedBarChart([co2GasFuelDataset, co2GLiquidFuelDataset, co2SolidFuelDataset], 1960, 2016);

    // geo map
    const co2GlobalPerCapita = await readFromCSV("data/API_EN.ATM.CO2E.PC_DS2_en_csv_v2_1680019.csv");
    drawCO2GeoMap(co2GlobalPerCapita, "data/custom.geo.json", 1960, 2016);

};

/**
 * Adds event listeners to the nav bar links. This is 
 * done to toggle the active class whenever they are clicked
 */
const setupNavLinks = () => {
    const navLinks = document.querySelectorAll("nav ul li a");

    for (const link of navLinks) {
        link.addEventListener("click", function () {
            const currentActive = document.getElementsByClassName("active");

            if (currentActive.length != 0) {
                currentActive[0].className = currentActive[0].className.replace(" active", "");
            }

            this.className += " active";
        });
    }
};


/**
 * Main function 
 */
const main = () => {
    setupNavLinks();
    initCharts();
};

window.addEventListener("load", main);
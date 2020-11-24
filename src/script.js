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
        return [ [], [] ];
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

const drawLineChart = (chart, dataset, config, drawTrendLine) => {
    let labels = new Array();
    let chartData = new Array();

    for (const data of dataset)
    {
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

const addSelectOptions = (elementID, optionArray) => {
    const element = document.getElementById(elementID);
    for (const option of optionArray)
    {
        const optionElement = document.createElement("option");
        optionElement.appendChild( document.createTextNode(option) );
        optionElement.value =  option; 
        element.appendChild(optionElement); 
    }

};

const getYearValues = (dataset) => {
    let yearValues = new Array();
    for (const data of dataset)
    {
        const year = parseInt(data.Time, 10);
        if(!yearValues.includes(year))
        {
            yearValues.push(year);
        }
    }
    return yearValues;
}


const drawCO2StackedBarChart = (datasets, minYear, maxYear) => {
    const ctx = document.getElementById("co2-fuel-chart").getContext("2d");
    const chart = new Chart(ctx);
    let co2GasFuelArr = [];
    let co2GLiquidFuelArr = [];
    let co2SolidFuelArr = [];
    let chartDatasets = [
        {
            label: "CO2 Emissions from Gaseous Fuel Consumption",
            data: new Array(maxYear - minYear + 1),
            backgroundColor: 'red'
        },
        {
            label: "CO2 Emissions from Liquid Fuel Consumption",
            data: new Array(maxYear - minYear + 1),
            backgroundColor: 'green'
        },
        {
            label: "CO2 Emissions from Solid Fuel Consumption",
            data: new Array(maxYear - minYear + 1),
            backgroundColor: 'blue'
        }
    ];
    chartDatasets[0].data.fill(0);
    chartDatasets[1].data.fill(0);
    chartDatasets[2].data.fill(0);
    const labels = [];
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
                text: "CO2 Emissions from Fuel Consumption"
            },
            tooltips: {
                mode: "index",
                intersect: false,
            },
            hover: {
                mode: "nearest",
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: "Year"
                    },
                    gridLines: {
                        drawOnChartArea: false,
                        color: "#000"
                    },
                    stacked: true,
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: "metric kiloton (kt)"
                    },
                    gridLines: {
                        drawOnChartArea: false,
                        color: "#000"
                    },
                    stacked: true,
                }]
            }
        }
    };

    chart.config = chartConfig;
    chart.options = chartConfig.options;
    chart.update();

    addSelectOptions("co2-fuel-year", labels);
    let selectedYear = "";
    document.getElementById("co2-fuel-year").addEventListener("change", function() {
        selectedYear = this.value;
        if (selectedYear !== "") {
            const datasetIndex = labels.indexOf(parseInt(selectedYear, 10));
            chartConfig.data.labels = [labels[datasetIndex]];
            chartDatasets[0].data = [co2GasFuelArr[datasetIndex]];
            chartDatasets[1].data = [co2GLiquidFuelArr[datasetIndex]];
            chartDatasets[2].data = [co2SolidFuelArr[datasetIndex]];
        } else {
            chartConfig.data.labels = labels;
            chartDatasets[0].data = co2GasFuelArr;
            chartDatasets[1].data = co2GLiquidFuelArr;
            chartDatasets[2].data = co2SolidFuelArr;
        }
        chart.update();
    });
};

const drawCO2GeoMap = (datasets, geoJSON, minYear, maxYear) => {
    let yearLabels = [];
    let countryInfoSet = [];

    // this is done because all three datasets have the same country list
    for(const element of datasets[0]) {
        if (!countryInfoSet.some(e => e.countryName === element["Country Name"])) {
            let countryInfo = {
                countryName: element["Country Name"],
                emissions: new Array(maxYear - minYear + 1),
                totalEmissions: 0
            } 
            countryInfo.emissions.fill(0);
            countryInfoSet.push(countryInfo);
        }
    }

    let emissionIndex = 0;
    for (let i = minYear; i <= maxYear; i++) {
        yearLabels.push(i);

        for(const element of datasets[0]) {
            const selectedCountry = countryInfoSet.filter(e => e.countryName === element["Country Name"]);
            if (element[i] !== "Not Recorded") {
                selectedCountry[0].emissions[emissionIndex] += parseFloat(element[i], 10);
            }
        }

        for(const element of datasets[1]) {
            const selectedCountry = countryInfoSet.filter(e => e.countryName === element["Country Name"]);
            if (element[i] !== "Not Recorded") {
                selectedCountry[0].emissions[emissionIndex] += parseFloat(element[i], 10);
            }
        }

        for(const element of datasets[2]) {
            const selectedCountry = countryInfoSet.filter(e => e.countryName === element["Country Name"]);
            if (element[i] !== "Not Recorded") {
                selectedCountry[0].emissions[emissionIndex] += parseFloat(element[i], 10);
            }
        }
        emissionIndex++;
    }

    for (const element of countryInfoSet) {
        element.totalEmissions = element.emissions.reduce((accumulator, currentValue) => accumulator + currentValue);
    }

    addSelectOptions("co2-global-year", yearLabels);
    const width = 300;
    const height = 300;

    const projection = d3.geoMercator()
                            .center([0, 0])
                            .translate([width / 2, height / 2])
                            .scale(80);

    const path = d3.geoPath()
                    .projection(projection);

    const color = d3.scaleQuantize()
                        .range(['#ffffb2','#fecc5c','#fd8d3c','#f03b20','#bd0026']);

    const svg = d3.select("#co2-global-chart")
                    .append("svg")
                    .attr("viewBox", `0 0 ${width} ${height}`)
                    .attr("fill", "grey");

    const drawGeoMap = (selectedYear, selectedYearIndex) => {
        svg.selectAll('*').remove();
        d3.json(geoJSON)
            .then(json => {
                for (const row of countryInfoSet) {
                    const countryName = row.countryName;
                    let emissionValue = 0;

                    if (selectedYear === "") {
                        color.domain([
                            d3.min(countryInfoSet, d => { return d.totalEmissions; }),
                            d3.max(countryInfoSet, d => { return d.totalEmissions; }),
                        ]);
                        emissionValue = row.totalEmissions;
                    } else {
                        color.domain([
                            d3.min(countryInfoSet, d => { return d.emissions[selectedYearIndex]; }),
                            d3.max(countryInfoSet, d => { return d.emissions[selectedYearIndex]; }),
                        ]);
                        emissionValue = row.emissions[selectedYearIndex];
                    }

                    for (const element of json.features) {
                        if (element.properties.name_sort === countryName) {
                            element.properties.value = emissionValue;
                            break;
                        }
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
                        if (value) { 
                            return color(value); 
                        } else { 
                            return "#ccc"; 
                        } 
                    }) 
                    .style("stroke", "transparent") 
                    .attr("class", function(d){ 
                        return "Country" 
                    }) 
                    .style("opacity", .8)
                    .on("mouseover", function (d, i) {
                        d3.select("#tooltip")
                            .select("#tooltip-title")
                            .text(i.properties.name_sort);

                        d3.select("#tooltip")
                            .select("#tooltip-value")
                            .text(parseInt(i.properties.value).toLocaleString());
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
                    .on("mouseleave", function(d, i)  {
                        //Show the tooltip
                        d3.select("#tooltip").classed("hidden", true);
                        d3.selectAll(".Country")
                            .transition()
                            .duration(200)
                            .style("opacity", .8);
                    });



            })
            .catch(error => {
                alert("There was a problem with loading the json file. Check the console for more details");
                console.error(error);
            });
    };

    let selectedYear = "";
    let selectedYearIndex = null;
    drawGeoMap(selectedYear, selectedYearIndex);
    document.getElementById("co2-global-year").addEventListener("change", function() {
        selectedYear = this.value;
        if (selectedYear !== "") {
            selectedYearIndex = yearLabels.indexOf(parseInt(selectedYear, 10));
        }
        drawGeoMap(selectedYear, selectedYearIndex);
    });

    
    
};


const initCharts = async () => {
    const lineChartConfig = [
        {
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
                        fill: false,
                        borderColor: "#de1a1a",
                        data: null,
                        label: "Linear Trend (OLS)"
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
                        text: "GISS Land-Ocean Temperature Index"
                    },
                    tooltips: {
                        mode: "index",
                        intersect: false,
                    },
                    hover: {
                        mode: "nearest",
                        intersect: true
                    },
                    scales: {
                        xAxes: [{
                            ticks: {
                                maxTicksLimit: 10
                            },
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: "Year"
                            },
                            gridLines: {
                                drawOnChartArea: false,
                                color: "#000"
                            }
                        }],
                        yAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: "Celsius (°C)"
                            },
                            gridLines: {
                                drawOnChartArea: false,
                                color: "#000"
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
                        label: "Linear Trend (OLS)"
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
                        text: "Atmospheric CO2 at Mauna Loa Observatory"
                    },
                    tooltips: {
                        mode: "index",
                        intersect: false,
                    },
                    hover: {
                        mode: "nearest",
                        intersect: true
                    },
                    scales: {
                        xAxes: [{
                            ticks: {
                                maxTicksLimit: 10
                            },
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: "Year"
                            },
                            gridLines: {
                                drawOnChartArea: false,
                                color: "#000"
                            }
                        }],
                        yAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: "parts per million (ppm)"
                            },
                            gridLines: {
                                drawOnChartArea: false,
                                color: "#000"
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
                        label: "Linear Trend (OLS)"
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
                        text: "NSIDC Artic Sea Ice Index"
                    },
                    tooltips: {
                        mode: "index",
                        intersect: false,
                    },
                    hover: {
                        mode: "nearest",
                        intersect: true
                    },
                    scales: {
                        xAxes: [{
                            ticks: {
                                maxTicksLimit: 10
                            },
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: "Year"
                            },
                            gridLines: {
                                drawOnChartArea: false,
                                color: "#000"
                            }
                        }],
                        yAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: "%"
                            },
                            gridLines: {
                                drawOnChartArea: false,
                                color: "#000"
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
                        label: "Linear Trend (OLS)"
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
                        text: "NSIDC Antartic Sea Ice Index"
                    },
                    tooltips: {
                        mode: "index",
                        intersect: false,
                    },
                    hover: {
                        mode: "nearest",
                        intersect: true
                    },
                    scales: {
                        xAxes: [{
                            ticks: {
                                maxTicksLimit: 10
                            },
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: "Year"
                            },
                            gridLines: {
                                drawOnChartArea: false,
                                color: "#000"
                            }
                        }],
                        yAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: "%"
                            },
                            gridLines: {
                                drawOnChartArea: false,
                                color: "#000"
                            }
                        }]
                    }
                }
            }
        }
    ];

    for (const element of lineChartConfig) {
        const ctx = document.getElementById(element.chartElementName).getContext("2d");
        const chart = new Chart(ctx)
        const dataset = await readFromCSV(element.datasetFile);
        const datasetYearValues = getYearValues(dataset);

        element.mainChartConfig.options = element.axisConfig.options;
        element.filterChartConfig.options = element.axisConfig.options;
        addSelectOptions(element.yearFilterElementName, datasetYearValues);
        drawLineChart(chart, dataset, element.mainChartConfig, true);

        let selectedYear = "";
        document.getElementById(element.yearFilterElementName).addEventListener("change", function() {
            selectedYear = this.value;
            if (selectedYear !== "") {
                const filteredDataset = dataset.filter(data => data.Time >= selectedYear && data.Time <= selectedYear + 1);
                element.filterChartConfig.options.title.text = `${element.mainChartConfig.options.title.text} ${selectedYear}`;

                drawLineChart(chart, filteredDataset, element.filterChartConfig, false);
            } else {
                drawLineChart(chart, dataset, element.mainChartConfig, true);
            }
        });
    }

    const co2GasFuelDataset = await readFromCSV("data/API_EN.ATM.CO2E.GF.KT_DS2_en_csv_v2_1347792.csv");
    const co2GLiquidFuelDataset = await readFromCSV("data/API_EN.ATM.CO2E.LF.KT_DS2_en_csv_v2_1350621.csv");
    const co2SolidFuelDataset = await readFromCSV("data/API_EN.ATM.CO2E.SF.KT_DS2_en_csv_v2_1350043.csv");

    drawCO2StackedBarChart([co2GasFuelDataset, co2GLiquidFuelDataset, co2SolidFuelDataset], 1960, 2016);

    drawCO2GeoMap([co2GasFuelDataset, co2GLiquidFuelDataset, co2SolidFuelDataset], "data/custom.geo.json", 1960, 2016);

};

const main = async () => {
    initCharts();
};

window.addEventListener("load", main);
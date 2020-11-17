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
            data: [],
            backgroundColor: '#801336'
        },
        {
            label: "CO2 Emissions from Liquid Fuel Consumption",
            data: [],
            backgroundColor: '#ee4540'
        },
        {
            label: "CO2 Emissions from Solid Fuel Consumption",
            data: [],
            backgroundColor: '#c72c41'
        }
    ];
    const labels = [];
    for (let i = minYear; i <= maxYear; i++) {
        let co2GasFuel = 0;
        let co2GLiquidFuel = 0;
        let co2SolidFuel = 0;

        labels.push(i);

        for (const element of datasets[0]) {
            if (element[i] !== "Not Recorded") {
                co2GasFuel += parseFloat(element[i], 10);
            }
        }

        for (const element of datasets[1]) {
            if (element[i] !== "Not Recorded") {
                co2GLiquidFuel += parseFloat(element[i], 10);
            }
        }

        for (const element of datasets[2]) {
            if (element[i] !== "Not Recorded") {
                co2SolidFuel += parseFloat(element[i], 10);
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
                    stacked: true
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
                    stacked: true
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


const initCharts = async () => {
    const co2GasFuelDataset = await readFromCSV("data/API_EN.ATM.CO2E.GF.KT_DS2_en_csv_v2_1347792.csv");
    const co2GLiquidFuelDataset = await readFromCSV("data/API_EN.ATM.CO2E.LF.KT_DS2_en_csv_v2_1350621.csv");
    const co2SolidFuelDataset = await readFromCSV("data/API_EN.ATM.CO2E.SF.KT_DS2_en_csv_v2_1350043.csv");

    drawCO2StackedBarChart([co2GasFuelDataset, co2GLiquidFuelDataset, co2SolidFuelDataset], 1960, 2019);

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
                        borderColor: "#663399",
                        data: null,
                        label: "LOTI Monthly Mean",
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
                        text: "Land-Ocean Temperature Index Global Mean"
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
                element.filterChartConfig.options.title.text = `${element.axisConfig.options.title.text} ${selectedYear}`;

                drawLineChart(chart, filteredDataset, element.filterChartConfig, false);
            } else {
                drawLineChart(chart, dataset, element.mainChartConfig, true);
            }
        });
    }
};

const main = () => {
    initCharts();
};

window.addEventListener("load", main);
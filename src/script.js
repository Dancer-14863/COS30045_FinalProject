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

const initGistempChart = async () => {
    const ctx = document.getElementById("gistemp-chart").getContext("2d");
    const myLine = new Chart(ctx)
    const gistempDataset = await readFromCSV("data/gistemp.csv");
    const gistempConfig = {
        type: "line",
        data: {
            labels: null,
            datasets: [{
                borderColor: "#663399",
                data: null,
                label: "LOTI Global Mean",
                showLine: false,
            }, {
                fill: false,
                borderColor: "#de1a1a",
                data: null,
                label: "Linear Trend (OLS)"
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: "GISTEMP LOTI Global Mean (1960 - 2019)"
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
                        labelString: "LOTI Global Mean"
                    },
                    gridLines: {
                        drawOnChartArea: false,
                        color: "#000"
                    }
                }]
            }
        }
    };
    const gistempFilteredConfig = {
        type: "line",
        data: {
            labels: null,
            datasets: [{
                borderColor: "#663399",
                data: null,
                label: "LOTI Global Mean",
                showLine: true,
                fill: false
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
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
                        labelString: "LOTI Global Mean"
                    },
                    gridLines: {
                        drawOnChartArea: false,
                        color: "#000"
                    }
                }]
            }
        }
    };
    const gistempYearValues = getYearValues(gistempDataset);
    addSelectOptions("gistemp-year", gistempYearValues);
    drawLineChart(myLine, gistempDataset, gistempConfig, true);

    let selectedYear = "";
    document.getElementById("gistemp-year").addEventListener("change", function() {
        selectedYear = this.value;
        if (selectedYear !== "") {
            const filteredDataset = gistempDataset.filter(data => data.Time >= selectedYear && data.Time <= selectedYear + 1);
            gistempFilteredConfig.options.title.text = `GISTEMP LOTI Global Mean ${selectedYear}`;
            drawLineChart(myLine, filteredDataset, gistempFilteredConfig, false);
        } else {
            drawLineChart(myLine, gistempDataset, gistempConfig, true);
        }
    });

};

const initCharts = () => {
    initGistempChart();
};

const main = () => {
    initCharts();
};

window.addEventListener("load", main);
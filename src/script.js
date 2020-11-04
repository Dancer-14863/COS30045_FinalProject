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

const initLineChart = async () => {
    const dataset = await readFromCSV("data/gistemp.csv");

    let labels = new Array();
    let chartData = new Array();

    let yearValues = new Array();
    for (const data of dataset)
    {
        const year = parseInt(data.Time, 10);
        if (!labels.includes(year)) {
            labels.push(year);
            yearValues.push({ values: new Array() });
        }
        yearValues[yearValues.length - 1].values.push(parseFloat(data.Amount, 10));
    }

    for (const record of yearValues)
    {
        const yearAverage = record.values.reduce((a, b) => a + b, 0) / record.values.length;
        chartData.push(yearAverage.toFixed(2));
    }

    const config = {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                fill: false,
                borderColor: "#663399",
                data: chartData,
                label: "LOTI Global Mean"
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: "GISTEMP LOTI Global Mean (1880 - 2019)"
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
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: "LOTI Global Mean"
                    }
                }]
            }
        }
    };

    const ctx = document.getElementById("gistemp-chart").getContext("2d");

    const myLine = new Chart(ctx, config)
}

const main = () => {
    initLineChart();
};

window.addEventListener("load", main);
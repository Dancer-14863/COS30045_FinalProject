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
    let currentYearTotal = 0;
    let currentYearNum = 0;

    labels.push(parseInt(dataset[0].Time, 10));
    for (const data of dataset)
    {
        currentYearTotal += parseFloat(data.Amount, 10);
        currentYearNum++;

        const year = parseInt(data.Time, 10);
        if (!labels.includes(year)) {
            labels.push(year);
            const averageTemp = currentYearTotal / currentYearNum;
            chartData.push(averageTemp.toFixed(2));
            currentYearTotal = 0;
            currentYearNum = 0;
        }
    }

    const config = {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                fill: false,
                borderColor: "#663399",
                data: chartData,
                label: "Average GISTEMP"
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: "Test"
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
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: "Average change in GISTEMP"
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
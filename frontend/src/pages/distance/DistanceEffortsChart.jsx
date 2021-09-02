import { Scatter } from 'react-chartjs-2';
import { secondsToString } from '../../utils/secondsToString';
import { withRouter } from 'react-router-dom';

const getXBy = (date, type) => {
    if (type === 'allTime') {
        return date.getFullYear();
    }
    else if (type === 'season') {
        return date.getMonth() + 1;
    }
}

const getData = (efforts, type, selectedSeason) => {
    let data = [];
    for (let effort of efforts) {
        const date = new Date(effort.activity.date);

        data.push({
            x: getXBy(date, type),
            y: effort.time,
            id: effort.activity.id,
            date: date.toISOString().split("T")[0],
            dateObj: date,
            name: effort.activity.name
        });
    }

    function compare(d1, d2) {
        if (d1.dateObj.getTime() < d2.dateObj.getTime())
            return -1;
        if (d1.dateObj.getTime() > d2.dateObj.getTime())
            return 1;
        return 0;
    }

    data.sort(compare);

    if (type == 'season') {
        data = data.filter(x => x.dateObj.getFullYear() == selectedSeason);
    }

    const bestData = [];
    let bestPoint;
    let currX;
    for (let p of data) {
        if (p.x != currX) {
            bestData.push(bestPoint);
            bestPoint = p;
            currX = p.x;
        }
        else if (p.y < bestPoint.y) {
            bestPoint = p;
        }
    }
    if (bestPoint != undefined) {
        bestData.push(bestPoint);
    }

    bestData.shift(1);
    return bestData;
}

const DistanceEffortsChart = props => {
    const generateOptions = (type) => {
        const options = {
            animation: {
                duration: 0
            },
            hover: {
                mode: 'nearest'
            },
            plugins: {
                tooltip: {
                    mode: "nearest",
                    axis: "x",
                    intersect: false,
                    animationDuration: 0,
                    displayColors: false,
                    callbacks: {
                        label: (ctx) => {
                            return [
                                "Time: " + secondsToString(ctx.raw.y),
                                "Date: " + ctx.raw.date,
                                "Activity: " + ctx.raw.name
                            ];
                        },
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    title: {
                        display: true,
                        text: type == 'season' ? 'Month' : 'Year'
                    },
                    ticks: {
                        stepSize: 1
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                }
            },
            onClick: (ctx) => {
                const data = ctx.chart.config._config.data.datasets[0].data;
                const ix = ctx.chart.getElementsAtEventForMode(ctx, "index", {}, false)[0].index;
                const item = data[ix];
                props.history.push("/activities/" + item.id);
            },
            point: {
                radius: 0,
                hitRadius: 1000,
                hoverRadius: 0
            }
        }

        if (type == 'season') {
            options.scales.x.min = 1;
            options.scales.x.max = 12;
        }
        
        return options;
    };

    const data = getData(props.efforts, props.type, props.selectedSeason);

    const chartData = {
        datasets: [{
            label: 'Time',
            backgroundColor: "#00aaff",
            borderColor: "#00aaff",
            data: data,
            type: 'line',
            pointRadius: 3,
            fill: false,
            lineTension: 0,
            borderWidth: 2
        }]
    }

    return (
        <>
            <Scatter data={chartData} options={generateOptions(props.type)} height={60} />
        </>
    );
}
export default withRouter(DistanceEffortsChart);


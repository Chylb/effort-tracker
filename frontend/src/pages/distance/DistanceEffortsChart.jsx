
import { Scatter } from 'react-chartjs-2';
import { secondsToString } from '../../utils/secondsToString';
import { withRouter } from 'react-router-dom';

const getXBy = (date, by) => {
    if (by === 'year') {
        return date.getFullYear();
    }
    else if (by === 'month') {
        return date.getMonth() + 1;
    }
}

const DistanceEffortsChart = props => {
    const generateOptions = (by) => {
        return {
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
                        text: by == 'month' ? 'Month' : 'Year'
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
    };

    const data = [];
    for (let d of props.data) {
        data.push({
            x: getXBy(new Date(d.activity.date), props.by),
            y: d.time,
            id: d.activity.id,
            date: new Date(d.activity.date).toISOString().split("T")[0],
            name: d.activity.name
        });
    }

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
            <Scatter data={chartData} options={generateOptions(props.by)} height={60} />
        </>
    );
}
export default withRouter(DistanceEffortsChart);


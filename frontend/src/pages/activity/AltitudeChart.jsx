
import { Scatter } from 'react-chartjs-2';
import { secondsToString } from '../../utils/secondsToString';

const options = {
    animation: {
        duration: 0,
    },
    plugins: {
        tooltip: {
            mode: "nearest",
            axis: "x",
            intersect: true,
            animationDuration: 0,
            displayColors: false,
            callbacks: {
                label: (ctx) => {
                    const datasetCount = ctx.chart.config._config.data.datasets.length;
                    if (ctx.datasetIndex == 0 && datasetCount == 1 || ctx.datasetIndex == 1)
                        return [
                            "Time: " + secondsToString(ctx.raw.time),
                            "Dist: " + ctx.raw.x,
                            "Elev: " + ctx.raw.y]
                },
            }
        },
        legend: {
            display: false
        }
    },
    elements: {
        point: {
            radius: 0,
            hitRadius: 1000,
            hoverRadius: 0
        }
    },
    scales: {
        x: {
            type: 'linear',
            title: {
                display: true,
                text: 'Distance [m]'
            }
        },
        y: {
            title: {
                display: true,
                text: 'Elevation [m]'
            }
        }
    }
};

const getDataset = (data, isEffort) => {
    return {
        label: isEffort ? 'Effort' : 'Activity',
        backgroundColor: isEffort ? "#b9b9b9" : "#d9d9d9",
        borderColor: isEffort ? "#b9b9b9" : "#d9d9d9",
        data: data,
        type: 'line',
        fill: true,
    }
}

export const AltitudeChart = props => {
    const data = [];
    for (let i = 0; i < props.streams.altitude.original_size; i++) {
        const row = {
            x: props.streams.distance.data[i],
            y: props.streams.altitude.data[i],
            time: props.streams.time.data[i]
        };
        data.push(row);
    }

    const chartData = {
        datasets: []
    }
    if (props.effort)
        chartData.datasets.push(getDataset(data.slice(props.effort.ix0, props.effort.ix1), true))

    chartData.datasets.push(getDataset(data));

    return (
        <>
            <Scatter data={chartData} options={options} height={60} />
        </>
    );
}


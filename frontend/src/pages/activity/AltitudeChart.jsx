
import { Scatter } from 'react-chartjs-2';
import { secondsToString } from '../../utils/secondsToString';

const removeDuplicatePoints = (streams, effort) => {
    let i = 1;
    const distanceStream = streams.distance.data;
    const altitudeStream = streams.altitude.data;
    while (i < distanceStream.length) {
        const prev = distanceStream[i - 1];
        const curr = distanceStream[i];
        if (curr <= prev) {
            distanceStream.splice(i, 1);
            altitudeStream.splice(i, 1);

            if (effort !== undefined) {
                if (i <= effort.ix0)
                    effort.ix0--;

                if (i <= effort.ix1)
                    effort.ix1--;
            }
        }
        else {
            i++;
        }
    }
}

const generateOptions = (minmax) => {
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
                },
                ticks: {
                    stepSize: 5
                }
            }
        }
    };

    if (minmax != undefined) {
        options.scales.y.min = minmax[0];
        options.scales.y.max = minmax[1];
    }

    return options;
}

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

const optimalChartMinmax = (altitude) => {
    const min = Math.min(...altitude);
    const max = Math.max(...altitude);
    const span = max - min;
    const minSpan = 20;
    if (span < minSpan) {
        const deficit = minSpan - span;
        const rounding = 5;
        const newMin = Math.floor(min - deficit / 2);
        const newMax = Math.ceil(max + deficit / 2) + 5;
        return [newMin - newMin % rounding, newMax - newMax % rounding];
    }
    return;
}

export const AltitudeChart = props => {
    const data = [];
    const streamsCopy = JSON.parse(JSON.stringify(props.streams));
    const effortCopy = props.effort !== undefined ? JSON.parse(JSON.stringify(props.effort)) : undefined;

    removeDuplicatePoints(streamsCopy, effortCopy);

    for (let i = 0; i < streamsCopy.altitude.original_size; i++) {
        const row = {
            x: streamsCopy.distance.data[i],
            y: streamsCopy.altitude.data[i],
            time: streamsCopy.time.data[i]
        };
        data.push(row);
    }

    const chartData = {
        datasets: []
    }
    if (props.effort)
        chartData.datasets.push(getDataset(data.slice(effortCopy.ix0, effortCopy.ix1), true))

    chartData.datasets.push(getDataset(data));

    return (
        <>
            <Scatter data={chartData} options={generateOptions(optimalChartMinmax(streamsCopy.altitude.data))} height={60} />
        </>
    );
}


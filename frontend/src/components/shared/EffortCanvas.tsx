import React, { useEffect, useRef } from 'react';
import Chart, { ChartConfiguration } from 'chart.js';
import { secondsToString } from '../../utils/secondsToString';
import { Effort } from '../../types/effort';
import { RouteComponentProps, withRouter } from 'react-router-dom';

interface Props extends RouteComponentProps {
    data: Effort[];
    by: 'year' | 'month';
}

const EffortCanvas: React.FC<Props> = props => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const cfg = generateConfig();
        const chart = new Chart(canvasRef.current!, cfg);

        canvasRef.current!.onclick = (evt: MouseEvent) => {
            const item = chart.getElementsAtXAxis(evt)[0] as any;
            const id = item._chart.chart.config.data.datasets[0].data[item._index].id;

            console.log("GOING " + id)
            props.history.push("/activities/" + id);
        };

        const chartData = [];
        for (let d of props.data) {
            const row = {
                x: getXBy(new Date(d.activity.date), props.by),
                y: d.time,
                id: d.activity.id,
                date: new Date(d.activity.date).toISOString().split("T")[0],
                name: d.activity.name
            };
            chartData.push(row);
        }

        chart!.config!.data!.datasets![0].data = chartData;
        chart.update();

    }, [])

    const getXBy = (date: Date, by: 'year' | 'month') => {
        if (by === 'year') {
            return date.getFullYear();
        }
        else if (by === 'month') {
            return date.getMonth() + 1;
        }
    }

    const generateConfig = (): ChartConfiguration => {
        return {
            data: {
                datasets: [{
                    label: 'Time',
                    backgroundColor: "#00aaff",
                    borderColor: "#00aaff",
                    data: [],
                    type: 'line',
                    pointRadius: 3,
                    fill: false,
                    lineTension: 0,
                    borderWidth: 2
                }]
            },
            options: {
                animation: {
                    duration: 0
                },
                legend: {
                    display: false
                },
                scales: {
                    xAxes: [{
                        type: 'linear',
                        ticks: {
                            stepSize: 1
                        }
                    }],
                    yAxes: [{
                        gridLines: {
                            drawBorder: false
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Time'
                        },
                        ticks: {
                            reverse: true
                        }
                    }]
                },
                tooltips: {
                    displayColors: false,
                    intersect: false,
                    mode: 'index',
                    callbacks: {
                        label: (tooltipItem: any, data: any) => {
                            return ["Time: " + secondsToString(tooltipItem.value),
                            "Date: " + data.datasets[0].data[tooltipItem.index].date,
                            "Activity: " + data.datasets[0].data[tooltipItem.index].name
                            ];
                        }
                    }
                }
            }
        }
    }

    return (
        <canvas height="125px" ref={canvasRef} />
    );
}

export default withRouter(EffortCanvas);
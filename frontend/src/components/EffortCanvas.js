import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Chart from 'chart.js';
import { secondsToString } from '../Utils.js'

class EffortCanvas extends Component {
	constructor(props) {
		super(props);
		this.canvasRef = React.createRef();
	}

	componentDidMount() {
		const canvas = this.canvasRef.current;
		const cfg = this.generateConfig();
		const chart = new Chart(canvas, cfg);

		canvas.onclick = (evt) => {
			const item = chart.getElementsAtXAxis(evt)[0];
			const id = chart.getElementsAtXAxis(evt)[0]._chart.chart.config.data.datasets[0].data[item._index].id;

			this.props.history.push("/activities/" + id);
		};

		const chartData = [];
		for (let d of this.props.data) {
			const row = {
				x: this.getXBy(new Date(d.activity.date), this.props.by),
				y: d.time,
				id: d.activity.id,
				date: new Date(d.activity.date).toISOString().split("T")[0],
				name: d.activity.name
			};
			chartData.push(row);
		}

		chart.config.data.datasets[0].data = chartData;
		chart.update();
	}

	render() {
		return (
			<canvas height="125px" ref={this.canvasRef} />
		);
	}

	getXBy(date, by) {
		if (by === 'year') {
			return date.getFullYear();
		}
		else if (by === 'month') {
			return date.getMonth() + 1;
		}
	}

	generateConfig() {
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
						label: (tooltipItem, data) => {
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
}

export default withRouter(EffortCanvas);
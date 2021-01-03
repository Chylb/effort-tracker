import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { fetchApi, secondsToString } from '../../Utils.js';
import EffortCanvas from '../EffortCanvas.js';
import Statistic from '../Statistic.js';

import DeleteDistanceModal from '../DeleteDistanceModal.js';
import PageTitle from '../PageTitle.js';

class Distance extends Component {
	constructor(props) {
		super(props);

		const { id } = this.props.match.params;
		this.distanceUrl = 'http://localhost:8080/api/distances/' + id;
	}

	state = {
		showModal: false,
		distance: null,
		efforts: null,
		seasonBest: null,
		allTimeBest: null
	};

	showModal = () => {
		this.setState({ showModal: true });
	}

	hideModal = () => {
		this.setState({ showModal: false });
	}

	handleSubmit = async event => {
		event.preventDefault();

		try {
			const response = await fetch(this.distanceUrl, {
				mode: 'cors',
				credentials: 'include',
				method: 'DELETE',
			})

			if (!response.ok) {
				return console.log("error");
			}

			this.props.history.push("/distances");
		}
		catch (err) {
			console.log("error");
		}
	}

	async componentDidMount() {
		const distance = await fetchApi(this.distanceUrl);
		const efforts = await fetchApi(this.distanceUrl + '/efforts');
		const seasonBest = await fetchApi(this.distanceUrl + '/seasonBest?year=2020');
		const allTimeBest = await fetchApi(this.distanceUrl + '/allTimeBest');

		this.setState({ distance: distance });
		this.setState({ efforts: efforts });
		this.setState({ seasonBest: seasonBest });
		this.setState({ allTimeBest: allTimeBest });
	}

	renderTableData() {
		return this.state.efforts.map((effort) => {
			const { id, activity, distance, time } = effort;
			return (
				<tr key={id}>
					<td><Link to={'/activities/' + activity.id} >{activity.name}</Link></td>
					<td>{new Date(activity.date).toLocaleString('en-GB')}</td>
					<td>{secondsToString(time)}</td>
					<td>{secondsToString(time * 1000 / distance.length)}</td>
				</tr>
			)
		})
	}

	render() {
		return (
			<>
				<PageTitle title={this.state.distance && this.state.distance.name} >
					<Button variant="secondary" onClick={this.showModal}>
						Delete
					</Button>
				</PageTitle>

				<DeleteDistanceModal show={this.state.showModal} onHide={this.hideModal} onSubmit={this.handleSubmit} />

				<Statistic name="Season's best efforts">
					{this.state.seasonBest && <EffortCanvas data={this.state.seasonBest} by='month'></EffortCanvas>}
				</Statistic>

				<Statistic name="All time best efforts">
					{this.state.allTimeBest && <EffortCanvas data={this.state.allTimeBest} by='year'></EffortCanvas>}
				</Statistic>

				<Statistic name="All efforts">
					<table className="table table-striped">
						<thead>
							<tr>
								<th scope="col">Activity</th>
								<th scope="col">Date</th>
								<th scope="col">Time</th>
								<th scope="col">Pace</th>
							</tr>
						</thead>
						<tbody>
							{this.state.efforts && this.renderTableData()}
						</tbody>
					</table>
				</Statistic>
			</>
		);
	}
}

export default withRouter(Distance);
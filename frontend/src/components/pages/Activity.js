import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { fetchApi, secondsToString } from '../../Utils.js'
import PageTitle from '../PageTitle.js';
import Statistic from '../Statistic.js';

class Activity extends Component {
	state = {
		efforts: null
	};

	async componentDidMount() {
		const { id } = this.props.match.params;
		const efforts = await fetchApi('http://localhost:8080/api/activities/' + id + "/efforts");

		this.setState({ efforts: efforts });
	}

	renderTableData() {
		return this.state.efforts.map((effort) => {
			const { id, distance, time } = effort;
			return (
				<tr key={id}>
					<td><Link to={'/distances/' + distance.id} >{distance.name}</Link></td>
					<td>{secondsToString(time)}</td>
					<td>{secondsToString(time * 1000 / distance.length)}</td>
				</tr>
			)
		})
	}

	render() {
		return (
			<>
				<PageTitle title={"Activity " + (this.state.efforts ? this.state.efforts[0].activity.name : "")} />

				<Statistic name="All efforts">
					<table className="table table-striped">
						<thead>
							<tr>
								<th scope="col">Distance</th>
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

export default Activity;
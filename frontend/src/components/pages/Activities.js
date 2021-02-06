import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { fetchApi } from '../../Utils.js'
import PageTitle from '../PageTitle.js';

class Activities extends Component {
	state = {
		activities: null
	};

	async componentDidMount() {
		const activities = await fetchApi('http://localhost:8080/api/activities');

		this.setState({ activities: activities });
	}

	renderTableData() {
		return this.state.activities.map((activity) => {
			const { id, name, distance, date, flagged } = activity;
			return (
				<tr key={id} className={flagged ? "table-danger" : ""}>
					<td><Link to={"/activities/" + id}>{name}</Link></td>
					<td>{distance}</td>
					<td>{new Date(date).toLocaleString('en-GB')}</td>
				</tr>
			)
		})
	}

	render() {
		return (
			<>
				<PageTitle title="My activities" />

				<Container>
					<table className="table table-striped">
						<thead>
							<tr>
								<th scope="col">Name</th>
								<th scope="col">Distance</th>
								<th scope="col">Date</th>
							</tr>
						</thead>
						<tbody>
							{this.state.activities && this.renderTableData()}
						</tbody>
					</table>
				</Container>
			</>
		);
	}
}

export default Activities;
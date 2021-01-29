import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import { fetchApi, secondsToString } from '../../Utils.js'

import AddDistanceModal from '../AddDistanceModal.js';
import AddDistanceAlert from '../AddDistanceAlert.js';
import PageTitle from '../PageTitle.js';

class Distances extends Component {
	constructor(props) {
		super(props);
		this.addAlert = React.createRef();
	}

	state = {
		distances: null,
		showModal: false
	};

	loadDistances = async () => {
		const distances = await fetchApi('http://localhost:8080/api/distances');
		this.setState({ distances: distances });
	}

	showModal = () => {
		this.setState({ showModal: true });
	}

	hideModal = () => {
		this.setState({ showModal: false });
	}

	handleSubmit = async event => {
		event.preventDefault();

		const distance = {
			name: event.target.name.value,
			length: event.target.length.children[1].value
		};

		try {
			const response = await fetch('http://localhost:8080/api/distances', {
				mode: 'cors',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json'
				},
				method: 'POST',
				body: JSON.stringify(distance)
			})

			if (!response.ok) {
				return this.addAlert.current.failure();
			}

			this.addAlert.current.success();
			this.loadDistances();
		}
		catch (err) {
			this.addAlert.current.failure();
		}
	}

	async componentDidMount() {
		this.loadDistances();
	}

	renderTableData() {
		return this.state.distances.map((distance) => {
			const { id, name, length, bestTime, effortCount } = distance
			return (
				<tr key={id}>
					<td><Link to={"distances/" + id}>{name}</Link></td>
					<td>{effortCount}</td>
					<td>{secondsToString(bestTime)}</td>
					<td>{secondsToString(bestTime * 1000 / length)}</td>
				</tr>
			)
		})
	}

	render() {
		return (
			<>
				<PageTitle title="My distances" >
					<Button variant="secondary" onClick={this.showModal}>
						Add
					</Button>
				</PageTitle>

				<AddDistanceModal show={this.state.showModal} onHide={this.hideModal} onSubmit={this.handleSubmit}
					alert={<AddDistanceAlert ref={this.addAlert} />}
				/>

				<Container>
					<table className="table table-striped">
						<thead>
							<tr>
								<th scope="col">Distance</th>
								<th scope="col">Number of efforts</th>
								<th scope="col">Best time</th>
								<th scope="col">Best pace</th>
							</tr>
						</thead>
						<tbody>
							{this.state.distances && this.renderTableData()}
						</tbody>
					</table>
				</Container>
			</>
		);
	}
}

export default Distances;
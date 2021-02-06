import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import { fetchApi, secondsToString } from '../../Utils.js'
import PageTitle from '../PageTitle.js';
import Statistic from '../Statistic.js';


import FlagActivityModal from '../FlagActivityModal.js';

class Activity extends Component {
	state = {
		activity: null,
		efforts: null,
		showModal: false
	};

	showModal = () => {
		this.setState({ showModal: true });
	}

	hideModal = () => {
		this.setState({ showModal: false });
	}

	handleSubmit = async event => {
		event.preventDefault();
		this.setState({ showModal: false });
		try {
			const { id } = this.props.match.params;
			const response = await fetch('http://localhost:8080/api/activities/' + id, {
				mode: 'cors',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json'
				},
				method: 'PATCH',
				body: JSON.stringify({ flagged: !this.state.activity.flagged })
			})

			if (response.ok) {
				this.setState(prevState => ({
					activity: {
						...prevState.activity,
						flagged: !this.state.activity.flagged
					}
				}))
			}
		}
		catch (err) {
			console.log(err)
		}
	}

	async componentDidMount() {
		const { id } = this.props.match.params;
		const efforts = await fetchApi('http://localhost:8080/api/activities/' + id + "/efforts");
		this.setState({ efforts: efforts });

		if (efforts.length > 0) {
			this.setState({ activity: efforts[0].activity });
		} else {
			const activity = await fetchApi('http://localhost:8080/api/activities/' + id);
			this.setState({ activity: activity });
		}
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
				<PageTitle title={"Activity " + (this.state.activity ? this.state.activity.name : "")} >
					<Button variant="secondary" onClick={this.showModal}>
						{this.state.activity && this.state.activity.flagged ? "Unflag" : "Flag"}
					</Button>
				</PageTitle>

				{this.state.activity &&
					<FlagActivityModal show={this.state.showModal} onHide={this.hideModal} onSubmit={this.handleSubmit}
						body={this.state.activity.flagged ? "Are you sure you want to unflag this activity?" : "Are you sure you want to flag this activity?"} />
				}

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
import React from 'react';
import { Container, Modal, Button, Form } from "react-bootstrap";

const unitNames = {
	m: 'meters',
	mi: 'miles',
	y: 'yards'
};

function mile2meter(mile) {
	return 1609.344 * mile;
}

function yard2meter(yard) {
	return 0.9144 * yard;
}

function meter2mile(meter) {
	return meter * 0.000621371192;
}

function meter2yard(meter) {
	return meter * 1.093613;
}

function convert(meters, unit) {
	const input = parseFloat(meters);
	if (Number.isNaN(input)) {
		return '';
	}

	let output;
	switch (unit) {
		case 'm':
			output = meters.toFixed(0);
			break;
		case 'mi':
			output = meter2mile(meters).toFixed(3);
			break;

		case 'y':
			output = meter2yard(meters).toFixed(0);
			break;
	}
	return output;
}

class LengthInput extends React.Component {
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(e) {
		this.props.onLengthChange(e.target.value);
	}

	render() {
		const length = this.props.length;
		const unit = this.props.unit;

		return (
			<>
				<legend>Distance in {unitNames[unit]}:</legend>
				<input type="number" step="any" className="form-control" placeholder="Length" required="required"
					value={length}
					onChange={this.handleChange} />
			</>
		);
	}
}

class LengthInputs extends React.Component {
	constructor(props) {
		super(props);
		this.handleMeterChange = this.handleMeterChange.bind(this);
		this.handleMileChange = this.handleMileChange.bind(this);
		this.handleYardChange = this.handleYardChange.bind(this);
		this.state = { length: '', metricLength: '', unit: 'm' };
	}

	handleMeterChange(length) {
		this.setState({ unit: 'm', length: length, metricLength: length });
	}

	handleMileChange(length) {
		this.setState({ unit: 'mi', length: length, metricLength: mile2meter(length) });
	}

	handleYardChange(length) {
		this.setState({ unit: 'y', length: length, metricLength: yard2meter(length) });
	}

	render() {
		const unit = this.state.unit;
		const length = this.state.length;
		const metricLength = this.state.metricLength;

		const Meter = unit === 'm' ? length : convert(metricLength, 'm');
		const Mile = unit === 'mi' ? length : convert(metricLength, 'mi');
		const Yard = unit === 'y' ? length : convert(metricLength, 'y');
		return (
			<fieldset id="length">
				<LengthInput
					unit="m"
					length={Meter}
					onLengthChange={this.handleMeterChange} />
				<LengthInput
					unit="mi"
					length={Mile}
					onLengthChange={this.handleMileChange} />
				<LengthInput
					unit="y"
					length={Yard}
					onLengthChange={this.handleYardChange} />
			</fieldset>
		);
	}
}

function AddDistanceModal(props) {
	return (
		<Modal
			{...props}
			centered
		>
			<Form onSubmit={props.handleSubmit} >
				<Modal.Body>
					<h2>Add a new distance</h2>

					<Form.Group controlId="name">
						<legend>Name:</legend>
						<input id="name" type="text" className="form-control" placeholder="Name" required="required" />
					</Form.Group>
					<Form.Group controlId="length">
						<LengthInputs />
					</Form.Group>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={props.onHide}>Close</Button>
					<Button type="submit">Add</Button>

					<Container>
						{props.alert}
					</Container>
				</Modal.Footer>
			</Form>
		</Modal>
	);
}

export default AddDistanceModal;
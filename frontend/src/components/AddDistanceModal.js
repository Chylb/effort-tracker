import React from 'react';
import { Container, Modal, Button, Form } from "react-bootstrap";

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
						<input id="name" type="text" className="form-control" placeholder="Name" required="required" />
					</Form.Group>
					<Form.Group controlId="length">
						<input id="length" type="number" className="form-control" placeholder="Length" required="required" />
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
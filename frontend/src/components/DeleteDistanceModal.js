import React from 'react';
import { Modal, Button, Form } from "react-bootstrap";

function DeleteDistanceModal(props) {
	return (
		<Modal
			{...props}
			centered
		>
			<Form onSubmit={props.handleSubmit} >
				<Modal.Body>
					<h2>Are you sure you want to delete this distance?</h2>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={props.onHide}>Close</Button>
					<Button type="submit">Delete</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	);
}

export default DeleteDistanceModal;
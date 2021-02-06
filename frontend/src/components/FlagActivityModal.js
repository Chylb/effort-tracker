import React from 'react';
import { Modal, Button, Form } from "react-bootstrap";

function FlagActivityModal(props) {
    return (
        <Modal
            {...props}
            centered
        >
            <Form onSubmit={props.handleSubmit} >
                <Modal.Body>
                    <h2>{props.body}</h2>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={props.onHide}>Close</Button>
                    <Button type="submit">Yes</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default FlagActivityModal;
import React, { FormEvent } from "react";
import { Modal, Form, Button, Container } from "react-bootstrap";
import { LengthInputSet } from "./LengthInputSet";

interface Props {
    visible: boolean;
    children?: React.ReactNode;
    onSubmit: (e: FormEvent) => void;
    onHide: () => void;
}

export const AddDistanceModal: React.FC<Props> = props => {
    return (
        <Modal
            show={props.visible}
            onHide={props.onHide}
            centered
        >
            <Form onSubmit={props.onSubmit} >
                <Modal.Body>
                    <h2>Add a new distance</h2>

                    <Form.Group controlId="name">
                        <legend>Name:</legend>
                        <input id="name" type="text" className="form-control" placeholder="Name" required={true} />
                    </Form.Group>
                    <Form.Group controlId="length">
                        <LengthInputSet />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={props.onHide}>Close</Button>
                    <Button type="submit">Add</Button>

                    <Container>
                        {props.children}
                    </Container>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

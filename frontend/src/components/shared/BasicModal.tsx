import React, { FormEvent } from "react";
import { Button, Form, Modal } from "react-bootstrap";

interface Props {
    visible: boolean;
    title: string;
    message: string;
    handleSubmit: (e: FormEvent) => void;
    onHide: () => void;
}

export const BasicModal: React.FC<Props> = props => {
    return (
        <Modal
            show={props.visible}
            onHide={props.onHide}
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title>{props.title}</Modal.Title>
            </Modal.Header>

            <Form onSubmit={props.handleSubmit} >
                <Modal.Body>
                    {props.message}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={props.onHide}>No</Button>
                    <Button type="submit">Yes</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
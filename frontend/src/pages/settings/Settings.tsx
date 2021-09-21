import React, { useState } from 'react';
import { Button, Container, Form, Modal } from "react-bootstrap";
import { RouteComponentProps } from 'react-router-dom';
import { PageTitle } from '../../components/shared/PageTitle';
import { BasicModal } from '../../components/shared/BasicModal';
import { useAxios } from '../../hooks/useAxios';
import { useAuth } from '../../hooks/useAuth';

export const SettingsPage: React.FC<RouteComponentProps> = props => {
    const { logout } = useAuth();
    const axios = useAxios();

    const [visibleRecalculateModal, setVisibleRecalculateModal] = useState<boolean>(false);
    const [visibleDeleteModal, setVisibleDeleteModal] = useState<boolean>(false);

    const recalculateStatistics = async () => {
        const response = await axios.post('/athlete/recalculateStatistics');
    };

    const deleteAccount = async () => {
        const response = await axios.delete('/athlete');
        logout();
    };

    return (
        <>
            <PageTitle title="Settings" />

            <Container className="py-4">
                <Button variant="secondary" onClick={() => setVisibleRecalculateModal(true)}>
                    Recalculate achievements
                </Button>
            </Container>

            <BasicModal visible={visibleRecalculateModal}
                title="Recalculate achievements"
                message="Are you sure you want to recalculate achievements?"
                onHide={() => setVisibleRecalculateModal(false)}
                handleSubmit={recalculateStatistics} />

            <Container className="py-2">
                <Button variant="danger" onClick={() => setVisibleDeleteModal(true)}>
                    Delete account
                </Button>
            </Container>

            <Modal
                show={visibleDeleteModal}
                onHide={() => setVisibleDeleteModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>{"Delete account"}</Modal.Title>
                </Modal.Header>

                <Form onSubmit={deleteAccount} >
                    <Modal.Body>
                        Are you sure you want to <b>delete</b> account?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setVisibleDeleteModal(false)}>No</Button>
                        <Button variant="danger" type="submit">Yes, I want to delete the account!</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}


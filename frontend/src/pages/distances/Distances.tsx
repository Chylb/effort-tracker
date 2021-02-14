import React, { useEffect, useState } from 'react';
import { Container, Button, Alert } from "react-bootstrap";
import { Link } from 'react-router-dom';
import { PageTitle } from '../../components/shared/PageTitle';
import { secondsToString } from '../../utils/secondsToString';
import { Distance } from '../../types/distance';
import { AddDistanceModal } from './AddDistanceModal';

export const DistancesPage: React.FC = () => {
    const [distances, setDistances] = useState<Distance[]>([]);

    const [modalVisible, setModalVisible] = useState<boolean>(false);

    const [alert, setAlert] = useState({ visible: false, variant: '', heading: '', message: '' });

    useEffect(() => {
        loadDistances();
    }, []);

    const loadDistances = async () => {
        fetch('http://localhost:8080/api/distances', {
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            }
        })
            .then(x => x.json())
            .then(x => setDistances(x));
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const target = event.target as any

        const distance = {
            name: target.name.value,
            length: target.length.children[1].value
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

            if (response.ok) {
                setAlert({
                    visible: true,
                    variant: "success",
                    heading: "Success",
                    message: "Added a new distance"
                })
                loadDistances();
            }
            else {
                setAlert({
                    visible: true,
                    variant: "danger",
                    heading: "Error",
                    message: "Something went wrong"
                })
            }
        }
        catch (err) {
            setAlert({
                visible: true,
                variant: "danger",
                heading: "Error",
                message: "Something went wrong"
            })
        }
    }

    const renderTableData = () => {
        return distances.map((distance) => {
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
    };

    return (
        <>
            <PageTitle title="My distances" >
                <Button variant="secondary" onClick={() => setModalVisible(true)}>
                    Add
                </Button>
            </PageTitle>

            <AddDistanceModal visible={modalVisible} onHide={() => setModalVisible(false)} onSubmit={handleSubmit} >
                <Alert show={alert.visible} variant={alert.variant} onClose={() => setAlert({ ...alert, visible: false })} dismissible>
                    <Alert.Heading>{alert.heading}</Alert.Heading>
                    {alert.message}
                </Alert>
            </AddDistanceModal>

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
                        {distances && renderTableData()}
                    </tbody>
                </table>
            </Container>
        </>
    );
}


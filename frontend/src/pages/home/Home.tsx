import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { Jumbotron, Container, Table } from "react-bootstrap";
import { useAuth } from '../../hooks/useAuth';
import { useAxios } from '../../hooks/useAxios';
import { Summary } from '../../types/summary';
import { secondsToString } from '../../utils/secondsToString';

export const Home: React.FC = () => {
    const [summary, setSummary] = useState<Summary>();
    const { athlete } = useAuth();
    const axios = useAxios();

    useEffect(() => {
        const fetchData = async () => {
            const response = await axios.get('/athlete/summary');
            setSummary(response.data);
        }
        fetchData();
    }, []);

    return (
        <>
            <Jumbotron fluid>
                <Container>
                    <h1>Hello, {athlete?.name}!</h1>
                    <p>Here is a summary</p>
                </Container>
            </Jumbotron>

            {summary &&
                <Container>
                    <Table id="table">
                        <tbody>
                            <tr>
                                <td><h2>Number of distances:</h2></td>
                                <td><h2>{summary.distances}</h2></td>
                            </tr>
                            <tr>
                                <td><h2>Number of activities:</h2></td>
                                <td><h2>{summary.activities}</h2></td>
                            </tr>
                            <tr>
                                <td><h2>Number of efforts:</h2></td>
                                <td><h2>{summary.efforts}</h2></td>
                            </tr>
                            <tr>
                                <td><h2>Best pace:</h2></td>
                                <td><h2>{secondsToString(summary.bestPace)}</h2></td>
                            </tr>
                        </tbody>
                    </Table>
                </Container>
            }
        </>
    );
}


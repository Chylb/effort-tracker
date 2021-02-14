import React, { Component, useState, useEffect } from 'react';
import { Jumbotron, Container, Table } from "react-bootstrap";
import { Link } from 'react-router-dom';
import { PageTitle } from '../../components/shared/PageTitle';
import { Activity } from '../../types/activity';

export const Activities: React.FC = () => {
    const [activities, setActivites] = useState<Activity[]>([]);

    useEffect(() => {
        fetch('http://localhost:8080/api/activities', {
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            }
        })
            .then(x => x.json())
            .then(x => setActivites(x));
    }, [])

    const renderTableData = () => {
        return activities.map((activity) => {
            const { id, name, distance, date, flagged } = activity;
            return (
                <tr key={id} className={flagged ? "table-danger" : ""}>
                    <td><Link to={"/activities/" + id}>{name}</Link></td>
                    <td>{distance}</td>
                    <td>{new Date(date).toLocaleString('en-GB')}</td>
                </tr>
            )
        })
    };

    return (
        <>
            <PageTitle title="My activities" />

            <Container>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th scope="col">Name</th>
                            <th scope="col">Distance</th>
                            <th scope="col">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activities && renderTableData()}
                    </tbody>
                </table>
            </Container>
        </>
    );
}


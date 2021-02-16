import React, { Component, useState, useEffect } from 'react';
import { Jumbotron, Container, Table } from "react-bootstrap";
import { Link } from 'react-router-dom';
import { PageTitle } from '../../components/shared/PageTitle';
import { useAxios } from '../../components/useAxios';
import { Activity } from '../../types/activity';

export const Activities: React.FC = () => {
    const [activities, setActivites] = useState<Activity[]>([]);
    const axios = useAxios();

    useEffect(() => {
        const fetchData = async () => {
            const response = await axios.get('/activities');
            setActivites(response.data);
        }

        fetchData();
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


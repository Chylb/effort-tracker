import React, { useState, useEffect } from 'react';
import { Container } from "react-bootstrap";
import { Link } from 'react-router-dom';
import { PageTitle } from '../../components/shared/PageTitle';
import { useAxios } from '../../hooks/useAxios';
import { Activity } from '../../types/activity';

export const Activities: React.FC = () => {
    const [activities, setActivites] = useState<Activity[]>([]);

    const [sortKey, setSortKey] = useState<string>('');
    const [sortReversed, setSortReversed] = useState<boolean>(false);

    const axios = useAxios();

    useEffect(() => {
        const fetchData = async () => {
            const response = await axios.get('/activities');
            setActivites(response.data);
        };

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

    const sortTable = (key: 'distance' | 'name' | 'date') => {
        let reversed = false;
        if (key === sortKey)
            reversed = !sortReversed;

        let sorted: Activity[];

        switch (key) {
            case 'distance':
                sorted = [...activities].sort((a, b) => a[key] - b[key]);
                break;
            case 'name':
                sorted = [...activities].sort((a, b) => a[key].localeCompare(b[key]));
                break;
            case 'date':
                sorted = [...activities].sort((a, b) => new Date(a[key]).valueOf() - new Date(b[key]).valueOf());
                break;
        }
        if (reversed)
            sorted.reverse();

        setActivites(sorted);
        setSortKey(key);
        setSortReversed(reversed);
    };

    return (
        <>
            <PageTitle title="My activities" />

            <Container>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th scope="col" onClick={() => { sortTable('name') }}>Name</th>
                            <th scope="col" onClick={() => { sortTable('distance') }}>Distance</th>
                            <th scope="col" onClick={() => { sortTable('date') }}>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderTableData()}
                    </tbody>
                </table>
            </Container>
        </>
    );
}


import React, { useState, useEffect } from 'react';
import { Button, Container } from "react-bootstrap";
import { Link } from 'react-router-dom';
import { PageTitle } from '../../components/shared/PageTitle';
import { useAxios } from '../../hooks/useAxios';
import { useSortableData } from '../../hooks/useSortableData';
import { Activity } from '../../types/activity';
import { icon } from '../../utils/icons';

export const Activities: React.FC = () => {
    const [activities, setActivites] = useState<Activity[]>([]);
    const [flaggedActivities, setFlaggedActivities] = useState<Activity[]>([]);
    const [sortedActivities, requestSort, sortConfig] = useSortableData(activities, { key: 'date', direction: 'descending' });
    const [sortedFlaggedActivities, requestSortFlagged, sortConfigFlagged] = useSortableData(flaggedActivities, { key: 'date', direction: 'descending' });

    const axios = useAxios();

    useEffect(() => {
        const fetchData = async () => {
            const response = await axios.get('/activities');
            const activities: Activity[] = response.data;
            setActivites(activities.filter(a => !a.flagged));
            setFlaggedActivities(activities.filter(a => a.flagged));
        };

        fetchData();
    }, [])

    const renderTableData = (activities: Activity[]) => {
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
                            <th scope="col"></th>
                            <th scope="col" onClick={() => { requestSort('name'); requestSortFlagged('name') }}>Name {sortConfig.key == 'name' && (sortConfig.direction == 'ascending'?icon('chevron-down'): icon('chevron-up'))}</th>
                            <th scope="col" onClick={() => { requestSort('distance'); requestSortFlagged('distance') }}>Distance {sortConfig.key == 'distance' && (sortConfig.direction == 'ascending'?icon('chevron-down'): icon('chevron-up'))}</th>
                            <th scope="col" onClick={() => { requestSort('date'); requestSortFlagged('date') }}>Date {sortConfig.key == 'date' && (sortConfig.direction == 'ascending'?icon('chevron-down'): icon('chevron-up'))}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderTableData(sortedActivities)}
                        {renderTableData(sortedFlaggedActivities)}
                    </tbody>
                </table>
                <Button variant="outline-secondary" size="sm" className='float-right' onClick={() => axios.post('/activities')}>DEV generate activity</Button>
            </Container>
        </>
    )
}


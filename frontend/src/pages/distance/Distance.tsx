import React, { FormEvent, useEffect, useState } from 'react';
import { Button, Row, Col, Container, Form } from "react-bootstrap";
import { Link, RouteComponentProps } from 'react-router-dom';
import { PageTitle } from '../../components/shared/PageTitle';
import { secondsToString } from '../../utils/secondsToString';
import { Distance } from '../../types/distance';
import { Statistic } from '../../components/shared/Statistic';
import { Effort } from '../../types/effort';
import { BasicModal } from '../../components/shared/BasicModal';
import { useAxios } from '../../hooks/useAxios';
import DistanceEffortsChart from './DistanceEffortsChart';
import { useSortableData } from '../../hooks/useSortableData';
import { icon } from '../../utils/icons';

const getEffortsYears = (efforts: Effort[]) => {
    const years = new Set<number>();
    for (const effort of efforts) {
        const year = new Date(effort.activity.date).getFullYear();
        years.add(year);
    }

    return [...years].sort().reverse().map((year) => {
        return (<option>{year}</option>);
    });
}

export const DistancePage: React.FC<RouteComponentProps> = props => {
    const [distance, setDistance] = useState<Distance>();

    const [efforts, setEfforts] = useState<Effort[]>([]);
    const [flaggedEfforts, setFlaggedEfforts] = useState<Effort[]>([]);
    const [sortedEfforts, requestSort, sortConfig] = useSortableData(efforts, { key: 'activity.date', direction: 'descending' });
    const [sortedFlaggedEfforts, requestSortFlagged, sortConfigFlagged] = useSortableData(flaggedEfforts, { key: 'activity.date', direction: 'descending' });

    const [selectedSeason, setSelectedSeason] = useState<Number>();

    const [modalVisible, setModalVisible] = useState<boolean>(false);

    const axios = useAxios();

    const { id } = props.match.params as any;
    const distanceUrl = '/distances/' + id;

    useEffect(() => {
        const fetchDistance = async () => {
            const response = await axios.get(distanceUrl);
            setDistance(response.data);
        }
        fetchDistance();

        const fetchEfforts = async () => {
            const response = await axios.get(distanceUrl + '/efforts');
            const efforts: Effort[] = response.data;
            setEfforts(efforts.filter(e => !e.flagged));
            setFlaggedEfforts(efforts.filter(e => e.flagged));
            setSelectedSeason(efforts.map(x => new Date(x.activity.date).getFullYear()).sort().reverse()[0]);
        }
        fetchEfforts();
    }, []);

    const deleteDistance = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const response = await axios.delete(distanceUrl);

            if (response.status != 200) {
                return console.log("error");
            }

            props.history.push("/distances");
        }
        catch (err) {
            console.log("error");
        }
    }

    const renderTableData = (efforts: Effort[]) => {
        return efforts.map((effort) => {
            const { id, activity, distance, time, flagged } = effort;
            return (
                <tr key={id} className={flagged ? "table-danger" : ""}>
                    <td><Link to={'/activities/' + activity.id} >{activity.name}</Link></td>
                    <td>{new Date(activity.date).toLocaleString('en-GB')}</td>
                    <td>{secondsToString(time)}</td>
                    <td>{secondsToString(time * 1000 / distance.length)}</td>
                </tr >
            )
        })
    }

    return (
        <>
            <PageTitle title={distance ? distance.name : ''} >
                <Button variant="secondary" onClick={() => setModalVisible(true)}>
                    Delete
                </Button>
            </PageTitle>

            <BasicModal visible={modalVisible}
                title="Delete distance"
                message="Are you sure you want to delete this distance?"
                onHide={() => setModalVisible(false)}
                handleSubmit={deleteDistance} />

            <Statistic name="Season's best efforts">
                {efforts && <DistanceEffortsChart efforts={efforts.filter(e => !e.flagged)} type='season' selectedSeason={selectedSeason}></DistanceEffortsChart>}

                <Col className="col-2 pl-4">
                    <Form >
                        <Form.Group>
                            <Form.Label>Season:</Form.Label>
                            <Form.Control as="select" onChange={e => setSelectedSeason(new Number(e.target.value))}>
                                {getEffortsYears(efforts)}
                            </Form.Control>
                        </Form.Group>
                    </Form>
                </Col>
            </Statistic>

            <Statistic name="All time best efforts">
                {efforts && <DistanceEffortsChart efforts={efforts.filter(e => !e.flagged)} type='allTime'></DistanceEffortsChart>}
            </Statistic>

            <Statistic name="All efforts">
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th scope="col" onClick={() => { requestSort('activity.name'); requestSortFlagged('activity.name') }}>Activity {sortConfig.key == 'activity.name' && (sortConfig.direction == 'ascending' ? icon('chevron-down') : icon('chevron-up'))}</th>
                            <th scope="col" onClick={() => { requestSort('activity.date'); requestSortFlagged('activity.date') }}>Date {sortConfig.key == 'activity.date' && (sortConfig.direction == 'ascending' ? icon('chevron-down') : icon('chevron-up'))}</th>
                            <th scope="col" onClick={() => { requestSort('time'); requestSortFlagged('time') }}>Time {sortConfig.key == 'time' && (sortConfig.direction == 'ascending' ? icon('chevron-down') : icon('chevron-up'))}</th>
                            <th scope="col" onClick={() => { requestSort('time'); requestSortFlagged('time') }}>Pace</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderTableData(sortedEfforts)}
                        {renderTableData(sortedFlaggedEfforts)}
                    </tbody>
                </table>
            </Statistic>
        </>
    );
}


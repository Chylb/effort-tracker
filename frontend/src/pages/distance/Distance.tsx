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
    const [selectedSeason, setSelectedSeason] = useState<Number>();

    const [modalVisible, setModalVisible] = useState<boolean>(false);

    const [sortKey, setSortKey] = useState<string>('');
    const [sortReversed, setSortReversed] = useState<boolean>(false);

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
            setEfforts(response.data);

            const effs: Effort[] = response.data;
            setSelectedSeason(effs.map(x => new Date(x.activity.date).getFullYear()).sort().reverse()[0]);
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

    const renderTableData = () => {
        return efforts.map((effort) => {
            const { id, activity, distance, time } = effort;
            return (
                <tr key={id}>
                    <td><Link to={'/activities/' + activity.id} >{activity.name}</Link></td>
                    <td>{new Date(activity.date).toLocaleString('en-GB')}</td>
                    <td>{secondsToString(time)}</td>
                    <td>{secondsToString(time * 1000 / distance.length)}</td>
                </tr>
            )
        })
    }

    const sortTable = (key: 'name' | 'date' | 'time') => {
        let reversed = false;
        if (key === sortKey)
            reversed = !sortReversed;

        let sorted: Effort[];

        switch (key) {
            case 'time':
                sorted = [...efforts].sort((a, b) => a[key] - b[key]);
                break;
            case 'name':
                sorted = [...efforts].sort((a, b) => a.activity[key].localeCompare(b.activity[key]));
                break;
            case 'date':
                sorted = [...efforts].sort((a, b) => new Date(a.activity[key]).valueOf() - new Date(b.activity[key]).valueOf());
                break;
        }
        if (reversed)
            sorted.reverse();

        setEfforts(sorted);
        setSortKey(key);
        setSortReversed(reversed);
    };

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
                {efforts && <DistanceEffortsChart efforts={efforts} type='season' selectedSeason={selectedSeason}></DistanceEffortsChart>}

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
                {efforts && <DistanceEffortsChart efforts={efforts} type='allTime'></DistanceEffortsChart>}
            </Statistic>

            <Statistic name="All efforts">
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th scope="col" onClick={() => { sortTable('name') }}>Activity</th>
                            <th scope="col" onClick={() => { sortTable('date') }}>Date</th>
                            <th scope="col" onClick={() => { sortTable('time') }}>Time</th>
                            <th scope="col" onClick={() => { sortTable('time') }}>Pace</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderTableData()}
                    </tbody>
                </table>
            </Statistic>
        </>
    );
}


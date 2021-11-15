import React, { Component, useEffect, useRef, useState } from 'react';
import { FormEvent } from 'react';
import { Button, Container } from "react-bootstrap";
import { Link, RouteComponentProps } from 'react-router-dom';
import { BasicModal } from '../../components/shared/BasicModal';
import { PageTitle } from '../../components/shared/PageTitle';
import { Statistic } from '../../components/shared/Statistic';
import { useAxios } from '../../hooks/useAxios';
import { Activity } from '../../types/activity';
import { Effort } from '../../types/effort';
import { prDescription, prMedal } from '../../utils/achievement';
import { secondsToString } from '../../utils/secondsToString';
import { useSortableData } from '../../hooks/useSortableData';

import { ActivityMap } from '../../components/shared/ActivityMap';
import { ActivityStreams } from '../../types/activityStreams';
import { Area, AreaChart, CartesianGrid, Legend, Tooltip, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { AltitudeChart } from './AltitudeChart.jsx';

export const ActivityPage: React.FC<RouteComponentProps> = props => {
    const [activity, setActivity] = useState<Activity>();
    const [activityStreams, setActivityStreams] = useState<ActivityStreams>();
    const [efforts, setEfforts] = useState<Effort[]>([]);
    const [sortedEfforts, requestSort, sortConfig] = useSortableData(efforts, { key: 'time', direction: 'ascending' });
    const [selectedEffort, setSelectedEffort] = useState<Effort>();

    const [modalVisible, setModalVisible] = useState<boolean>(false);

    const axios = useAxios();

    const { id } = props.match.params as any;
    const activityUrl = '/activities/' + id;

    useEffect(() => {
        fetchActivity();
        fetchEfforts();
        fetchStreams();

        const checkIfClickedOutside = (e: MouseEvent) => {
            if ((e.target as HTMLElement).id == 'root') {
                setSelectedEffort(undefined);
            }
        }
        document.addEventListener("click", checkIfClickedOutside)
        return () => {
            document.removeEventListener("click", checkIfClickedOutside)
        }
    }, []);

    const fetchActivity = async () => {
        const response = await axios.get(activityUrl);
        setActivity(response.data);
    }

    const fetchEfforts = async () => {
        const response = await axios.get(activityUrl + '/efforts');
        setEfforts(response.data);
    }

    const fetchStreams = async () => {
        const response = await axios.get(activityUrl + '/streams');
        const streams: ActivityStreams = response.data;
        setActivityStreams(streams);
    }

    const flagActivity = async (e: FormEvent) => {
        if (!activity)
            return;
        e.preventDefault();
        setModalVisible(false);

        try {
            const response = await axios.patch(activityUrl, { flagged: !activity.flagged });

            if (response.status === 200) {
                fetchEfforts();
                setActivity({
                    ...activity, flagged: !activity.flagged
                });
            }
        }
        catch (err) {
            console.log(err)
        }
    }

    const renderTableData = () => {
        return sortedEfforts.map((effort) => {
            const { id, distance, time, rank, ordinal } = effort;
            return (
                <tr key={id} onClick={() => setSelectedEffort(effort)}>
                    <td>{ordinal > rank ? <div title={prDescription(rank)}>{prMedal(rank)}</div> : ""}</td>
                    <td><Link to={'/distances/' + distance.id} >{effort === selectedEffort ? <b>{distance.name}</b> : distance.name}</Link></td>
                    <td>{secondsToString(time)}</td>
                    <td>{secondsToString(time * 1000 / distance.length)}</td>
                </tr>
            )
        })
    }

    return (
        <>
            <PageTitle title={"Activity " + (activity ? activity.name : "")} >
                <Button variant="secondary" onClick={() => setModalVisible(true)} >
                    {activity && activity.flagged ? "Unflag" : "Flag"}
                </Button>
            </PageTitle>

            {activity &&
                <BasicModal visible={modalVisible}
                    title={activity.flagged ? "Unflag activity" : "Flag activity"}
                    message={"Are you sure you want to " + (activity.flagged ? "unflag" : "flag") + " this activity?"}
                    onHide={() => setModalVisible(false)}
                    handleSubmit={flagActivity} />
            }

            <Statistic name="All efforts">
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th scope="col"></th>
                            <th scope="col">Distance</th>
                            <th scope="col">Time</th>
                            <th scope="col">Pace </th>
                        </tr>
                    </thead>
                    <tbody>
                        {efforts && renderTableData()}
                    </tbody>
                </table>
            </Statistic>

            {
                activityStreams &&
                <>
                    <ActivityMap streams={activityStreams} effort={selectedEffort} />
                    <Container>
                        <AltitudeChart streams={activityStreams} effort={selectedEffort}></AltitudeChart>
                    </Container>
                </>
            }
        </>
    );
}


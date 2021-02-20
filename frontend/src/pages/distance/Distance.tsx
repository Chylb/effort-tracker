import React, { FormEvent, useEffect, useState } from 'react';
import { Button } from "react-bootstrap";
import { Link, RouteComponentProps } from 'react-router-dom';
import { PageTitle } from '../../components/shared/PageTitle';
import { secondsToString } from '../../utils/secondsToString';
import { Distance } from '../../types/distance';
import { Statistic } from '../../components/shared/Statistic';
import { Effort } from '../../types/effort';
import EffortCanvas from '../../components/shared/EffortCanvas';
import { BasicModal } from '../../components/shared/BasicModal';
import { useAxios } from '../../hooks/useAxios';

export const DistancePage: React.FC<RouteComponentProps> = props => {
    const [distance, setDistance] = useState<Distance>();
    const [efforts, setEfforts] = useState<Effort[]>([]);
    const [seasonBest, setSeasonBest] = useState<Effort[]>();
    const [allTimeBest, setAllTimeBest] = useState<Effort[]>();

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
            setEfforts(response.data);
        }
        fetchEfforts();

        const fetchSeasonBest = async () => {
            const response = await axios.get(distanceUrl + '/seasonBest?year=2020');
            setSeasonBest(response.data);
        }
        fetchSeasonBest();

        const fetchAllTimeBest = async () => {
            const response = await axios.get(distanceUrl + '/allTimeBest');
            setAllTimeBest(response.data);
        }
        fetchAllTimeBest();

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
                {seasonBest && <EffortCanvas data={seasonBest} by='month'></EffortCanvas>}
            </Statistic>

            <Statistic name="All time best efforts">
                {allTimeBest && <EffortCanvas data={allTimeBest} by='year'></EffortCanvas>}
            </Statistic>

            <Statistic name="All efforts">
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th scope="col">Activity</th>
                            <th scope="col">Date</th>
                            <th scope="col">Time</th>
                            <th scope="col">Pace</th>
                        </tr>
                    </thead>
                    <tbody>
                        {efforts && renderTableData()}
                    </tbody>
                </table>
            </Statistic>
        </>
    );
}


import React, { FormEvent, useEffect, useState } from 'react';
import { Button } from "react-bootstrap";
import { Link, RouteComponentProps } from 'react-router-dom';
import { PageTitle } from '../../components/shared/PageTitle';
import { secondsToString } from '../../utils/secondsToString';
import { Distance } from '../../types/distance';
import { Statistic } from '../../components/shared/Statistic';
import { Effort } from '../../types/efforts';
import EffortCanvas from '../../components/shared/EffortCanvas';
import { BasicModal } from '../../components/shared/BasicModal';

export const DistancePage: React.FC<RouteComponentProps> = props => {
    const [distance, setDistance] = useState<Distance>();
    const [efforts, setEfforts] = useState<Effort[]>([]);
    const [seasonBest, setSeasonBest] = useState<Effort[]>();
    const [allTimeBest, setAllTimeBest] = useState<Effort[]>();

    const [modalVisible, setModalVisible] = useState<boolean>(false);

    const { id } = props.match.params as any;
    const distanceUrl = 'http://localhost:8080/api/distances/' + id;

    useEffect(() => {
        fetch(distanceUrl, {
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            }
        })
            .then(x => x.json())
            .then(x => setDistance(x));

        fetch(distanceUrl + '/efforts', {
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            }
        })
            .then(x => x.json())
            .then(x => setEfforts(x));

        fetch(distanceUrl + '/seasonBest?year=2020', {
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            }
        })
            .then(x => x.json())
            .then(x => setSeasonBest(x));

        fetch(distanceUrl + '/allTimeBest', {
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            }
        })
            .then(x => x.json())
            .then(x => setAllTimeBest(x));
    }, []);

    const deleteDistance = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(distanceUrl, {
                mode: 'cors',
                credentials: 'include',
                method: 'DELETE',
            })

            if (!response.ok) {
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

            {/* <DeleteDistanceModal show={this.state.showModal} onHide={this.hideModal} onSubmit={this.handleSubmit} /> */}
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


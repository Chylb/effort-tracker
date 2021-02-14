import React, { useEffect, useState } from 'react';
import { FormEvent } from 'react';
import { Button } from "react-bootstrap";
import { Link, RouteComponentProps } from 'react-router-dom';
import { BasicModal } from '../../components/shared/BasicModal';
import { PageTitle } from '../../components/shared/PageTitle';
import { Statistic } from '../../components/shared/Statistic';
import { Activity } from '../../types/activity';
import { Effort } from '../../types/efforts';
import { secondsToString } from '../../utils/secondsToString';

export const ActivityPage: React.FC<RouteComponentProps> = props => {
    const [activity, setActivity] = useState<Activity>();
    const [efforts, setEfforts] = useState<Effort[]>([]);

    const [modalVisible, setModalVisible] = useState<boolean>(false);

    const { id } = props.match.params as any;
    const activityUrl = 'http://localhost:8080/api/activities/' + id;

    useEffect(() => {
        fetch(activityUrl, {
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            }
        })
            .then(x => x.json())
            .then(x => setActivity(x));

        fetch(activityUrl + '/efforts', {
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            }
        })
            .then(x => x.json())
            .then(x => setEfforts(x));
    }, []);

    const flagActivity = async (e: FormEvent) => {
        if (!activity)
            return;
        e.preventDefault();
        setModalVisible(false);

        try {
            const response = await fetch('http://localhost:8080/api/activities/' + id, {
                mode: 'cors',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'PATCH',
                body: JSON.stringify({ flagged: !activity.flagged })
            })

            if (response.ok) {
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
        return efforts.map((effort) => {
            const { id, distance, time } = effort;
            return (
                <tr key={id}>
                    <td><Link to={'/distances/' + distance.id} >{distance.name}</Link></td>
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
                            <th scope="col">Distance</th>
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


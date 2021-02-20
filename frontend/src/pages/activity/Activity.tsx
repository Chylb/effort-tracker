import React, { useEffect, useState } from 'react';
import { FormEvent } from 'react';
import { Button } from "react-bootstrap";
import { Link, RouteComponentProps } from 'react-router-dom';
import { BasicModal } from '../../components/shared/BasicModal';
import { PageTitle } from '../../components/shared/PageTitle';
import { Statistic } from '../../components/shared/Statistic';
import { useAxios } from '../../hooks/useAxios';
import { Activity } from '../../types/activity';
import { Effort } from '../../types/effort';
import { number2emoji } from '../../utils/emoji';
import { secondsToString } from '../../utils/secondsToString';

export const ActivityPage: React.FC<RouteComponentProps> = props => {
    const [activity, setActivity] = useState<Activity>();
    const [efforts, setEfforts] = useState<Effort[]>([]);

    const [modalVisible, setModalVisible] = useState<boolean>(false);

    const axios = useAxios();

    const { id } = props.match.params as any;
    const activityUrl = '/activities/' + id;

    useEffect(() => {
        const fetchActivity = async () => {
            const response = await axios.get(activityUrl);
            setActivity(response.data);
        }
        fetchActivity();

        fetchEfforts();
    }, []);

    const fetchEfforts = async () => {
        const response = await axios.get(activityUrl + '/efforts');
        setEfforts(response.data);
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

    const rank2description = (rank: number) => {
        switch (rank) {
            case 1:
                return "Personal record"
            case 2:
                return "2nd fastest time"
            case 3:
                return "3rd fastest time"
            default:
                return "";
        }
    }

    const renderTableData = () => {
        return efforts.map((effort) => {
            const { id, distance, time, rank, ordinal } = effort;
            return (
                <tr key={id}>
                    <td>{ordinal > rank ? <div title={rank2description(rank + 1)}>{number2emoji(rank + 1)}</div> : ""}</td>
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
                            <th scope="col"></th>
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


import React from "react";
import { Container } from "react-bootstrap";

import ReactMapboxGl, { GeoJSONLayer, ZoomControl } from 'react-mapbox-gl';
import { ActivityStreams } from "../../types/activityStreams";
import { Effort } from "../../types/effort";

interface Props {
    streams: ActivityStreams
    effort?: Effort | undefined
}

const Map = ReactMapboxGl({
    accessToken: process.env.REACT_APP_MAPBOX_API_KEY!,
    scrollZoom: false
});

export const ActivityMap: React.FC<Props> = props => {
    const reverseLatLong = (arr: Number[][]) => {
        for (let i = 0; i < arr.length; i++) {
            const tmp = arr[i][0];
            arr[i][0] = arr[i][1];
            arr[i][1] = tmp;
        }
    }

    const coordinates = JSON.parse(JSON.stringify(props.streams.latlng.data));
    reverseLatLong(coordinates);

    const activityLinePaint = {
        'line-color': '#FF0000',
        'line-width': 3
    };

    const effortLinePaint = {
        'line-color': '#105cb6',
        'line-width': 3
    };

    const getGeoJsonData = (coordinates: any) => {
        return {
            'type': 'FeatureCollection',
            'features': [
                {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'LineString',
                        'coordinates': coordinates
                    }
                }
            ]
        }
    }

    return (
        <Container className="py-4">
            <Map
                style="mapbox://styles/mapbox/outdoors-v11"
                center={coordinates[0]}
                zoom={[13]}
                containerStyle={{
                    height: '400px',
                    width: 'auto'
                }}
            >
                <ZoomControl />
                <GeoJSONLayer
                    data={getGeoJsonData(coordinates)}
                    linePaint={activityLinePaint}
                />
                {props.effort && <GeoJSONLayer
                    data={getGeoJsonData(coordinates.slice(props.effort.ix0, props.effort.ix1))}
                    linePaint={effortLinePaint}
                />}
            </Map>
        </Container>
    );
}


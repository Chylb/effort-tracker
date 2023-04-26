import React from "react";
import { Container } from "react-bootstrap";

import ReactMapboxGl, { GeoJSONLayer, ZoomControl } from '@infamoustrey/react-mapbox-gl';
import { ActivityStreams } from "../../types/activityStreams";
import { Effort } from "../../types/effort";

// @ts-ignore 
// eslint-disable-next-line import/no-webpack-loader-syntax
import mapboxgl from '!mapbox-gl';

interface Props {
    streams: ActivityStreams
    effort?: Effort | undefined
}

const Map = ReactMapboxGl({
    accessToken: process.env.REACT_APP_MAPBOX_API_KEY!,
    scrollZoom: false
});

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

const reverseLatLong = (arr: Number[][]) => {
    for (let i = 0; i < arr.length; i++) {
        const tmp = arr[i][0];
        arr[i][0] = arr[i][1];
        arr[i][1] = tmp;
    }
}

const getCenter = (coordinates: [number, number][]): [number, number] => {
    let latMin = Number.POSITIVE_INFINITY;
    let latMax = Number.NEGATIVE_INFINITY;
    let lngMin = Number.POSITIVE_INFINITY;
    let lngMax = Number.NEGATIVE_INFINITY;

    for (const [lat, lng] of coordinates) {
        latMin = Math.min(latMin, lat);
        latMax = Math.max(latMax, lat);
        lngMin = Math.min(lngMin, lng);
        lngMax = Math.max(lngMax, lng);
    }
    return [(latMin + latMax) / 2, (lngMin + lngMax) / 2];
}

export const ActivityMap: React.FC<Props> = props => {
    const coordinates = JSON.parse(JSON.stringify(props.streams.latlng.data));
    reverseLatLong(coordinates);

    return (
        <Container className="py-4">
            <Map
                style="mapbox://styles/mapbox/outdoors-v11"
                center={getCenter(props.effort != undefined ? coordinates.slice(props.effort.ix0, props.effort.ix1) : coordinates)}
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


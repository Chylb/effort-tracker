import React from "react";
import { Container } from "react-bootstrap";

import ReactMapboxGl, { GeoJSONLayer, ZoomControl } from 'react-mapbox-gl';
import Polyline from '@mapbox/polyline';

interface Props {
    polyline: string;
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

    const decodedPolyline = Polyline.decode(props.polyline);
    reverseLatLong(decodedPolyline);

    const linePaint = {
        'line-color': '#FF0000',
        'line-width': 3
    };

    const geoJsonData = {
        'type': 'FeatureCollection',
        'features': [
            {
                'type': 'Feature',
                'geometry': {
                    'type': 'LineString',
                    'coordinates': decodedPolyline
                }
            }
        ]
    };

    return (
        <Container className="py-4">
            <Map
                style="mapbox://styles/mapbox/outdoors-v11"
                center={decodedPolyline[0]}
                zoom={[13]}
                containerStyle={{
                    height: '400px',
                    width: 'auto'
                }}
            >
                <ZoomControl />
                <GeoJSONLayer
                    data={geoJsonData}
                    linePaint={linePaint}
                />
            </Map>
        </Container>
    );
}


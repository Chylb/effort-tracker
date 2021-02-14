import React from 'react';
import { Container } from "react-bootstrap";

interface Props {
    name: string;
    children?: React.ReactNode;
}

export const Statistic: React.FC<Props> = props => {
    return (
        <Container className="py-4">
            <h2>{props.name}</h2>
            <br />
            {props.children}
        </Container>
    )
}
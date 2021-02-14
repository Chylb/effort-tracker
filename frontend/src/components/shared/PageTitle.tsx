import React from "react";
import { Container } from "react-bootstrap";

interface Props {
    title: string;
    children?: React.ReactNode;
}

export const PageTitle: React.FC<Props> = props => {
    return (
        <>
            <Container className="py-4">
                <div className="float-left">
                    <h1>{props.title}</h1>
                </div>
                <div className="float-right">
                    {props.children}
                </div>
            </Container>
            <br />
        </>
    );
}
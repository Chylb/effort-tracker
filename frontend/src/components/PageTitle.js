import React from 'react';
import { Container } from "react-bootstrap";

function PageTitle(props) {
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
    )
}

export default PageTitle;
import React from 'react';
import { Container } from "react-bootstrap";

function Statistic(props) {
	return (
		<Container className="py-4">
			<h2>{props.name}</h2>
			<br />
			{props.children}
		</Container>
	)
}

export default Statistic;
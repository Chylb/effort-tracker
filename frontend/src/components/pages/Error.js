import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Container } from "react-bootstrap";

class Error extends Component {

	render() {
		return (
			<Container className="text-center" style={{ paddingTop: "128px", paddingBottom: "128px" }}>
				<span className="display-1">404</span>
				<div className="mb-4 lead">The page you are looking for was not found.</div>
				<Link to='/home'>Back to Home</Link>
			</Container>
		);
	}
}

export default Error;
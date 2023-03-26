import React from 'react';
import { Navbar, Nav } from "react-bootstrap";

export const LoginHeader: React.FC = () => {
	return (
		<>
			<Navbar variant="dark" expand="md" className="p-0" style={headerStyle}>
				<Navbar.Brand href="/home" className="p-0" > <img src={process.env.PUBLIC_URL + "/logo.png"} height="56" alt="logo" /> </Navbar.Brand>

				<Nav className="ml-auto">
					<a href={process.env.REACT_APP_BACKEND_URL! + '/oauth2/authorization/strava'}><img src={process.env.PUBLIC_URL + "/connect_with_strava.png"} alt="connect with strava" /></a>
				</Nav>

			</Navbar>
		</>
	)
}

const headerStyle = {
	background: '#49505755',
}
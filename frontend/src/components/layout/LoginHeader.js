import React from 'react';
import { Navbar, Nav } from "react-bootstrap";

function LoginHeader() {
	return (
		<>
			<Navbar variant="dark" expand="md" className="p-0" style={headerStyle}>
				<Navbar.Brand href="/home" className="p-0" > <img src="/logo.png" height="56" alt="logo" /> </Navbar.Brand>

				<Nav className="ml-auto">
					<a href="http://localhost:8080/oauth2/authorization/strava"><img src="/connect_with_strava.png" alt="connect with strava" /></a>
				</Nav>

			</Navbar>
		</>
	)
}

const headerStyle = {
	background: '#49505755',
}

export default LoginHeader;
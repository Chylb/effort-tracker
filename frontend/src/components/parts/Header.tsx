import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Dropdown, NavItem, NavLink } from "react-bootstrap";
import { useAuth } from '../../hooks/useAuth';
import { LoginHeader } from './LoginHeader';

export const Header: React.FC = () => {
	const { isAuthenticated, isLoading, athlete, logout } = useAuth();

	return (
		<> { isAuthenticated || isLoading ?
			<Navbar bg="dark" variant="dark" expand="md" className="p-0 mb-3">
				<Navbar.Brand as={Link} to="/home" className="p-0" > <img src={process.env.PUBLIC_URL + "/logo.png"} height="56" alt="logo" /> </Navbar.Brand>
				<Navbar.Toggle aria-controls="responsive-navbar-nav" />
				<Navbar.Collapse id="responsive-navbar-nav">
					<Nav className="mr-auto">
						<Nav.Link as={Link} to="/home">Home</Nav.Link>
						<Nav.Link as={Link} to="/activities">Activities</Nav.Link>
						<Nav.Link as={Link} to="/distances">Distances</Nav.Link>
					</Nav>

					{isAuthenticated &&
						<Nav className="ml-auto">
							<Dropdown as={NavItem}>
								<Dropdown.Toggle as={NavLink}>
									<img
										className="px-2"
										src={athlete?.profilePicture}
										alt="user avatar"
										height="32"
									/>
									{athlete?.name}
								</Dropdown.Toggle>
								<Dropdown.Menu>
									<Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
								</Dropdown.Menu>
							</Dropdown>

							<a href="https://www.strava.com"><img src={process.env.PUBLIC_URL + "/powered_by_strava.svg"} height="56" alt="strava" /></a>
						</Nav>
					}
				</Navbar.Collapse>
			</Navbar>
			:
			<LoginHeader />
		}
		</>
	);
}
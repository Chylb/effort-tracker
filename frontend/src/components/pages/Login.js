import React, { Component } from 'react';
import { Carousel, Container } from 'react-bootstrap';
import LoginHeader from '../layout/LoginHeader.js';

class Login extends Component {
	constructor(props) {
		super(props);
		this.registrationAlert = React.createRef();
		document.body.style = 'background-image: url(background.jpg);background-size: cover;';
	}

	componentDidMount() {
		document.getElementsByTagName("FOOTER").item(0).style.filter = "invert(100%)";
	}

	render() {
		return (
			<>
				{!localStorage.getItem("username") && < LoginHeader />}

				<Container style={{ width: "1009px" }} className="py-5">
					<Carousel interval={5000}>
						<Carousel.Item>
							<img
								src="features/activity.png"
								alt="1 slide"
							/>
						</Carousel.Item>
						<Carousel.Item>
							<img
								src="features/distances.png"
								alt="2 slide"
							/>
						</Carousel.Item>
						<Carousel.Item>
							<img
								src="features/distance.png"
								alt="3 slide"
							/>
						</Carousel.Item>
						<Carousel.Item>
							<img
								src="features/home.png"
								alt="4 slide"
							/>
						</Carousel.Item>
					</Carousel>
				</Container>
			</>
		);
	}

}

export default Login;
import React, { useEffect } from 'react';
import { Container, Carousel } from "react-bootstrap";

export const Login: React.FC = () => {
    useEffect(() => {
        document.body.style.backgroundImage = 'url(background.jpg)';
        document.body.style.backgroundSize = 'cover';

        const footer: HTMLElement = document.getElementById('FOOTER')!;
        footer.style.filter = 'invert(100%)';

        return () => {
            document.body.style.backgroundImage = '';

            const footer: HTMLElement = document.getElementById('FOOTER')!;
            footer.style.filter = '';
        }
    });

    return (
        <>
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


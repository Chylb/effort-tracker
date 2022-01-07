import React, { useEffect } from 'react';
import { Container, Carousel } from "react-bootstrap";
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Login: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const history = useHistory();
    
    useEffect(() => {
        if(isAuthenticated) {
            history.replace("/home");
        }
        
        document.body.style.backgroundImage = 'url(' + process.env.PUBLIC_URL + '/background.jpg)';
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
                <Carousel interval={5000} fade={false}>
                    <Carousel.Item>
                        <img
                            src={process.env.PUBLIC_URL + '/features/activity.png'}
                            alt="1 slide"
                        />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                            src={process.env.PUBLIC_URL + '/features/distances.png'}
                            alt="2 slide"
                        />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                            src={process.env.PUBLIC_URL + '/features/distance.png'}
                            alt="3 slide"
                        />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                            src={process.env.PUBLIC_URL + '/features/home.png'}
                            alt="4 slide"
                        />
                    </Carousel.Item>
                </Carousel>
            </Container>
        </>
    );
}


import React, { useEffect } from 'react';

export const SuccessfulLogin: React.FC = () => {
    useEffect(() => {
        fetch('http://localhost:8080/api/athlete', {
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            }
        })
            .then(x => x.json())
            .then(x => loadUser(x));
    }, []);

    const loadUser = (data: any) => {
        localStorage.setItem("username", data.name);
        localStorage.setItem("avatar", data.profilePicture);
        window.location.href = "/home";
    }

    return (
        <>
        </>
    );
}


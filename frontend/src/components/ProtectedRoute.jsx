import { Route, Redirect } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({
    component: Component,
    ...rest
}) => {

    const { isAuthenticated, isLoading } = useAuth();

    return (
        <Route
            {...rest}
            render={props => {
                if (isAuthenticated || isLoading) {
                    return <>
                        <Component {...props} />;
                    </>

                } else {
                    return (
                        <Redirect
                            to={{
                                pathname: "/login",
                                state: {
                                    from: props.location
                                }
                            }}
                        />
                    );
                }
            }}
        />
    );
};
import axios, { AxiosError } from "axios";
import { useAuth } from "./useAuth";
import {useHistory} from 'react-router-dom';

export const useAxios = () => {
    const { logout } = useAuth();
    const history = useHistory();

    const errorInterceptor = (error: AxiosError<any>) => {
        if (error.response === undefined || error.response!.status === 401 ) {
            logout();
            history.replace("/login");
            throw error;
        }
        else if(error.response!.status === 403 || error.response!.status === 404) {
            history.push("/error");
        }
        return error.response;
    }

    const instance = axios.create({
        baseURL: process.env.REACT_APP_BACKEND_URL! + '/api',
        withCredentials: true,
        headers: {
            'Accept': 'application/json',
        }
    });

    instance.interceptors.response.use(res => res, errorInterceptor);

    return instance;
}
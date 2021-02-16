import axios, { AxiosError, AxiosResponse } from "axios";
import { useAuth } from "./useAuth";

export const useAxios = () => {
    const { logout } = useAuth();

    const authenticationInterceptor = (response: AxiosResponse<any>) => {
        if (response.status === 401 && response.data == '') {
            logout();
            return Promise.reject('unauthenticated');
        }
        return response;
    }

    const errorInterceptor = (error: AxiosError<any>) => {
        if (error.response && error.response.data) {
            return Promise.reject(error.response.data);
        }

        logout();
        return Promise.reject(error.message);
    }

    const instance = axios.create({
        baseURL: 'http://localhost:8080/api',
        withCredentials: true,
        headers: {
            'Accept': 'application/json',
        }
    });

    instance.interceptors.response.use(authenticationInterceptor, errorInterceptor);

    return instance;
}
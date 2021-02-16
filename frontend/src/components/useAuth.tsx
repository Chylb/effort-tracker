import { createContext, useContext, useState, useEffect } from "react";
import { Athlete } from "../types/athlete";
import { deleteCookies } from "../utils/deleteCookies";

type AuthContextData = ReturnType<typeof useProvideAuth>;

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider: React.FC = ({ children }) => {
    const auth = useProvideAuth();
    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

const useProvideAuth = () => {
    const [athlete, setAthlete] = useState<Athlete>();
    const [isLoading, setLoading] = useState(true);
    const [isAuthenticated, setAuthenticated] = useState(false);

    const logout = () => {
        setAuthenticated(false);
        setAthlete(undefined);
        deleteCookies();
    }

    useEffect(() => {
        const initAuth = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/athlete', {
                    mode: 'cors',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                    }
                });

                if (response.ok) {
                    const athlete = await response.json();
                    setAthlete(athlete);
                    setAuthenticated(true);
                }
            }
            catch { }

            if (!isAuthenticated) {
                deleteCookies();
            }

            setLoading(false);
        };

        initAuth();
    }, []);

    return {
        athlete,
        isLoading,
        isAuthenticated,
        logout
    };
};
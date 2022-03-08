import React, {createContext, useContext, useEffect, useMemo, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import Cookies from "js-cookie";
import API from "./API";

export interface AuthContextType {
    authentication?: string,
    username?: string,
    loading: boolean,
    authErrors?: any,
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const AuthService: React.FC = ({children}) => {
    const [authentication, setAuthentication] = useState<string | undefined>(Cookies.get()?.authentication);
    const [username, setUsername] = useState<string | undefined>(Cookies.get()?.username)
    const [authErrors, setAuthErrors] = useState<any>();
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingInitial, setLoadingInitial] = useState<boolean>(true);

    const navigate = useNavigate();
    const location = useLocation();

    // reset errors if revisit page
    useEffect(() => {
        if (authErrors) setAuthErrors(null);
    }, [location.pathname])

    useEffect(() => {
        readCookie()
                .then(({authentication, username}) => {
                    setAuthentication(authentication);
                    setUsername(username);
                })
                .finally(() => setLoadingInitial(false));
    }, []);

    const login = async (username: string, password: string) => {
        setLoading(true);

        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        try {
            await API.post(
                    '/api/user/login',
                    {'username': username, 'password': password},
                    {withCredentials: true}
            );

            readCookie().then(({authentication, username}) => {
                setAuthentication(authentication);
                setUsername(username);
            })

            navigate('/', {replace: true})

            setLoading(false);
            return true;

        } catch (error: any) {
            setAuthErrors(error.response?.data?.error);
            //TODO: fallback error
        }
        setLoading(false);
        return false;
    }

    const logout = () => {
        unsetCookie().then(() => setAuthentication(undefined))
        navigate('/login', {replace: true})
    }

    async function readCookie() {
        return {
            'authentication': Cookies.get()?.authentication,
            'username': Cookies.get()?.username
        };
    }

    async function unsetCookie() {
        Cookies.remove('authentication');
        Cookies.remove('username');
    }

    const memorizedValue = useMemo(() => ({
        authentication, username, loading, authErrors, login, logout
    }), [authentication, loading, authErrors])

    return (
            <AuthContext.Provider value={memorizedValue}>
                {!loadingInitial && children}
            </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext);
}
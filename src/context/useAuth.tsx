import React, { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { loginAPI, registerAPI } from "~/services/AuthService";
import { UserProfile } from "~/types/User";

type UserContextType = {
    user: UserProfile | null;
    token: string | null;
    registerUser: (email: string, username: string, password: string) => Promise<void>;
    loginUser: (username: string, password: string) => Promise<void>;
    logout: () => void;
    isLoggedIn: () => boolean;
};

const UserContext = createContext<UserContextType>({} as UserContextType);

type Props = {
    children: React.ReactNode;
};

export const UserProvider: React.FC<Props> = ({ children }) => {
    const navigate = useNavigate();
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isReady, setIsReady] = useState(false);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if (storedUser && storedToken) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setToken(storedToken);
            axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        }

        setIsReady(true);
    }, []);

    const registerUser = async (email: string, username: string, password: string) => {
        try {
            const res = await registerAPI(email, username, password);
            if (res?.data) {
                handleAuthSuccess(res.data);
                toast.success("Register successful!");
                navigate("/");
            }
        } catch (error) {
            toast.error("Registration failed. Please try again.");
        }
    };

    const loginUser = async (username: string, password: string) => {
        try {
            const res = await loginAPI(username, password);
            if (res?.data) {
                handleAuthSuccess(res.data);
                toast.success("Login successful!");
                navigate("/");
            }
        } catch (error) {
            toast.error("Login failed. Please try again.");
        }
    };

    const handleAuthSuccess = (data: any) => {
        const userObj: UserProfile = {
            userName: data.userName,
            email: data.email,
        };

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(userObj));

        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        setToken(data.token);
        setUser(userObj);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
        navigate("/");
    };

    const isLoggedIn = () => !!user;

    return (
        <UserContext.Provider value={{ user, token, registerUser, loginUser, logout, isLoggedIn }}>
            {isReady ? children : null}
        </UserContext.Provider>
    );
};

export const useAuth = () => React.useContext(UserContext);

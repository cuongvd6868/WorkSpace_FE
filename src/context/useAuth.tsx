import React, { createContext, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { googleLoginAPI, loginAPI, registerAPI } from "~/services/AuthService";
import { UserProfile } from "~/types/User";
import { setupAxiosInterceptors } from "~/config/axiosConfig"; 
import { chatApi, ownerApi } from "~/services/ChatService";

type UserContextType = {
    user: UserProfile | null;
    token: string | null;
    registerUser: (email: string, username: string, password: string, confirmPassword: string) => Promise<void>;
    loginUser: (email: string, password: string) => Promise<void>; 
    googleLogin: (idToken: string) => Promise<void>;
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

const logout = useCallback(() => {
        localStorage.clear(); 
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common["Authorization"];
        window.location.href = "/"; // Force reload app để xóa sạch State ngầm
    }, []);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");
        if (storedUser && storedToken) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setToken(storedToken);
                axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
            } catch (e) {
                localStorage.clear();
            }
        }
        setIsReady(true);
    }, []);

useEffect(() => {
        if (isReady) {
            setupAxiosInterceptors(axios, logout, navigate);
            
            setupAxiosInterceptors(chatApi, logout, navigate);

            setupAxiosInterceptors(ownerApi, logout, navigate);
        }
    }, [isReady, logout, navigate]);
    const handleAuthSuccess = (data: any) => {
        const userObj: UserProfile = {
            userName: data.userName || data.username,
            email: data.email,
            roles: data.roles || []
        };

        localStorage.setItem("token", data.jwToken);
        localStorage.setItem("user", JSON.stringify(userObj));

        axios.defaults.headers.common["Authorization"] = `Bearer ${data.jwToken}`;
        setToken(data.jwToken);
        setUser(userObj);
    };

    const registerUser = async (email: string, username: string, password: string, confirmPassword: string) => {
        try {
            const res = await registerAPI(email, username, password, confirmPassword);
            if (res?.data) {
                handleAuthSuccess(res.data);
                toast.success("Đăng ký thành công!");
                navigate("/");
            }
        } catch (error) {
            toast.error("Đăng ký thất bại.");
        }
    };

    const loginUser = async (email: string, password: string) => {
        try {
            const res = await loginAPI(email, password);
            if (res?.data) {
                handleAuthSuccess(res.data);
                toast.success("Đăng nhập thành công!");

                const roles = res.data.roles || [];
                if (roles.includes("Owner")) navigate("/owner");
                else if (roles.includes("Staff")) navigate("/staff");
                else if (roles.includes("Admin")) navigate("/admin");
                else navigate("/");
            }
        } catch (error) {
            toast.error("Tên đăng nhập hoặc mật khẩu không đúng!");
        }
    };

    const googleLogin = async (idToken: string) => {
        try {
            const res = await googleLoginAPI(idToken);
            if (res?.data) {
                handleAuthSuccess(res.data);
                toast.success("Đăng nhập Google thành công!");
                const roles = res.data.roles || [];
                if (roles.includes("Owner")) navigate("/owner");
                else if (roles.includes("Staff")) navigate("/staff");
                else if (roles.includes("Admin")) navigate("/admin");
                else navigate("/");
            }
        } catch (error) {
            toast.error("Đăng nhập Google thất bại.");
        }
    };

    const isLoggedIn = () => !!user;

    return (
        <UserContext.Provider value={{ user, token, registerUser, loginUser, googleLogin, logout, isLoggedIn }}>
            {/* Chỉ render Children khi IsReady để tránh lỗi gọi API lúc chưa có Token */}
            {isReady ? children : (
                <div className="flex items-center justify-center h-screen">Đang tải...</div>
            )}
        </UserContext.Provider>
    );
};

export const useAuth = () => React.useContext(UserContext);
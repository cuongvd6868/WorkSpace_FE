import React, { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { googleLoginAPI, loginAPI, registerAPI } from "~/services/AuthService";
import { UserProfile } from "~/types/User";
import { setupAxiosInterceptors } from "~/config/axiosConfig"; 

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

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common["Authorization"];
        // navigate("/");
    };

    // --- EFFECT 1: Load user và thiết lập Axios Header khi mount ---
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if (storedUser && storedToken) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setToken(storedToken);
                // Thiết lập header ngay lập tức
                axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
            } catch (error) {
                // Xử lý nếu JSON.parse lỗi (dữ liệu hỏng)
                console.error("Error parsing stored user data:", error);
                logout(); 
            }
        }
        
        setIsReady(true);
    }, []);

    useEffect(() => {
        setupAxiosInterceptors(logout, navigate); 
    }, [logout]); 

    // Hàm xử lý thành công (Đăng nhập/Đăng ký)
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

    // Hàm Đăng ký
    const registerUser = async (email: string, username: string, password: string, confirmPassword: string) => {
        try {
            const res = await registerAPI(email, username, password, confirmPassword);
            if (res?.data) {
                handleAuthSuccess(res.data);
                toast.success("Register successful!");
                navigate("/");
            }
        } catch (error) {
            toast.error("Registration failed. Please try again.");
        }
    };

    // Hàm Đăng nhập
const loginUser = async (email: string, password: string) => {
    try {
        const res = await loginAPI(email, password);
        if (res?.data) {

            const roles = res.data.roles || [];

            handleAuthSuccess(res.data);
            toast.success("Bạn vừa đăng nhập vào hệ thống!");

            if (roles.includes("Owner")) {
                navigate("/owner");
            } else if (roles.includes("Staff")) {
                navigate("/staff");
            } else if (roles.includes("Admin")) {
                navigate("/admin");
            } else {
                navigate("/");
            }
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
                const roles = res.data.roles || [];
                toast.success("Bạn vừa đăng nhập vào hệ thống!");
                if (roles.includes("Owner")) {
                navigate("/owner");
                } else if (roles.includes("Staff")) {
                    navigate("/staff");
                } else if (roles.includes("Admin")) {
                    navigate("/admin");
                } else {
                    navigate("/");
                }
            }
        } catch (error) {
            toast.error("Đăng nhập Google thất bại. Vui lòng thử lại.");
        }
    };

    const isLoggedIn = () => !!user;

    return (
        <UserContext.Provider value={{ user, token, registerUser, loginUser, googleLogin, logout, isLoggedIn }}>
            {isReady ? children : null}
        </UserContext.Provider>
    );
};

export const useAuth = () => React.useContext(UserContext);
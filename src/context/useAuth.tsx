import React, { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { loginAPI, registerAPI } from "~/services/AuthService";
import { UserProfile } from "~/types/User";
import { setupAxiosInterceptors } from "~/config/axiosConfig"; 

type UserContextType = {
    user: UserProfile | null;
    token: string | null;
    registerUser: (email: string, username: string, password: string, confirmPassword: string) => Promise<void>;
    loginUser: (email: string, password: string) => Promise<void>; 
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
        // Xóa thông tin Token và User
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
        // Xóa Authorization header khỏi Axios defaults
        delete axios.defaults.headers.common["Authorization"];
        navigate("/");
        // Không hiển thị toast ở đây, để Interceptor xử lý thông báo hết hạn
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

    // --- EFFECT 2: Thiết lập Interceptors để tự động xử lý lỗi 401/403 ---
    useEffect(() => {
        // Gọi hàm setupAxiosInterceptors và truyền hàm logout vào.
        // Interceptor này sẽ bắt lỗi 401/403 từ bất kỳ API nào và gọi logout().
        setupAxiosInterceptors(logout); 
    }, [logout]); // logout không đổi, nên có thể để [] hoặc [logout]

    // Hàm xử lý thành công (Đăng nhập/Đăng ký)
    const handleAuthSuccess = (data: any) => {
        const userObj: UserProfile = {
            userName: data.userName,
            email: data.email,
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
                handleAuthSuccess(res.data);
                toast.success("Bạn vừa đăng nhập vào hệ thống!");
                navigate("/");
            }
        } catch (error) {
            // Lỗi ở đây là do đăng nhập sai, không phải hết hạn token (Interceptor lo)
            toast.error("Login failed. Please try again.");
        }
    };

    const isLoggedIn = () => !!user;

    return (
        <UserContext.Provider value={{ user, token, registerUser, loginUser, logout, isLoggedIn }}>
            {isReady ? children : null}
        </UserContext.Provider>
    );
};

export const useAuth = () => React.useContext(UserContext);
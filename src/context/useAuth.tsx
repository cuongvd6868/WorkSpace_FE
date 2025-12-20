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

// Hàm gán token đồng bộ ngay lập tức cho các Instance
const setAxiosHeaderSync = (token: string | null) => {
    const instances = [axios, chatApi, ownerApi];
    instances.forEach(ins => {
        if (token) {
            ins.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
            delete ins.defaults.headers.common["Authorization"];
        }
    });
};

const UserContext = createContext<UserContextType>({} as UserContextType);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();

    // 1️⃣ KHỞI TẠO STATE & GẮN TOKEN NGAY LẬP TỨC (Dùng hàm để chạy đồng bộ)
    const [token, setToken] = useState<string | null>(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            setAxiosHeaderSync(storedToken); // Ép Axios có token trước khi Render
        }
        return storedToken;
    });

    const [user, setUser] = useState<UserProfile | null>(() => {
        const storedUser = localStorage.getItem("user");
        try {
            return storedUser ? JSON.parse(storedUser) : null;
        } catch {
            return null;
        }
    });

    const [isReady, setIsReady] = useState(false);

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
        setAxiosHeaderSync(null); // Xóa sạch token trong Header
        navigate("/login");
    }, [navigate]);

    // 2️⃣ CẤU HÌNH INTERCEPTORS SAU KHI COMPONENT MOUNT
    useEffect(() => {
        // Đăng ký interceptors cho các instance
        const id1 = setupAxiosInterceptors(axios, logout, navigate);
        const id2 = setupAxiosInterceptors(chatApi, logout, navigate);
        const id3 = setupAxiosInterceptors(ownerApi, logout, navigate);

        setIsReady(true);

        return () => {
            // Cleanup để tránh đăng ký trùng lặp khi re-render
            axios.interceptors.response.eject(id1);
            chatApi.interceptors.response.eject(id2);
            ownerApi.interceptors.response.eject(id3);
        };
    }, [logout, navigate]);

    const handleAuthSuccess = (data: any) => {
        const userObj: UserProfile = {
            userName: data.userName || data.username,
            email: data.email,
            roles: data.roles || []
        };
        localStorage.setItem("token", data.jwToken);
        localStorage.setItem("user", JSON.stringify(userObj));
        
        setAxiosHeaderSync(data.jwToken); // Cập nhật Header cho instance
        setToken(data.jwToken);
        setUser(userObj);
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

    return (
        <UserContext.Provider value={{ user, token, registerUser, loginUser, googleLogin, logout, isLoggedIn: () => !!user }}>
            {/* 3️⃣ QUAN TRỌNG: Chỉ render app khi hệ thống auth đã nạp xong token */}
            {isReady ? children : (
                <div className="flex items-center justify-center h-screen bg-gray-50">
                    <div className="text-gray-500 animate-pulse">Đang tải dữ liệu phiên làm việc...</div>
                </div>
            )}
        </UserContext.Provider>
    );
};

export const useAuth = () => React.useContext(UserContext);
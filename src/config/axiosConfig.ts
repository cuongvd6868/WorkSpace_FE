import { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { toast } from "react-toastify";

const registered = new Map<AxiosInstance, { req: number; res: number }>();

export const setupAxiosInterceptors = (
    instance: AxiosInstance, 
    logoutHandler: () => void,
    navigate: (path: string) => void
) => {
    // Xóa các interceptor cũ để tránh trùng lặp logic
    const existing = registered.get(instance);
    if (existing) {
        instance.interceptors.request.eject(existing.req);
        instance.interceptors.response.eject(existing.res);
    }

    // 1. Gắn Token mới nhất vào Header trước khi gửi request
    const reqId = instance.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            const token = localStorage.getItem("token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // 2. Xử lý lỗi từ Server (401: Hết hạn/Sai tài khoản)
    const resId = instance.interceptors.response.use(
        (response) => response,
        async (error) => {
            if (error.response?.status === 401) {
                instance.interceptors.response.eject(resId);
                logoutHandler();
                navigate("/login");
                toast.error("Phiên đăng nhập không hợp lệ hoặc đã hết hạn.");
                return new Promise(() => {}); 
            }
            if (error.response?.status === 403) {
                toast.error("Bạn không có quyền thực hiện hành động này.");
            }
            return Promise.reject(error);
        }
    );

    registered.set(instance, { req: reqId, res: resId });
};
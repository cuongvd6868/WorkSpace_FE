import { AxiosInstance } from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "~/utils/API";

export const setupAxiosInterceptors = (
    instance: AxiosInstance,
    logoutHandler: () => void,
    navigate: (path: string) => void
) => {
    /* -------------------------------------------------------
     * 1️⃣ REQUEST INTERCEPTOR: Gắn Token dự phòng
     * ------------------------------------------------------- */
    instance.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem("token");

            // Kiểm tra nếu request hướng tới Backend của bạn
            const isInternalRequest = 
                config.url?.includes(API_BASE_URL) || 
                !config.url?.startsWith("http");

            if (token && isInternalRequest) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            return config;
        },
        (error) => Promise.reject(error)
    );

    /* -------------------------------------------------------
     * 2️⃣ RESPONSE INTERCEPTOR: Xử lý lỗi 401/403
     * ------------------------------------------------------- */
    const interceptorId = instance.interceptors.response.use(
        (response) => response,
        async (error) => {
            const status = error.response?.status;
            const message = error.response?.data?.message || error.response?.data;

            if (status === 401) {
                // Chỉ logout nếu thực sự không có quyền hoặc token hết hạn
                console.warn("⛔ 401 Unauthorized tại:", error.config?.url);
                
                logoutHandler();
                navigate("/login");
                
                const errorMsg = message === "Token expired" 
                    ? "Phiên đăng nhập đã hết hạn." 
                    : "Bạn không có quyền truy cập hoặc phiên làm việc kết thúc.";
                
                toast.error(errorMsg);
                return Promise.reject(error);
            }

            if (status === 403) {
                toast.error("Bạn không có quyền truy cập vào chức năng này.");
                return Promise.reject(error);
            }

            return Promise.reject(error);
        }
    );

    return interceptorId;
};
import { AxiosInstance } from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "~/utils/API"; // Đảm bảo đường dẫn này đúng với dự án của bạn

export const setupAxiosInterceptors = (
    instance: AxiosInstance,
    logoutHandler: () => void,
    navigate: (path: string) => void
) => {
    
    /* -------------------------------------------------------
     * 1️⃣ REQUEST INTERCEPTOR: Tự động gắn Token vào Header
     * ------------------------------------------------------- */
    instance.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem("token");

            // KIỂM TRA ĐIỀU KIỆN GẮN TOKEN:
            // - Nếu có token trong localStorage
            // - Và URL request ĐANG hướng tới Backend của bạn (tránh gửi token sang Cloudinary/S3)
            const isInternalRequest = config.url?.includes(API_BASE_URL) || !config.url?.startsWith("http");

            if (token && isInternalRequest) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            return config;
        },
        (error) => Promise.reject(error)
    );

    /* -------------------------------------------------------
     * 2️⃣ RESPONSE INTERCEPTOR: Xử lý lỗi từ Server trả về
     * ------------------------------------------------------- */
    const interceptorId = instance.interceptors.response.use(
        (response) => response,

        async (error) => {
            const status = error.response?.status;
            const message = error.response?.data?.message || error.response?.data;
            const isNetworkError = !error.response;

            // Kiểm tra xem request này có mang theo Header Authorization không
            const hasAuthHeader = !!error.config?.headers?.Authorization;

            /* --- Trường hợp 1: Token hết hạn (Server trả message cụ thể) --- */
            if (status === 401 && message === "Token expired") {
                console.warn("⛔ Token expired — forcing logout");
                logoutHandler();
                navigate("/login");
                toast.dark("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
                return Promise.reject(error);
            }

            /* --- Trường hợp 2: 401 Unauthorized chung (Sai token, chưa đăng nhập) --- */
            if (status === 401) {
                console.warn("⚠️ 401 Unauthorized");
                logoutHandler();
                navigate("/login");
                toast.error("Bạn không có quyền truy cập hoặc phiên làm việc đã kết thúc.");
                return Promise.reject(error);
            }

            /* --- Trường hợp 3: 403 Forbidden (Đăng nhập rồi nhưng sai Role) --- */
            if (status === 403) {
                console.warn("⚠️ 403 Forbidden");
                toast.error("Bạn không có quyền truy cập vào chức năng này.");
                return Promise.reject(error);
            }

            /* --- Trường hợp 4: Lỗi mạng khi đang thực hiện request cần quyền --- */
            if (isNetworkError && hasAuthHeader) {
                console.warn("⛔ Network error on authenticated request");
                // Thường xảy ra khi server chết đột ngột hoặc mất kết nối giữa chừng
                toast.error("Kết nối bị gián đoạn. Vui lòng thử lại.");
                return Promise.reject(error);
            }

            /* --- Trường hợp 5: Lỗi mạng thật sự (Mất internet) --- */
            if (isNetworkError) {
                console.warn("🌐 Real network error");
                toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền.");
                return Promise.reject(error);
            }

            return Promise.reject(error);
        }
    );

    return interceptorId;
};
import axios from "axios";
import { toast } from "react-toastify";

export const setupAxiosInterceptors = (
    logoutHandler: () => void,
    navigate: (path: string) => void
) => {

    const interceptorId = axios.interceptors.response.use(
        (response) => response,

        async (error) => {
            const status = error.response?.status;
            const message = error.response?.data?.message || error.response?.data;

            const isNetworkError = !error.response;

            // Lấy Authorization trong request hiện tại
            const hasAuthHeader =
                error.config?.headers?.Authorization ||
                axios.defaults.headers.common["Authorization"];


            /* -------------------------------------------------------
             * 1️⃣ Token hết hạn (Server trả đúng message)
             * ------------------------------------------------------- */
            if (status === 401 && message === "Token expired") {
                console.warn("⛔ Token expired — forcing logout");

                logoutHandler();
                navigate("/login");

                toast.dark("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");

                return Promise.reject(error);
            }

            /* -------------------------------------------------------
             * 2️⃣ 401 Unauthorized nhưng không phải token expired
             * (Sai role, chưa login, token sai...)
             * ------------------------------------------------------- */
            if (status === 401) {
                console.warn("⚠️ 401 Unauthorized");

                logoutHandler();
                navigate("/login");

                toast.error("Bạn không có quyền truy cập. Hãy đăng nhập lại.");

                return Promise.reject(error);
            }

            /* -------------------------------------------------------
             * 3️⃣ 403 Forbidden
             * ------------------------------------------------------- */
            if (status === 403) {
                console.warn("⚠️ 403 Forbidden");
                toast.error("Bạn không có quyền truy cập chức năng này.");
                return Promise.reject(error);
            }

            /* -------------------------------------------------------
             * 4️⃣ Fake Network Error do token hết hạn nhưng server
             * đã chặn request từ middleware → không trả JSON
             * ------------------------------------------------------- */
            if (isNetworkError && hasAuthHeader) {
                console.warn("⛔ Network error on authenticated request — assuming expired token");

                logoutHandler();
                navigate("/login");
                toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");

                return Promise.reject(error);
            }

            /* -------------------------------------------------------
             * 5️⃣ Network Error thật sự (server chết/mất mạng)
             * ------------------------------------------------------- */
            if (isNetworkError) {
                console.warn("🌐 Real network error");
                toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.");
                return Promise.reject(error);
            }

            return Promise.reject(error);
        }
    );

    return interceptorId;
};

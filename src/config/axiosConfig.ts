import axios from 'axios';
import { toast } from 'react-toastify';


export const setupAxiosInterceptors = (logoutHandler: () => void): number => {
    const interceptorId = axios.interceptors.response.use(
        (response) => response,
        (error) => {
            const status = error.response ? error.response.status : null;
            const isNetworkError = status === null;
            
            // Kiểm tra xem có Authorization Header trong request hay không
            const hasAuthHeader = !!axios.defaults.headers.common["Authorization"];
            
            // 1. Lỗi chính thức: 401/403
            if (status === 401 || status === 403) {
                console.warn("401/403 received. Logging out.");
                logoutHandler(); 
                toast.error("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
            } 
            // 2. Lỗi Network Error (status === null)
            else if (isNetworkError && hasAuthHeader) {
                // Đây là kịch bản token hết hạn gây ra lỗi kết nối theo kinh nghiệm của bạn
                console.warn("Network Error while authenticated. Assuming expired token and forcing logout.");
                logoutHandler(); 
                toast.dark("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
            }
            // 3. Lỗi Network Error thông thường (server down/mất mạng)
            else if (isNetworkError) {
                toast.error("Lỗi kết nối mạng: Không thể kết nối đến máy chủ.");
            }
            
            return Promise.reject(error);
        }
    );
    return interceptorId;
};
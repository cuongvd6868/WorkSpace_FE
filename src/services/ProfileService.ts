import axios from "axios";
import { ChangePasswordRequest, ForgotPasswordRequest } from "~/types/Profile";
import { handleError } from "~/utils/handleError";
import { API_BASE_URL } from "~/utils/API";


export const changePassword = async (data: ChangePasswordRequest): Promise<string> => {
    try {
        const response = await axios.post(`${API_BASE_URL}accounts/change-password`, data);
        
        return response.data?.message || "Đổi mật khẩu thành công!";
    } catch (error) {
        throw handleError(error);
    }
};

export const forgotPassword = async (data: ForgotPasswordRequest): Promise<string> => {
    try {
        const response = await axios.post(`${API_BASE_URL}accounts/forgot-password`, data);
        
        return response.data?.message || "Yêu cầu đã được gửi, vui lòng kiểm tra email của bạn.";
    } catch (error) {
        throw handleError(error);
    }
};
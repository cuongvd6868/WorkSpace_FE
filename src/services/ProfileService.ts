import axios from "axios";
import { ChangePasswordRequest, ForgotPasswordRequest, UpdateProfileParams, UpdateProfileRequest } from "~/types/Profile";
import { handleError } from "~/utils/handleError";
import { API_BASE_URL } from "~/utils/API";
import { uploadToCloudinary } from "./CloudinaryService"; 
import { AVATAR_PRESET } from "~/config/cloudinaryConfig";

const PROFILE_API_URL = `${API_BASE_URL}v1/profile/updateProfile`;

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


export const updateProfile = async (
    { profileData, avatarFile }: UpdateProfileParams,
    token: string
): Promise<any> => {
    
    let finalData: UpdateProfileRequest = { ...profileData };

    // --- 1. XỬ LÝ UPLOAD AVATAR LÊN CLOUDINARY (NẾU CÓ FILE MỚI) ---
    if (avatarFile) {
        try {
            console.log("Đang upload avatar mới lên Cloudinary...");
            const publicId = await uploadToCloudinary(avatarFile, AVATAR_PRESET);
            finalData.avatar = publicId; // Thay thế URL/Local path bằng Public ID từ Cloudinary
        } catch (error) {
            console.error("Lỗi upload avatar:", error);
            throw new Error("Không thể upload ảnh đại diện. Vui lòng thử lại.");
        }
    }

    // --- 2. ĐỘ TRỄ NHẸ ĐỂ ĐẢM BẢO TÍNH ĐỒNG BỘ (NHƯ CODE MẪU) ---
    await new Promise(resolve => setTimeout(resolve, 500));

    // --- 3. GỬI DỮ LIỆU CUỐI CÙNG TỚI .NET BACKEND ---
    try {
        console.log("Gửi dữ liệu cập nhật profile tới Backend:", finalData);
        const response = await axios.put(PROFILE_API_URL, finalData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error) {
        console.error("Lỗi khi cập nhật Profile tại Backend:", error);
        
        // Xử lý lỗi chi tiết như code mẫu bạn cung cấp
        if (axios.isAxiosError(error) && error.response) {
            const status = error.response.status;
            const serverData = error.response.data;

            if (status === 400 && serverData.errors) {
                // Lấy thông báo lỗi đầu tiên từ danh sách lỗi validation
                const firstKey = Object.keys(serverData.errors)[0];
                const errorMessage = serverData.errors[firstKey][0];
                throw new Error(errorMessage);
            }

            if (status === 401) {
                throw new Error("Phiên làm việc hết hạn. Vui lòng đăng nhập lại.");
            }
        }
        
        throw new Error("Cập nhật thông tin thất bại.");
    }
};
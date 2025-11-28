import axios from "axios";
import { buildCloudinaryUploadUrl, CLOUD_NAME } from "~/config/cloudinaryConfig";
import { CloudinaryUploadResult } from "~/types/CloudinaryUpload";

export const uploadToCloudinary = async (file: File, presetName: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', presetName);
    
    const uploadUrl = buildCloudinaryUploadUrl(CLOUD_NAME);

    try {
        // *** GIẢI PHÁP LỖI CORS: GHI ĐÈ HEADER AUTHORIZATION ***
        const { data } = await axios.post<CloudinaryUploadResult>(uploadUrl, formData, {
            headers: {
                // Buộc Authorization thành undefined để ngăn chặn Token bị gửi nhầm
                'Authorization': undefined, 
            },
        });
        
        // <<< LỖI ĐƯỢC KHẮC PHỤC Ở ĐÂY: THÊM LỆNH RETURN BỊ THIẾU >>>
        return data.public_id; 
        
    } catch (error) {
        console.error("Lỗi chi tiết khi upload lên Cloudinary:", error);
        throw new Error("Tải ảnh lên Cloudinary thất bại."); 
    }
};
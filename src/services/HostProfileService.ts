import axios from 'axios';
import { 
    AVATAR_PRESET, 
    COVER_PRESET, 
} from '~/config/cloudinaryConfig'; 
import { HostProfileData } from '~/types/HostProfile'; 
import { uploadToCloudinary } from './CloudinaryService';
import { API_BASE_URL } from '~/utils/API';

const DOTNET_API_URL = `${API_BASE_URL}v1/host-profile`; 



interface SaveHostProfileParams {
    profileData: HostProfileData; 
    logoFile?: File;             
    avatarFile?: File;           
    coverPhotoFile?: File;       
}

export const saveHostProfile = async (
    { profileData, logoFile, avatarFile, coverPhotoFile }: SaveHostProfileParams, 
    token: string 
): Promise<any> => {
    
    let finalData: HostProfileData = { ...profileData };
    
    const uploadPromises: Promise<void>[] = [];

    // Xử lý Avatar
    if (avatarFile) {
        const avatarPromise = uploadToCloudinary(avatarFile, AVATAR_PRESET)
            .then(publicId => { finalData.avatar = publicId; });
        uploadPromises.push(avatarPromise);
    }
    
    // Xử lý Cover Photo
    if (coverPhotoFile) {
        const coverPromise = uploadToCloudinary(coverPhotoFile, COVER_PRESET)
            .then(publicId => { finalData.coverPhoto = publicId; });
        uploadPromises.push(coverPromise);
    }
    
    try {
        await Promise.all(uploadPromises);
        console.log("Tất cả ảnh đã upload thành công. Public IDs đã được gán.");
    } catch (error) {
        throw error; 
    }

    // --- BƯỚC 2: GỬI DỮ LIỆU HOÀN CHỈNH TỚI API .NET (CÓ XÁC THỰC) ---
    console.log("Gửi dữ liệu profile tới .NET Backend:", finalData);
    
    try {
        const response = await axios.post(DOTNET_API_URL, finalData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            }
        });

        return response.data;
    } catch (error) {
         console.error("Lỗi khi gửi dữ liệu profile tới .NET:", error);
         if (axios.isAxiosError(error) && error.response?.status === 401) {
             throw new Error("Phiên làm việc hết hạn. Vui lòng đăng nhập lại.");
         }
         throw new Error("Lưu thông tin Host Profile thất bại.");
    }
};
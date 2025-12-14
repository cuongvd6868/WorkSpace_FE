import axios from 'axios';
import { 
    AVATAR_PRESET, 
    COVER_PRESET, 
    DOCUMENT_PRESET, 
} from '~/config/cloudinaryConfig'; 
import { HostProfileData } from '~/types/HostProfile'; 
import { uploadToCloudinary } from './CloudinaryService';
import { dataURLtoFile } from '~/utils/dataURLtoFile'; 
import { API_BASE_URL } from '~/utils/API';

const DOTNET_API_URL = `${API_BASE_URL}v1/host-profile`; 

interface ServiceHostProfileData extends HostProfileData {
    signatureDataUrl?: string; 
}

interface SaveHostProfileParams {
    profileData: ServiceHostProfileData; 
    logoFile?: File;             
    avatarFile?: File;           
    coverPhotoFile?: File;
}

export const saveHostProfile = async (
    { profileData, logoFile, avatarFile, coverPhotoFile }: SaveHostProfileParams, 
    token: string 
): Promise<any> => {
    
    let finalData: ServiceHostProfileData = { ...profileData };
    
    const uploadPromises: Promise<void>[] = [];
    
    const documentPublicIds: string[] = []; 
    let signaturePublicId: string | undefined = undefined;

    // --- 1. UPLOAD AVATAR & COVER ---
    if (avatarFile) {
        const avatarPromise = uploadToCloudinary(avatarFile, AVATAR_PRESET)
            .then(publicId => { finalData.avatar = publicId; });
        uploadPromises.push(avatarPromise);
    }
    
    if (coverPhotoFile) {
        const coverPromise = uploadToCloudinary(coverPhotoFile, COVER_PRESET)
            .then(publicId => { finalData.coverPhoto = publicId; });
        uploadPromises.push(coverPromise);
    }

    // --- 2. UPLOAD ẢNH HỢP ĐỒNG (TỪ DATA URL trong finalData.documentUrls) ---
    if (finalData.documentUrls && finalData.documentUrls.length > 0) {
        finalData.documentUrls.forEach((dataUrl, index) => {
            try {
                // Chuyển Data URL sang File để upload
                const file = dataURLtoFile(dataUrl, `contract_doc_${finalData.companyName}_${index + 1}.png`);
                
                const docPromise = uploadToCloudinary(file, DOCUMENT_PRESET)
                    .then(publicId => { 
                        documentPublicIds.push(publicId); // Thu thập Public ID
                    });
                uploadPromises.push(docPromise);
            } catch (e) {
                console.error(`Lỗi chuyển đổi Data URL tài liệu thứ ${index + 1}:`, e);
                throw new Error("Lỗi xử lý file tài liệu hợp đồng.");
            }
        });
    }

    // --- 3. UPLOAD CHỮ KÝ (TỪ DATA URL trong finalData.signatureDataUrl) ---
    if (finalData.signatureDataUrl) {
        try {
            const signatureFile = dataURLtoFile(finalData.signatureDataUrl, `signature_${finalData.companyName}.png`);
            
            const signaturePromise = uploadToCloudinary(signatureFile, AVATAR_PRESET) 
                .then(publicId => { 
                    signaturePublicId = publicId; // Thu thập Public ID
                });
            uploadPromises.push(signaturePromise);
        } catch (e) {
            console.error("Lỗi chuyển đổi Data URL chữ ký:", e);
            throw new Error("Lỗi xử lý chữ ký điện tử.");
        }
    }

    // --- BƯỚC 4: CHỜ TẤT CẢ UPLOAD HOÀN TẤT ---
    try {
        await Promise.all(uploadPromises);
        console.log("Tất cả ảnh và tài liệu đã upload thành công. Public IDs đã được thu thập.");
    } catch (error) {
        console.error("Lỗi trong quá trình upload lên Cloudinary:", error);
        throw error; 
    }
    
    // ⭐ ĐÃ GIỮ NGUYÊN: Độ trễ 1000ms để khắc phục lỗi Timing ⭐
    await new Promise(resolve => setTimeout(resolve, 1000));

    // --- BƯỚC 5: LÀM SẠCH VÀ GỬI DỮ LIỆU CUỐI CÙNG TỚI API .NET ---
    
    // Thay thế Data URL của tài liệu bằng Public ID
    finalData.documentUrls = documentPublicIds;
    
    // Xử lý chữ ký (thay Data URL bằng Public ID và xóa Data URL)
    delete finalData.signatureDataUrl;
    if (signaturePublicId) {
        // Gán Public ID chữ ký (Cần Backend .NET hỗ trợ trường này)
        (finalData as any).signaturePublicId = signaturePublicId; 
    }
    
    console.log("Gửi dữ liệu profile hoàn chỉnh tới .NET Backend:", finalData);
    
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
        
        // ⭐ LOG LỖI CHI TIẾT VÀ XỬ LÝ LỖI VALIDATION ⭐
        if (axios.isAxiosError(error) && error.response) {
            
            // In ra dữ liệu phản hồi chi tiết từ Server
            console.error("Dữ liệu lỗi chi tiết từ Server (Response Body):", error.response.data);
            
            // Xử lý lỗi Validation (400 Bad Request)
            if (error.response.status === 400 && error.response.data.errors) {
                const validationErrors = error.response.data.errors;
                let errorMessage = "Lưu thông tin Host Profile thất bại.";

                // Cố gắng tìm lỗi cho trường DocumentUrls (hoặc lỗi đầu tiên)
                if (validationErrors.DocumentUrls && validationErrors.DocumentUrls.length > 0) {
                    errorMessage = validationErrors.DocumentUrls[0]; 
                } else {
                    // Lấy lỗi đầu tiên từ bất kỳ trường nào khác (Generic error handling)
                    const firstKey = Object.keys(validationErrors)[0];
                    if (firstKey && validationErrors[firstKey] && validationErrors[firstKey].length > 0) {
                         errorMessage = validationErrors[firstKey][0];
                    }
                }
                throw new Error(errorMessage);
            }

            if (error.response.status === 401) {
                throw new Error("Phiên làm việc hết hạn. Vui lòng đăng nhập lại.");
            }
            
            // Nếu là lỗi 500 (Internal Server Error) hoặc lỗi khác
            if (error.response.status >= 500) {
                throw new Error("Lỗi máy chủ nội bộ. Vui lòng thử lại sau.");
            }
        }
         throw new Error("Lưu thông tin Host Profile thất bại.");
    }
};
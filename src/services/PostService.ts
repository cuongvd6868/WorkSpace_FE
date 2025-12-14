import axios from "axios"
import { API_BASE_URL } from "~/utils/API"
import { handleError } from "~/utils/handleError"
import { uploadToCloudinary } from './CloudinaryService';
import { POST_PRESET } from "~/config/cloudinaryConfig";
import { PostRequest, PostUpdateRequest } from "~/types/Posts";


export const getAllFeaturedPost = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}v1/posts/featured`);
        return response.data;
    } catch (error) {
        handleError(error); 
        throw error;         
    }
}

export const handleCreatePost = async (
    postData: PostRequest, 
    imageFile?: File // File ảnh là tùy chọn
): Promise<void> => { // Thay đổi kiểu trả về thành Promise<void>
    let finalPostData = { ...postData };

    try {
        // 1. Tải ảnh lên Cloudinary (nếu có file ảnh)
        if (imageFile) {
            console.log("Đang tiến hành tải ảnh lên Cloudinary...");
            const publicId = await uploadToCloudinary(imageFile, POST_PRESET);
            
            // Cập nhật trường imageData bằng public_id của ảnh
            finalPostData.imageData = publicId;
        }

        // 2. Gửi yêu cầu tạo bài đăng lên API Server
        const url = `${API_BASE_URL}v1/posts`;
        console.log("Đang gửi dữ liệu bài đăng lên server...");
        
        // Gửi yêu cầu POST, không cần quan tâm đến dữ liệu trả về
        await axios.post(url, finalPostData);
        
        console.log("Tạo bài đăng thành công.");
        
    } catch (error) {
        // Xử lý lỗi (ví dụ: ghi log hoặc hiển thị thông báo)
        handleError(error);
        
        // Ném lỗi để component gọi biết đã xảy ra lỗi
        throw error;
    }

    
};

export const handleUpdatePost = async (
    postData: PostUpdateRequest, 
    imageFile?: File 
): Promise<void> => {
    let finalPostData = { ...postData };
    const postId = postData.id;

    if (!postId) {
        throw new Error("Không tìm thấy ID bài đăng để cập nhật.");
    }

    try {
        if (imageFile) {
            console.log("Đang tải ảnh mới lên Cloudinary...");
            const publicId = await uploadToCloudinary(imageFile, POST_PRESET);
            finalPostData.imageData = publicId;
        }

        const url = `${API_BASE_URL}v1/posts/${postId}`;
        console.log(`Đang gửi dữ liệu cập nhật bài đăng ID: ${postId}`);
        
        await axios.put(url, finalPostData);
        
        console.log("Cập nhật bài đăng thành công.");
        
    } catch (error) {
        handleError(error);
        throw error;
    }
};



export const handleDeletePost = async (postId: number): Promise<void> => {
    try {
        if (!postId) {
            throw new Error("Không tìm thấy ID bài đăng để xóa.");
        }
        
        const url = `${API_BASE_URL}v1/posts/${postId}`;
        console.log(`Đang gửi yêu cầu xóa bài đăng ID: ${postId}`);

        // Gửi yêu cầu DELETE. API Controller trả về 204 No Content nếu thành công.
        await axios.delete(url);

        console.log("Xóa bài đăng thành công.");

    } catch (error) {
        handleError(error);
        throw error;
    }
};

export const getAllPosts = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}v1/posts`);
        return response.data;
    } catch (error) {
        handleError(error); 
        throw error;     
    }
}

export const getPostById = async (id: number) => {
    try {
        const response = await axios.get(`${API_BASE_URL}v1/posts/${id}`);
        return response.data;
    } catch (error) {
        handleError(error); 
        throw error;     
    }
}
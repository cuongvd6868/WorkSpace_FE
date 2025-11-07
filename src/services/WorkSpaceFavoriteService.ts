import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import { WorkSpaceSearch } from '~/types/WorkSpaces'; 
import { toast } from "react-toastify"; 
import { getAuthHeaders } from './AuthService';
import { API_BASE_URL } from '~/utils/API';

const WORKSPACE_FAVORITE_ENDPOINT = `${API_BASE_URL}v1/workspacefavorite`;

/**
 * 1. Thêm một WorkSpace vào danh sách yêu thích của người dùng.
 * Endpoint: POST api/v1/workspacefavorite
 */
export const addToFavorites = async (workSpaceId: number): Promise<string> => {
    const config = getAuthHeaders();
    if (!config.headers?.Authorization) {
        toast.error("Please log in to add to favorites."); 
        throw new Error("User not authenticated. Please log in.");
    }

    const url = `${WORKSPACE_FAVORITE_ENDPOINT}?workSpaceId=${workSpaceId}`;
    
    try {
        const response: AxiosResponse<{ message: string }> = await axios.post(
            url, 
            null, // Không có body nếu dùng query param
            config
        );
        return response.data.message;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error("User not authenticated. Please log in.");
            }
            const errorMessage = error.response?.data?.message || "Failed to add workspace to favorites.";
            throw new Error(errorMessage);
        }
        console.error("Error adding to favorites:", error);
        throw new Error("An unexpected error occurred while adding to favorites.");
    }
};

/**
 * 2. Xóa một WorkSpace khỏi danh sách yêu thích của người dùng.
 * Endpoint: DELETE api/v1/workspacefavorite/{workSpaceId}
 */
export const removeFromFavorites = async (workSpaceId: number): Promise<string> => {
    const config = getAuthHeaders();
    if (!config.headers?.Authorization) {
        throw new Error("User not authenticated. Please log in.");
    }

    const url = `${WORKSPACE_FAVORITE_ENDPOINT}/${workSpaceId}`;
    
    try {
        const response: AxiosResponse<{ message: string }> = await axios.delete(
            url, 
            config
        );
        return response.data.message;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error("User not authenticated. Please log in.");
            }
            const errorMessage = error.response?.data?.message || "Failed to remove workspace from favorites.";
            throw new Error(errorMessage);
        }
        console.error("Error removing from favorites:", error);
        throw new Error("An unexpected error occurred while removing from favorites.");
    }
};

/**
 * 3. Kiểm tra xem một WorkSpace có phải là yêu thích của người dùng hiện tại không.
 * Endpoint: GET api/v1/workspacefavorite/isfavorite/{workSpaceId}
 */
// export const isFavorite = async (workSpaceId: number): Promise<boolean> => {
//     const config = getAuthHeaders();
//     if (!config.headers?.Authorization) {
//         // Nếu không có token, không thể là yêu thích, có thể throw hoặc trả về false.
//         // Giả sử: throw để component gọi biết cần đăng nhập.
//         throw new Error("User not authenticated. Cannot check favorite status."); 
//     }

//     const url = `${WORKSPACE_FAVORITE_ENDPOINT}/isfavorite/${workSpaceId}`;
    
//     try {
//         const response: AxiosResponse<{ isFavorite: boolean }> = await axios.get(
//             url, 
//             config
//         );
//         return response.data.isFavorite;
//     } catch (error) {
//         if (axios.isAxiosError(error)) {
//             if (error.response?.status === 401) {
//                 throw new Error("User not authenticated. Please log in."); 
//             }
//         }
//         console.error(`Error checking if workspace ${workSpaceId} is favorite:`, error);
//         // Có thể trả về false nếu lỗi không phải 401 và không phải lỗi nghiêm trọng khác.
//         throw new Error("Failed to check favorite status.");
//     }
// };

/**
 * 4. Lấy danh sách đầy đủ các WorkSpace yêu thích của người dùng hiện tại.
 * Endpoint: GET api/v1/workspacefavorite/userfavorites
 */
export const getFavoriteWorkSpaces = async (): Promise<WorkSpaceSearch[]> => {
    const config = getAuthHeaders();
    if (!config.headers?.Authorization) {
        throw new Error("User not authenticated. Please log in.");
    }

    const url = `${WORKSPACE_FAVORITE_ENDPOINT}/userfavorites`;
    
    try {
        const response: AxiosResponse<WorkSpaceSearch[]> = await axios.get(
            url, 
            config
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error("User not authenticated. Please log in.");
            }
        }
        console.error("Error fetching favorite workspaces:", error);
        throw new Error("Failed to retrieve favorite workspaces.");
    }
};

/**
 * 5. Lấy danh sách ID các WorkSpace yêu thích của người dùng hiện tại.
 * Endpoint: GET api/v1/workspacefavorite/userfavoriteids
 */
export const getFavoriteWorkSpaceIds = async (): Promise<number[]> => {
    const config = getAuthHeaders();
    if (!config.headers?.Authorization) {
        throw new Error("User not authenticated. Please log in.");
    }

    const url = `${WORKSPACE_FAVORITE_ENDPOINT}/userfavoriteids`;
    
    try {
        const response: AxiosResponse<number[]> = await axios.get(
            url, 
            config
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error("User not authenticated. Please log in.");
            }
        }
        console.error("Error fetching favorite workspace IDs:", error);
        throw new Error("Failed to retrieve favorite workspace IDs.");
    }
};
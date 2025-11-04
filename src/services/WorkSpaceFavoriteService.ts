import { SearchState } from '~/context/SearchContext';
import axios, { AxiosResponse } from 'axios';
import { WorkSpaceSearch } from '~/types/WorkSpaces'; 


const BASE_URL = 'https://localhost:7105/api/v1'; 
const WORKSPACE_FAVORITE_ENDPOINT = `${BASE_URL}/workspacefavorite`;

// Hàm tiện ích để lấy token từ Local Storage
const getAuthHeaders = () => {
    const token = localStorage.getItem('token'); 
    if (!token) {
        throw new Error("Authentication token not found.");
    }
    return {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    };
};

/**
 * 1. Thêm một WorkSpace vào danh sách yêu thích của người dùng.
 * Endpoint: POST api/v1/workspacefavorite
 */
export const addToFavorites = async (workSpaceId: number): Promise<string> => {
    const config = getAuthHeaders();
    const url = WORKSPACE_FAVORITE_ENDPOINT;
    
    // API backend của bạn nhận workSpaceId dưới dạng query param hoặc body. 
    // Dựa trên controller C#, nó nhận 'int workSpaceId' qua body hoặc query.
    // Tôi giả định bạn sẽ gửi nó dưới dạng JSON body.
    try {
        // Lưu ý: Controller của bạn nhận workSpaceId là tham số.
        // Tôi sử dụng URL query parameter để khớp cách API thường được thiết kế khi chỉ nhận 1 ID.
        const response: AxiosResponse<{ message: string }> = await axios.post(
            `${url}?workSpaceId=${workSpaceId}`, 
            null, // Không có body nếu dùng query param
            config
        );
        return response.data.message;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            throw new Error("User not authenticated. Please log in.");
        }
        console.error("Error adding to favorites:", error);
        throw new Error("Failed to add workspace to favorites.");
    }
};

/**
 * 2. Xóa một WorkSpace khỏi danh sách yêu thích của người dùng.
 * Endpoint: DELETE api/v1/workspacefavorite/{workSpaceId}
 */
export const removeFromFavorites = async (workSpaceId: number): Promise<string> => {
    const config = getAuthHeaders();
    const url = `${WORKSPACE_FAVORITE_ENDPOINT}/${workSpaceId}`;
    
    try {
        const response: AxiosResponse<{ message: string }> = await axios.delete(
            url, 
            config
        );
        return response.data.message;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            throw new Error("User not authenticated. Please log in.");
        }
        console.error("Error removing from favorites:", error);
        throw new Error("Failed to remove workspace from favorites.");
    }
};

/**
 * 3. Kiểm tra xem một WorkSpace có phải là yêu thích của người dùng hiện tại không.
 * Endpoint: GET api/v1/workspacefavorite/isfavorite/{workSpaceId}
 */
export const isFavorite = async (workSpaceId: number): Promise<boolean> => {
    const config = getAuthHeaders();
    const url = `${WORKSPACE_FAVORITE_ENDPOINT}/isfavorite/${workSpaceId}`;
    
    try {
        const response: AxiosResponse<{ isFavorite: boolean }> = await axios.get(
            url, 
            config
        );
        return response.data.isFavorite;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            // Trong trường hợp này, nếu không xác thực, ta có thể trả về false hoặc throw error.
            // Chọn throw để xử lý lỗi xác thực ở component.
            throw new Error("User not authenticated. Please log in."); 
        }
        console.error(`Error checking if workspace ${workSpaceId} is favorite:`, error);
        throw new Error("Failed to check favorite status.");
    }
};

/**
 * 4. Lấy danh sách đầy đủ các WorkSpace yêu thích của người dùng hiện tại.
 * Endpoint: GET api/v1/workspacefavorite/userfavorites
 * Giả định API này trả về mảng WorkSpaceSearch[] hoặc một Type WorkSpace đầy đủ.
 */
export const getFavoriteWorkSpaces = async (): Promise<WorkSpaceSearch[]> => {
    const config = getAuthHeaders();
    const url = `${WORKSPACE_FAVORITE_ENDPOINT}/userfavorites`;
    
    try {
        const response: AxiosResponse<WorkSpaceSearch[]> = await axios.get(
            url, 
            config
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            throw new Error("User not authenticated. Please log in.");
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
    const url = `${WORKSPACE_FAVORITE_ENDPOINT}/userfavoriteids`;
    
    try {
        // Giả định API trả về một mảng các số nguyên (ID)
        const response: AxiosResponse<number[]> = await axios.get(
            url, 
            config
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            throw new Error("User not authenticated. Please log in.");
        }
        console.error("Error fetching favorite workspace IDs:", error);
        throw new Error("Failed to retrieve favorite workspace IDs.");
    }
};
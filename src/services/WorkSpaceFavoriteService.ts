import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import { WorkSpaceSearch } from '~/types/WorkSpaces'; 
import { toast } from "react-toastify"; 
import { getAuthHeaders } from './AuthService';
import { API_BASE_URL } from '~/utils/API';
import { handleError } from '~/utils/handleError';

const WORKSPACE_FAVORITE_ENDPOINT = `${API_BASE_URL}v1/workspacefavorite`;

export const GetFavoriteListByUser = async () => {
    try {
        const response = await axios.get(`${WORKSPACE_FAVORITE_ENDPOINT}/userfavorites`);
        return response.data;
    } catch (error) {
        handleError(error); 
        throw error; 
    }
}

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
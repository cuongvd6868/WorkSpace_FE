import axios from "axios";
import { API_BASE_URL } from "~/utils/API";
import { handleError } from "~/utils/handleError";



export const GetAllWard = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}v1/workspaces/all-ward`);
        return response.data;
    } catch (error) {
        handleError(error); 
        throw error; 
    }
}

export const GetWorkspaceByWard = async (ward: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}v1/workspaces/all-ward/${ward}`);
        return response.data;
    } catch (error) {
        handleError(error); 
        throw error;  
    }
}
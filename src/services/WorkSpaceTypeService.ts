import axios from "axios";
import { API_BASE_URL } from "~/utils/API";
import { handleError } from "~/utils/handleError"



export const GetAllWorkSpaceTypes = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}v1/workspacetypes`);
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
}

export const GetAllWorkSpaceByType = async (typeId: number) => {
    try {
        const response = await axios.get(`${API_BASE_URL}v1/workspacetypes/${typeId}/workspaces`);
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;       
    }
}
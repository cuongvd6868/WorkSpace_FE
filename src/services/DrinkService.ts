
import axios from "axios"
import { API_BASE_URL } from "~/utils/API" 
import { handleError } from "~/utils/handleError" 



export const getAllDrinkService = async (id: number) => {
    try {
        const response = await axios.get(`${API_BASE_URL}v1/workspacerooms/${id}/drink-services`);
        return response.data
    } catch (error) {
        handleError(error); 
        throw error; 
    }
}
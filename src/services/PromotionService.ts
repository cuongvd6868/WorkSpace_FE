import axios from "axios"
import { API_BASE_URL } from "~/utils/API";
import { handleError } from "~/utils/handleError";



export const GetAllPromotions = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}v1/promotions/active`);
        return response.data;
    } catch (error) {
        handleError(error); 
        throw error; 
    }
}

export const GetPromotionByCode = async (code: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}v1/booking/code?promotionCode=${code}`)
        return response.data
    } catch (error) {
        handleError(error); 
        throw error; 
    }
}

export const GetPromotionByWorkspace = async (id: number) => {
    try {
        const response = await axios.get(`${API_BASE_URL}v1/promotions/workspace/${id}`)
        return response.data
    } catch (error) {
        handleError(error); 
        throw error; 
    }  
}
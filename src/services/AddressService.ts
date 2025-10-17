import axios from "axios"
import { API_BASE_URL } from "~/utils/API"
import { handleError } from "~/utils/handleError"



export const getAllLocations = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}v1/search/wards`);
        return response.data
    } catch (error) {
        handleError(error); 
        throw error; 
    }
}

export const getLocationsByName = async (query:string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}v1/search/locations/suggest?query=${query}`);
        return response.data
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            return []; // không tìm thấy thì trả mảng rỗng
        }
        // handleError(error);
        // throw error;
    }
}




import axios from "axios"
import { API_BASE_URL } from "~/utils/API" // Giả định bạn có hằng số này
import { handleError } from "~/utils/handleError" // Giả định bạn có hàm này
import { Amenity } from "~/types/Amenity"



export const getAllAmenities = async (): Promise<Amenity[]> => {
    try {
        const response = await axios.get<Amenity[]>(`${API_BASE_URL}v1/amenities`);
        return response.data;
    } catch (error) {
        handleError(error); 
        throw error; 
    }
}
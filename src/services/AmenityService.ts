// File: src/services/AmenityService.ts

import axios from "axios"
import { API_BASE_URL } from "~/utils/API" // Giả định bạn có hằng số này
import { handleError } from "~/utils/handleError" // Giả định bạn có hàm này
import { Amenity } from "~/types/Amenity"

// Giả định Amenity type (đặt trong src/types/WorkSpaces.ts):
// export type Amenity = {
//     id: number,
//     name: string,
//     description: string,
//     iconClass: string
// }

export const getAllAmenities = async (): Promise<Amenity[]> => {
    try {
        // Giả định API_BASE_URL là 'https://localhost:7105/api/'
        const response = await axios.get<Amenity[]>(`${API_BASE_URL}v1/amenities`);
        return response.data;
    } catch (error) {
        handleError(error); 
        throw error; 
    }
}
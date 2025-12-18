import { SearchState } from '~/context/SearchContext';
import axios from 'axios';
import { WorkSpaceSearch } from '~/types/WorkSpaces'; 
import { handleError } from '~/utils/handleError';
import { API_BASE_URL } from '~/utils/API';


const formatToISOStringForApi = (date: Date): string => {
    const isoString = date.toISOString(); 
    return isoString.replace(/\.\d{3}Z$/, ''); 
};

export const searchWorkspaces = async (searchData: SearchState): Promise<WorkSpaceSearch[]> => {
    const { 
        location, 
        selectedTime, 
        participants, 
        selectedAmenities, 
        minPrice, 
        maxPrice
    } = searchData as SearchState & { 
        selectedAmenities: string[],
        minPrice?: number, 
        maxPrice?: number 
    };

    if (!location.trim() || !selectedTime.startTime || !selectedTime.endTime) {
        console.warn("Missing required search parameters (location or time).");
        return []; 
    }

    const starttimeISO = formatToISOStringForApi(selectedTime.startTime);
    const endtimeISO = formatToISOStringForApi(selectedTime.endTime);

    const params = new URLSearchParams({
        ward: location,
        starttime: starttimeISO, 
        endtime: endtimeISO,
        capacity: participants.toString(), 
    });
    
    if (minPrice !== undefined && minPrice > 0) {
        params.append('minprice', minPrice.toString());
    }

    if (maxPrice !== undefined && maxPrice > 0) {
        params.append('maxprice', maxPrice.toString());
    }

    if (selectedAmenities && selectedAmenities.length > 0) {
        selectedAmenities.forEach(amenity => {
            params.append('amenities', amenity); 
        });
    }

    const fullUrl = `${API_BASE_URL}v1/search/workspaces?${params.toString()}`;
    console.log('API Request URL (Server-Side Filter):', fullUrl);

    try {
        const response = await axios.get<WorkSpaceSearch[]>(fullUrl);
        return response.data;
    } catch (error) {
        console.error("Error fetching workspaces:", error);
        throw new Error("Failed to fetch workspaces from the server.");
    }
};

export const GetWorkSpaceById = async (id: number) => {
    try {
        const response = await axios.get(`${API_BASE_URL}v1/workspaces/${id}/detail`);
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;     
    }
}

export const GetWorkSpaceQuickSearch = async (title: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}v1/search/workspaces?keyword=${title}`);
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;     
    }
}
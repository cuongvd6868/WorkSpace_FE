// File: src/services/WorkSpaceService.ts (Đã sửa)

import { SearchState } from '~/context/SearchContext'; // Cần đúng đường dẫn
import axios from 'axios';
import { WorkSpaceSearch } from '~/types/WorkSpaces'; // Cần đúng đường dẫn

// Định nghĩa BASE_URL
const BASE_URL = 'https://localhost:7105/api/v1'; 

// === HÀM XỬ LÝ DATE: CHUYỂN DATE THÀNH CHUỖI API CẦN ===
const formatToISOStringForApi = (date: Date): string => {
    const isoString = date.toISOString(); 
    // Loại bỏ milliseconds (.000) và múi giờ UTC (Z)
    return isoString.replace(/\.\d{3}Z$/, ''); 
};

// === HÀM SEARCH ĐÃ CẬP NHẬT XỬ LÝ AMENITIES & PRICE ===
// Cần giả định rằng SearchState giờ đây có trường 'minPrice' và 'maxPrice'
export const searchWorkspaces = async (searchData: SearchState): Promise<WorkSpaceSearch[]> => {
    // [ĐÃ CẬP NHẬT] Thêm minPrice và maxPrice vào destructuring
    const { 
        location, 
        selectedTime, 
        participants, 
        selectedAmenities, 
        minPrice, // <== MỚI
        maxPrice // <== MỚI
    } = searchData as SearchState & { 
        selectedAmenities: string[],
        minPrice?: number, // Giả định có trong SearchState 
        maxPrice?: number // Giả định có trong SearchState
    };

    // Kiểm tra dữ liệu bắt buộc (Thêm kiểm tra null cho Date object)
    if (!location.trim() || !selectedTime.startTime || !selectedTime.endTime) {
        console.warn("Missing required search parameters (location or time).");
        return []; 
    }

    // Định dạng ngày giờ từ Date object sang chuỗi API cần
    const starttimeISO = formatToISOStringForApi(selectedTime.startTime);
    const endtimeISO = formatToISOStringForApi(selectedTime.endTime);

    // Xây dựng tham số query
    const params = new URLSearchParams({
        ward: location,          
        starttime: starttimeISO, 
        endtime: endtimeISO,     
        capacity: participants.toString(), 
    });
    
    // === THÊM MINPRICE VÀ MAXPRICE VÀO QUERY STRING ===
    if (minPrice !== undefined && minPrice > 0) {
        params.append('minprice', minPrice.toString());
    }

    if (maxPrice !== undefined && maxPrice > 0) {
        params.append('maxprice', maxPrice.toString());
    }
    // ==================================================

    // === THÊM AMENITIES VÀO QUERY STRING ===
    if (selectedAmenities && selectedAmenities.length > 0) {
        selectedAmenities.forEach(amenity => {
            // Thêm amenities=Tên Amenity, tạo ra URL có nhiều tham số amenities
            params.append('amenities', amenity); 
        });
    }

    const fullUrl = `${BASE_URL}/search/workspaces?${params.toString()}`;
    console.log('API Request URL (Server-Side Filter):', fullUrl);

    try {
        const response = await axios.get<WorkSpaceSearch[]>(fullUrl);
        return response.data;
    } catch (error) {
        console.error("Error fetching workspaces:", error);
        throw new Error("Failed to fetch workspaces from the server.");
    }
};
import { SearchState } from '~/context/SearchContext';
import axios from 'axios';
import { WorkSpaceSearch } from '~/types/WorkSpaces';

// Định nghĩa BASE_URL
const BASE_URL = 'https://localhost:7105/api/v1'; 

// === HÀM XỬ LÝ DATE: CHUYỂN DATE THÀNH CHUỖI API CẦN ===
const formatToISOStringForApi = (date: Date): string => {
    // 1. Dùng toISOString() để chuyển sang định dạng chuẩn ISO (UTC)
    const isoString = date.toISOString(); 
    
    // 2. Tùy chỉnh: Loại bỏ milliseconds (.000) và múi giờ UTC (Z) 
    // để phù hợp với định dạng ví dụ API: 2025-10-20T19:45:32
    return isoString.replace(/\.\d{3}Z$/, ''); 
    // LƯU Ý QUAN TRỌNG: Điều này giả định backend muốn thời gian theo múi giờ LOCAL 
    // và không có ký hiệu múi giờ. Nếu backend cần UTC, chỉ cần dùng date.toISOString().
};

export const searchWorkspaces = async (searchData: SearchState): Promise<WorkSpaceSearch[]> => {
    const { location, selectedTime, participants } = searchData;

    // Kiểm tra dữ liệu bắt buộc
    if (!location.trim() || !selectedTime.startTime || !selectedTime.endTime) {
        // Trong môi trường thực, bạn không nên dùng throw mà dùng thông báo lỗi
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

    const fullUrl = `${BASE_URL}/search/workspaces?${params.toString()}`;
    console.log('API Request URL:', fullUrl); // Xem URL để kiểm tra định dạng

    try {
        const response = await axios.get<WorkSpaceSearch[]>(fullUrl);
        return response.data;
    } catch (error) {
        console.error("Error fetching workspaces:", error);
        throw new Error("Failed to fetch workspaces from the server.");
    }
};
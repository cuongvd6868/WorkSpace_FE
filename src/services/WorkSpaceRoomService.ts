import axios from 'axios';
import { handleError } from '~/utils/handleError';
import { API_BASE_URL } from '~/utils/API';
import { WorkSpaceRoom } from '~/types/WorkSpaceRoom';

export type RoomSearchParams = {
    workspaceId: number;
    startTime: Date | string;
    endTime: Date | string;
    capacity: number;
};

export const searchRooms = async (params: RoomSearchParams): Promise<WorkSpaceRoom[] | null> => {
    // Định dạng lại thời gian về chuỗi ISO 8601 theo yêu cầu của API (YYYY-MM-DDTHH:MM:SS)
    // Lưu ý: encodeURIComponent được sử dụng để mã hóa ký tự ':' và '+'
    const startTimeFormatted = encodeURIComponent(new Date(params.startTime).toISOString());
    const endTimeFormatted = encodeURIComponent(new Date(params.endTime).toISOString());

    // Xây dựng URL API với các tham số query
    // URL mẫu: /api/v1/search/workspaces/{workspaceId}/search-rooms?starttime={...}&endtime={...}&capacity={...}
    const endpoint = `/v1/search/workspaces/${params.workspaceId}/search-rooms`;
    
    // Sử dụng chuỗi API_BASE_URL đã export
    const fullUrl = `${API_BASE_URL}${endpoint}`;

    try {
        const response = await axios.get<WorkSpaceRoom[]>(fullUrl, {
            params: {
                starttime: startTimeFormatted,
                endtime: endTimeFormatted,
                capacity: params.capacity,
            },
            // Nếu API đang chạy ở https://localhost:7105/... và API_BASE_URL là https://localhost:7047/api/,
            // bạn có thể cần ghi đè baseUrl ở đây, hoặc điều chỉnh API_BASE_URL trong tệp utils/API.ts
            // Ví dụ: baseURL: "https://localhost:7105/api/"
        });

        // API trả về mảng các phòng
        return response.data;
    } catch (error) {
        // Gọi hàm xử lý lỗi chung (handleError)
        handleError(error); 
        // Trả về null hoặc mảng rỗng để React component biết là có lỗi
        return null; 
    }
};
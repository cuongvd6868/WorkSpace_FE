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

    // --- SỬA LỖI ĐỊNH DẠNG THỜI GIAN ---
    //
    // Input `params.startTime` từ form đang là 'YYYY-MM-DDTHH:MM'.
    // API (theo mẫu của bạn) muốn 'YYYY-MM-DDTHH:MM:SS'.
    // Chúng ta chỉ cần thêm giây vào.
    //
    // KHÔNG dùng encodeURIComponent hay toISOString() nữa.
    // Axios sẽ tự động mã hóa (encode) các ký tự : thành %3A 1 lần duy nhất.
    //
    const startTimeFormatted = `${params.startTime}:00`;
    const endTimeFormatted = `${params.endTime}:00`;

    // --- SỬA LỖI DOUBLE SLASH (//) ---
    //
    // Bỏ dấu / ở đầu chuỗi `endpoint` để tránh lỗi ...api//v1...
    // nếu API_BASE_URL của bạn đã có dấu / ở cuối.
    //
    const endpoint = `v1/search/workspaces/${params.workspaceId}/search-rooms`; // ĐÃ BỎ DẤU / Ở ĐẦU

    // Sử dụng chuỗi API_BASE_URL đã export
    const fullUrl = `${API_BASE_URL}${endpoint}`;

    try {
        const response = await axios.get<WorkSpaceRoom[]>(fullUrl, {
            params: {
                // Truyền thẳng chuỗi đã định dạng
                starttime: startTimeFormatted,
                endtime: endTimeFormatted,
                capacity: params.capacity,
            },
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
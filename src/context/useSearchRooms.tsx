import { useState, useCallback } from 'react';
// Import các types và service đã tạo
import { RoomSearchParams, searchRooms } from '~/services/WorkSpaceRoomService'; 
import { WorkSpaceRoom } from '~/types/WorkSpaceRoom';

// Định nghĩa kiểu dữ liệu trả về của hook
type UseSearchRoomsResult = {
    rooms: WorkSpaceRoom[];
    isLoading: boolean;
    error: string | null;
    // Hàm được dùng để kích hoạt việc tìm kiếm
    executeSearch: (params: RoomSearchParams) => Promise<void>; 
};

/**
 * Custom Hook để tìm kiếm phòng và quản lý trạng thái tải/lỗi.
 * @returns {UseSearchRoomsResult}
 */
export const useSearchRooms = (): UseSearchRoomsResult => {
    const [rooms, setRooms] = useState<WorkSpaceRoom[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const executeSearch = useCallback(async (params: RoomSearchParams) => {
        setIsLoading(true);
        setError(null);
        setRooms([]); // Xóa dữ liệu cũ khi bắt đầu tìm kiếm mới

        try {
            const result = await searchRooms(params);
            
            if (result) {
                setRooms(result);
            } else {
                // Nếu searchRooms trả về null (do lỗi đã được handleError xử lý)
                setError("Không thể tải dữ liệu phòng. Vui lòng thử lại.");
            }
        } catch (err) {
            // Trường hợp lỗi không được bắt trong service (ít xảy ra nếu dùng axios)
            setError("Đã xảy ra lỗi bất ngờ trong quá trình tìm kiếm.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { rooms, isLoading, error, executeSearch };
};
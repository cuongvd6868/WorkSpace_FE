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

    const startTimeFormatted = `${params.startTime}:00`;
    const endTimeFormatted = `${params.endTime}:00`;
    const endpoint = `v1/search/workspaces/${params.workspaceId}/search-rooms`; 
    const fullUrl = `${API_BASE_URL}${endpoint}`;

    try {
        const response = await axios.get<WorkSpaceRoom[]>(fullUrl, {
            params: {
                starttime: startTimeFormatted,
                endtime: endTimeFormatted,
                capacity: params.capacity,
            },
        });

        return response.data;
    } catch (error) {
        handleError(error);
        return null;
    }
};
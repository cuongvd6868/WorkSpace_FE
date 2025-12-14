import axios from "axios"
import { CLOUDINARY_UPLOAD_URL, WORKSPACE_PHOTOS_PRESET } from "~/config/cloudinaryConfig";
import { OwnerStats } from "~/types/Owner";
import { API_BASE_URL } from "~/utils/API"
import { handleError } from "~/utils/handleError"
import { uploadToCloudinary } from "./CloudinaryService";


interface RoomPayload {
    title: string;
    description: string;
    workSpaceRoomTypeId: number;
    pricePerHour: number;
    pricePerDay: number;
    pricePerMonth: number;
    capacity: number;
    area: number;
    imageUrls: string[]; 
    amenityIds: number[];
}

interface FinalWorkspacePayload {
    title: string;
    description: string;
    ward: string;
    street: string;
    state: string;
    postalCode: string;
    latitude: number;
    longitude: number;
    workSpaceTypeId: number;
    imageUrls: string[]; 
    rooms: RoomPayload[]; 
}

export interface RawRoomData {
    title: string;
    description: string;
    workSpaceRoomTypeId: number;
    pricePerHour: number;
    pricePerDay: number;
    pricePerMonth: number;
    capacity: number;
    area: number;
    imageFiles: File[]; // Ảnh phòng (File objects)
    amenityIds: number[];
}

export interface RawWorkspaceData {
    title: string;
    description: string;
    ward: string;
    street: string;
    state: string;
    postalCode: string;
    latitude: number;
    longitude: number;
    workSpaceTypeId: number;
    imageFiles: File[]; // Ảnh Workspace (File objects)
    rooms: RawRoomData[]; // Dữ liệu phòng thô
}

// --- HÀM TẠO WORKSPACE ĐÃ CẬP NHẬT ---

const API_WORKSPACE_URL = `${API_BASE_URL}v1/owner/workspaces`;

export const handleCreateWorkspace = async (rawData: RawWorkspaceData, token: string): Promise<any> => {
    
    // 1. Tải ảnh Workspace chính lên Cloudinary
    console.log("Bắt đầu tải ảnh Workspace chính lên Cloudinary...");

    const workspaceImageUploadPromises = rawData.imageFiles.map(file => 
        uploadToCloudinary(file, WORKSPACE_PHOTOS_PRESET)
    );
    
    let workspaceImageUrls: string[] = [];
    try {
        workspaceImageUrls = await Promise.all(workspaceImageUploadPromises);
        console.log("Tải ảnh Workspace hoàn tất.");
        
    } catch (error) {
        console.error("LỖI: Một hoặc nhiều ảnh Workspace không thể tải lên Cloudinary.", error);
        throw new Error("Không thể tạo Workspace: Lỗi tải ảnh chính lên dịch vụ lưu trữ.");
    }

    // 2. Tải ảnh của từng Room lên Cloudinary và xây dựng Room Payload
    const finalRoomsPayload: RoomPayload[] = [];

    for (const rawRoom of rawData.rooms) {
        console.log(`Bắt đầu tải ảnh cho phòng: ${rawRoom.title}`);
        
        const roomImageUploadPromises = rawRoom.imageFiles.map(file => 
            uploadToCloudinary(file, WORKSPACE_PHOTOS_PRESET)
        );
        
        let roomImageUrls: string[] = [];
        try {
            roomImageUrls = await Promise.all(roomImageUploadPromises);
            console.log(`Tải ảnh phòng ${rawRoom.title} hoàn tất.`);

            // Xây dựng RoomPayload
            const roomPayload: RoomPayload = {
                title: rawRoom.title,
                description: rawRoom.description,
                workSpaceRoomTypeId: rawRoom.workSpaceRoomTypeId,
                pricePerHour: rawRoom.pricePerHour,
                pricePerDay: rawRoom.pricePerDay,
                pricePerMonth: rawRoom.pricePerMonth,
                capacity: rawRoom.capacity,
                area: rawRoom.area,
                imageUrls: roomImageUrls, // Public IDs đã tải lên
                amenityIds: rawRoom.amenityIds,
            };

            finalRoomsPayload.push(roomPayload);

        } catch (error) {
            console.error(`LỖI: Một hoặc nhiều ảnh của phòng ${rawRoom.title} không thể tải lên Cloudinary.`, error);
            throw new Error(`Không thể tạo Workspace: Lỗi tải ảnh phòng ${rawRoom.title} lên dịch vụ lưu trữ.`);
        }
    }

    // 3. Xây dựng Final Workspace Payload
    const finalPayload: FinalWorkspacePayload = {
        title: rawData.title,
        description: rawData.description,
        ward: rawData.ward,
        street: rawData.street,
        state: rawData.state,
        postalCode: rawData.postalCode,
        latitude: rawData.latitude,
        longitude: rawData.longitude,
        workSpaceTypeId: rawData.workSpaceTypeId,
        imageUrls: workspaceImageUrls, 
        rooms: finalRoomsPayload, 
    };

    console.log("Gửi Payload JSON tới Backend:", finalPayload);

    // 4. Gửi Payload tới Backend
    try {
        const response = await axios.post(API_WORKSPACE_URL, finalPayload, {
             headers: {
                 'Content-Type': 'application/json',
                 'Authorization': `Bearer ${token}` 
             }
        }); 
        
        const result = response.data;
        console.log("Workspace đã được tạo thành công:", result);
        return result; 
        
    } catch (e) {
        if (axios.isAxiosError(e) && e.response) {
            throw new Error(`Tạo Workspace thất bại. Lỗi Server: ${e.response.status} - ${e.response.data.message || 'Lỗi không xác định.'}`);
        } else {
            throw new Error("Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng.");
        }
    }
};

// --- CÁC HÀM KHÁC (GIỮ NGUYÊN) ---

export const getAllWorkspacesOwnerView = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}v1/owner/workspaces`);
        return response.data;
    } catch (error) {
        handleError(error); 
        throw error;       
    }
}

// Cân nhắc sử dụng handleCreateWorkspace thay thế cho createWorkspaceOwner nếu nó xử lý việc upload ảnh
export const createWorkspaceOwner = async (workspaceData: any) => { 
    try {
        const response = await axios.post(
            `${API_BASE_URL}v1/owner/workspaces`,
            workspaceData, 
            {
                headers: {
                    "Content-Type": "application/json",
                }
            }
        );

        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};

export const updateWorkspaceOwner = async (
    workspaceId: number,
    workspaceData: any
) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}v1/owner/workspaces/${workspaceId}`,
            workspaceData, 
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};


export const getAllBookingsOwnerView = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}v1/owner/bookings`);
        return response.data;
    } catch (error) {
        handleError(error); 
        throw error;       
    }
}

export const getPendingBookingsOwnerView = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}v1/owner/bookings/pending`);
        return response.data;
    } catch (error) {
        handleError(error); 
        throw error;       
    }
}

export const confirmBookingOwner = async (bookingId: number) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}v1/owner/bookings/${bookingId}/confirm`
        );
        return response.data; 
    } catch (error) {
        handleError(error);
        throw error;
    }
};

export const completeBookingOwner = async (bookingId: number) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}v1/owner/bookings/${bookingId}/complete`
        );
        return response.data; 
    } catch (error) {
        handleError(error);
        throw error;
    }
};

export const cancelBookingOwner = async (
    bookingId: number,
    reason: string
) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}v1/owner/bookings/${bookingId}/cancel`,
            { reason } 
        );
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};


export const checkInBookingOwner = async (bookingId: number) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}v1/owner/bookings/${bookingId}/check-in`
        );
        return response.data; 
    } catch (error) {
        handleError(error);
        throw error;
    }
};

export const checkOutBookingOwner = async (bookingId: number) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}v1/owner/bookings/${bookingId}/check-out`
        );
        return response.data; 
    } catch (error) {
        handleError(error);
        throw error;
    }
};

export const getOwnerStats = async (): Promise<OwnerStats> => {
  try {
    const url = `${API_BASE_URL}v1/owner/stats`;
    const response = await axios.get<OwnerStats>(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching owner stats:', error);
    throw new Error('Failed to fetch owner statistics.'); 
  }
};
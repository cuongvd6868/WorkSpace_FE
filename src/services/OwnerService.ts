import axios from "axios"
import { CLOUDINARY_UPLOAD_URL, WORKSPACE_PHOTOS_PRESET } from "~/config/cloudinaryConfig";
import { OwnerStats } from "~/types/Owner";
import { API_BASE_URL } from "~/utils/API"
import { handleError } from "~/utils/handleError"
import { uploadToCloudinary } from "./CloudinaryService";

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
    imageUrls: string[]; // Mảng các URL đã upload lên Cloudinary
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
    imageFiles: File[]; 
}


const API_WORKSPACE_URL = `${API_BASE_URL}v1/owner/workspaces`;
export const handleCreateWorkspace = async (rawData: RawWorkspaceData, token: string): Promise<any> => {
    
    console.log("Bắt đầu tải ảnh lên Cloudinary...");

    const uploadPromises = rawData.imageFiles.map(file => 
        uploadToCloudinary(file, WORKSPACE_PHOTOS_PRESET)
    );
    
    let imageUrls: string[] = []; // Chứa Public IDs
    try {
        imageUrls = await Promise.all(uploadPromises);
        console.log("Tải ảnh hoàn tất. Public IDs đã được gán.");
        
    } catch (error) {
        console.error("LỖI: Một hoặc nhiều ảnh không thể tải lên Cloudinary.", error);
        throw new Error("Không thể tạo Workspace: Lỗi tải ảnh lên dịch vụ lưu trữ.");
    }

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
        imageUrls: imageUrls 
    };

    console.log("Gửi Payload JSON tới Backend:", finalPayload);

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

export const getAllWorkspacesOwnerView = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}v1/owner/workspaces`);
        return response.data;
    } catch (error) {
        handleError(error); 
        throw error;        
    }
}

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
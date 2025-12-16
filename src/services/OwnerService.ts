import axios from "axios"
import { DRINK_PRESET, WORKSPACE_PHOTOS_PRESET} from "~/config/cloudinaryConfig";
import { DrinkServiceCreateRequest, DrinkServiceItem, DrinkServiceUpdateRequest, NotificationCreateRequest, NotificationItem, NotificationUpdateRequest, OwnerStats, PromotionOwnerView, WorkspaceDrinkServices } from "~/types/Owner";
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


const API_WORKSPACE_URL = `${API_BASE_URL}v1/owner/workspaces`;
const API_NOTIFICATION_URL = `${API_BASE_URL}v1/notification`; 
const API_DRINK_SERVICE_URL = `${API_BASE_URL}v1/owner/drink-services`;

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

export const getAllOwnerPromotions = async (): Promise<PromotionOwnerView> => {
  try {
    const url = `${API_BASE_URL}v1/promotions/owner/all`;
    const response = await axios.get<PromotionOwnerView>(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching owner promotions:', error);
    throw new Error('Failed to fetch owner promotions.'); 
  }
}

export const createPromotionsOwner = async (promotionData: any) => { 
    try {
        const response = await axios.post(
            `${API_BASE_URL}v1/promotions/owner/generate`,
            promotionData, 
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

export const handleActivePromotion = async (promotionId: number) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}v1/promotions/owner/activate/${promotionId}`
        );
        return response.data; 
    } catch (error) {
        handleError(error);
        throw error;
    }
};

export const getPersonalNotifications = async (): Promise<NotificationItem[]> => {
    try {
        const response = await axios.get<NotificationItem[]>(`${API_NOTIFICATION_URL}/personal`);
        return response.data;
    } catch (error) {
        handleError(error); 
        throw error;
    }
};

/**
 * 2. POST /notification/owner: Tạo thông báo mới cho Owner.
 * (ĐÃ KHÔI PHỤC token)
 * @param data Dữ liệu title và content
 * @param token Authorization token
 * @returns Promise<number> ID của thông báo vừa tạo
 */
export const createOwnerNotification = async (
    data: NotificationCreateRequest,
    token: string // KHÔI PHỤC TOKEN
): Promise<number> => {
    // Định nghĩa cấu trúc Response POST nội bộ
    type CreateResponseInternal = {
        id: { succeeded: boolean; message: string; data: number; errors: any; };
        message: string;
    };
    
    try {
        const response = await axios.post<CreateResponseInternal>(
            `${API_NOTIFICATION_URL}/owner`, 
            data,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // THÊM HEADER TOKEN
                },
            }
        );
        
        // Dựa trên image_7364f9.png
        if (response.data.id.succeeded) {
            return response.data.id.data;
        } else {
            throw new Error(response.data.id.message || "Tạo thông báo thất bại.");
        }
    } catch (error) {
        handleError(error);
        throw error;
    }
};

/**
 * 3. PUT /notification/update/{id}: Cập nhật thông báo hiện có.
 * (ĐÃ KHÔI PHỤC token)
 * @param data Dữ liệu cập nhật, bao gồm id, title và content
 * @param token Authorization token
 * @returns Promise<string> Thông báo thành công từ API
 */
export const updateNotification = async (
    data: NotificationUpdateRequest,
    token: string // KHÔI PHỤC TOKEN
): Promise<string> => {
    // Định nghĩa cấu trúc Response PUT nội bộ (Dựa trên image_7364f1.png)
    type UpdateResponseInternal = {
        success: boolean;
        message: string;
    };
    
    try {
        const notificationId = data.id; 
        
        const response = await axios.put<UpdateResponseInternal>(
            `${API_NOTIFICATION_URL}/update/${notificationId}`, 
            data, 
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // THÊM HEADER TOKEN
                },
            }
        );

        if (response.data.success) {
            return response.data.message; // "Cập nhật thành công"
        } else {
            throw new Error(response.data.message || "Cập nhật thất bại.");
        }
    } catch (error) {
        handleError(error);
        throw error;
    }
};

export const createDrinkServices = async (
    workspaceId: number,
    rawItems: Array<DrinkServiceCreateRequest & { imageFile: File }>,
    token: string
): Promise<void> => {
    
    // 1. Tải ảnh của từng dịch vụ lên Cloudinary và xây dựng Payload
    const finalPayload: DrinkServiceCreateRequest[] = [];

    for (const rawItem of rawItems) {
        if (!rawItem.imageFile) {
            throw new Error(`Dịch vụ "${rawItem.name}" thiếu file ảnh.`);
        }
        
        console.log(`Bắt đầu tải ảnh cho dịch vụ: ${rawItem.name}`);
        
        try {
            // Tải ảnh sử dụng DRINK_PRESET
            const imageUrl = await uploadToCloudinary(rawItem.imageFile, DRINK_PRESET); 
            console.log(`Tải ảnh dịch vụ ${rawItem.name} hoàn tất. URL: ${imageUrl}`);

            // Xây dựng Payload cuối cùng
            const itemPayload: DrinkServiceCreateRequest = {
                name: rawItem.name,
                description: rawItem.description,
                price: rawItem.price,
                imageUrl: imageUrl, 
            };
            finalPayload.push(itemPayload);

        } catch (error) {
            console.error(`LỖI: Ảnh của dịch vụ ${rawItem.name} không thể tải lên Cloudinary.`, error);
            throw new Error(`Không thể tạo dịch vụ: Lỗi tải ảnh ${rawItem.name} lên dịch vụ lưu trữ.`);
        }
    }

    // 2. Gửi Final Payload JSON tới Backend
    try {
        const response = await axios.post(
            `${API_WORKSPACE_URL}/${workspaceId}/drink-services`, 
            finalPayload, 
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
            }
        );
        
        // API này có thể trả về status 200/201 mà không có body cụ thể (dựa trên image_66aa12.png)
        // Nếu API trả về 200/201, chúng ta kết luận thành công
        if (response.status === 200 || response.status === 201) {
            console.log("Tạo dịch vụ đồ uống thành công.");
        }
        
    } catch (error) {
        handleError(error);
        throw error;
    }
};

/**
 * 2. GET /workspaces/{workspaceId}/drink-services: Lấy danh sách dịch vụ đồ uống theo Workspace.
 * @param workspaceId ID của Workspace
 * @returns Promise<DrinkServiceItem[]>
 */
export const getDrinkServicesByWorkspace = async (
    workspaceId: number
): Promise<DrinkServiceItem[]> => {
    try {
        const response = await axios.get<DrinkServiceItem[]>(
            `${API_WORKSPACE_URL}/${workspaceId}/drink-services`
        );
        // Dựa trên image_66aa6f.png
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};

/**
 * 3. GET /owner/drink-services: Lấy tất cả dịch vụ đồ uống, nhóm theo Workspace.
 * @returns Promise<WorkspaceDrinkServices[]>
 */
export const getAllDrinkServicesGrouped = async (): Promise<WorkspaceDrinkServices[]> => {
    try {
        const response = await axios.get<WorkspaceDrinkServices[]>(
            API_DRINK_SERVICE_URL
        );
        // Dựa trên image_66aacb.png
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};

/**
 * 4. PUT /owner/drink-services/{id}: Cập nhật dịch vụ đồ uống.
 * @param updateData Dữ liệu cập nhật (bao gồm ID, có thể bao gồm file ảnh mới)
 * @param token Authorization token
 * @returns Promise<void>
 */
export const updateDrinkService = async (
    updateData: DrinkServiceUpdateRequest & { newImageFile?: File },
    token: string
): Promise<void> => {
    let finalImageUrl = updateData.imageUrl;
    const serviceId = updateData.id;

    // 1. Xử lý tải ảnh mới (nếu có)
    if (updateData.newImageFile) {
        console.log(`Bắt đầu tải ảnh mới cho dịch vụ ID: ${serviceId}`);
        try {
            // Tải ảnh mới lên Cloudinary
            finalImageUrl = await uploadToCloudinary(updateData.newImageFile, DRINK_PRESET);
            console.log("Tải ảnh mới hoàn tất.");
        } catch (error) {
            console.error(`LỖI: Ảnh mới của dịch vụ ID ${serviceId} không thể tải lên Cloudinary.`, error);
            throw new Error(`Không thể cập nhật dịch vụ: Lỗi tải ảnh lên dịch vụ lưu trữ.`);
        }
    }

    // 2. Xây dựng Payload JSON cuối cùng
    const payload: DrinkServiceUpdateRequest = {
        id: serviceId,
        name: updateData.name,
        description: updateData.description,
        price: updateData.price,
        imageUrl: finalImageUrl, // URL cũ hoặc URL mới
        isActive: updateData.isActive
    };

    // 3. Gửi Payload tới Backend
    try {
        await axios.put(
            `${API_DRINK_SERVICE_URL}/${serviceId}`, 
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
            }
        );
        // Dựa trên image_66aa30.png, API trả về body '2', nên ta không cần xử lý data cụ thể.
        console.log(`Cập nhật dịch vụ ID ${serviceId} thành công.`);

    } catch (error) {
        handleError(error);
        throw error;
    }
};

/**
 * 5. DELETE /owner/drink-services/{id}: Xóa dịch vụ đồ uống.
 * @param serviceId ID của dịch vụ cần xóa
 * @param token Authorization token
 * @returns Promise<void>
 */
export const deleteDrinkService = async (
    serviceId: number,
    token: string
): Promise<void> => {
    try {
        await axios.delete(
            `${API_DRINK_SERVICE_URL}/${serviceId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}` 
                },
            }
        );
        // Dựa trên image_66a9bd.png, API trả về body '2', nên ta không cần xử lý data cụ thể.
        console.log(`Xóa dịch vụ ID ${serviceId} thành công.`);
        
    } catch (error) {
        handleError(error);
        throw error;
    }
};
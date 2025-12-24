import axios from "axios";
import { API_BASE_URL } from "~/utils/API";
import { handleError } from "~/utils/handleError";
import { 
    Notification, 
    CreateNotificationRequest, 
    UpdateNotificationRequest, 
    Promotion,
    CreatePromotionRequest,
    ActivatePromotionRequest,
    Booking,
    UpdateUserRoleRequest,
    TopBookedWorkspace
} from "~/types/Admin";
import { getAuthHeaders } from "./AuthService";

export const getAdminDashboard = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}v1/admin/dashboard`);
        return response.data;
    } catch (error) {
        handleError(error); 
        throw error;      
    }
}


export const getStaffsAccount = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}v1/admin/staffs`);
        return response.data;
    } catch (error) {
        handleError(error); 
        throw error;      
    }
}

export const getOwnersAccount = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}v1/admin/owners`);
        return response.data;
    } catch (error) {
        handleError(error); 
        throw error;      
    }
}

export const getCustomerAccount = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}v1/admin/customers`);
        return response.data;
    } catch (error) {
        handleError(error); 
        throw error;      
    }
}

export const handleBlockUser = async (id: number) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}v1/admin/${id}/block`, 
            {}
        );
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};

export const getAllOwnerRegistration = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}v1/staff/owner-registrations`);
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;       
    }
}

export const handleApproveOwner = async (id: number) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}v1/admin/approve-owner/${id}`, 
            {}
        );
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};

export const handleRejectOwner = async (id: number) => {
    try {
        const response = await axios.delete(
            `${API_BASE_URL}v1/admin/reject-owner/${id}`, 
            {}
        );
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};


export const getAllNotifications = async (): Promise<Notification[]> => {
    try {
        const response = await axios.get<Notification[]>(
            `${API_BASE_URL}v1/notification/All-Notification-system`
        );
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};


export const createNotification = async (data: CreateNotificationRequest): Promise<any> => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}v1/notification/admin`,
            data
        );
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};


export const updateNotification = async (data: UpdateNotificationRequest): Promise<any> => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}v1/notification/update/${data.id}`,
            data
        );
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};

export const deleteNotification = async (id: number): Promise<any> => {
    try {
        const response = await axios.delete(
            `${API_BASE_URL}v1/notification/delete/${id}`
        );
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};

export const getAllPromotions = async (): Promise<Promotion[]> => {
    try {
        const response = await axios.get<Promotion[]>(
            `${API_BASE_URL}v1/promotions/admin/all`,
            getAuthHeaders() 
        );
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};

export const createPromotion = async (data: CreatePromotionRequest): Promise<any> => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}v1/promotions/admin/generate`,
            data,
            getAuthHeaders() 
        );
        return response.data; 
    } catch (error) {
        handleError(error);
        throw error;
    }
};


export const handleActivatePromotion = async (
    id: number, 
    requestBody?: ActivatePromotionRequest
): Promise<any> => {
    try {
        const config = getAuthHeaders();
        const dataToSend = {}; 
        
        const response = await axios.put(
            `${API_BASE_URL}v1/promotions/admin/activate/${id}`,
            dataToSend, 
            config 
        );
        
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};

// trong file ~/services/AdminService.ts
export const handleUpdateUserRole = async (userId: number, role: string) => {
    try {
        const response = await axios.put(`${API_BASE_URL}v1/admin/users/${userId}/role`, { role });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAllBookings = async (): Promise<Booking[]> => {
    try {
        const response = await axios.get<Booking[]>(
            `${API_BASE_URL}v1/admin/admin/All-bookings`,
            getAuthHeaders() 
        );
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};

export const getTopBookedWorkspaces = async (count: number = 5): Promise<TopBookedWorkspace[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}v1/workspaces/top-booked`, {
            params: {
                count: count
            }
        });
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};
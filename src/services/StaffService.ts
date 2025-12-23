import axios from "axios";
import { API_BASE_URL } from "~/utils/API";
import { handleError } from "~/utils/handleError";

export const getStaffDashboard = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}v1/staff/dashboard`);
        return response.data;
    } catch (error) {
        handleError(error); 
        throw error;         
    }
}

export const getAllSupportTickets = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}v1/staff/support-tickets`);
        return response.data;
    } catch (error) {
        handleError(error); 
        throw error;     
    }
}

export const replyToTicket = async (ticketId: number, payload: { message: string }) => {
    const url = `${API_BASE_URL}v1/staff/support-tickets/${ticketId}/reply`;

    try {
        const response = await axios.post(url, payload);
        return response.data; 
    } catch (error) {
        handleError(error);
        throw error;
    }
}


export const updateTicketStatus = async (ticketId: number, payload: { status: number }) => {
    const url = `${API_BASE_URL}v1/staff/support-tickets/${ticketId}/status`;
    
    try {
        const response = await axios.put(url, payload);
        return response.data; 
    } catch (error) {
        handleError(error);
        throw error;
    }
}

export const getAllBookingToday = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}v1/staff/bookings/today`);
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;  
    }
}

export const getAllReviews = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}v1/staff/reviews`);
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;  
    }
}

export const handleApproveReview = async (id: number) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}v1/staff/reviews/${id}/approve`, 
            {}
        );
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};


export const handleToggleVisibilityReview = async (id: number) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}v1/staff/reviews/${id}/toggle-visibility`,
            {}
        );
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};


export const getAllWorkspaces = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}v1/staff/workspaces`);
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;  
    }
}

export const getAllPendingWorkspaces = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}v1/staff/workspaces/pending`);
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;  
    }
}

export const handleApproveWorkspace = async (id: number) => {
    try {

        const response = await axios.put(
            `${API_BASE_URL}v1/staff/workspaces/${id}/approve`,
            {} 
        );
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};

export const getAllWorkspaceStaffView = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}v1/staff/workspaces`);
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
}

export const ToggleWorkspace = async (id: number) => {
    try {

        const response = await axios.put(
            `${API_BASE_URL}v1/staff/workspaces/${id}/Block-Workspace`,
            {} 
        );
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};


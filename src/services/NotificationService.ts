
import axios from "axios"
import { API_BASE_URL } from "~/utils/API" 
import { handleError } from "~/utils/handleError" 



export const getAllNotification = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}v1/notification/All-Notification-system`);
        return response.data
    } catch (error) {
        handleError(error); 
        throw error; 
    }
}

export const getAllNotificationByWorkspace = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}v1/notification/personal`);
        return response.data
    } catch (error) {
        handleError(error); 
        throw error; 
    }
}

export const getAllNotificationByWorkspaceId = async (id: number) => {
    try {
        const response = await axios.get(`${API_BASE_URL}v1/${id}/Workspaces-notifications`);
        return response.data
    } catch (error) {
        handleError(error); 
        throw error; 
    }
}

export const deleteNotification = async (id: number) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}v1/notification/delete/${id}`);
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
}
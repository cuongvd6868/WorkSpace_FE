import axios from "axios";
import { API_BASE_URL } from "~/utils/API";
import { handleError } from "~/utils/handleError";

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
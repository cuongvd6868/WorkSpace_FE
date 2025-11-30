import axios from "axios"
import { OwnerStats } from "~/types/Owner";
import { API_BASE_URL } from "~/utils/API"
import { handleError } from "~/utils/handleError"

export const getAllWorkspacesOwnerView = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}v1/owner/workspaces`);
        return response.data;
    } catch (error) {
        handleError(error); 
        throw error;        
    }
}

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
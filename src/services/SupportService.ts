import axios from "axios";
import { API_BASE_URL } from "~/utils/API";
import { handleError } from "~/utils/handleError";
import { CreateTicketPayload } from "~/types/Ticket"; 


export const createSupportTicket = async (payload: CreateTicketPayload) => {
    const url = `${API_BASE_URL}v1/support/tickets`;

    try {
        const response = await axios.post(url, payload);
        return response.data; 

    } catch (error) {
        handleError(error); 
        throw error; 
    }
}
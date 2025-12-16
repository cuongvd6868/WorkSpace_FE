import axios from 'axios';
import { API_BASE_URL } from '~/utils/API'; 
import { handleError } from '~/utils/handleError'; 
import { 
    Message, 
    ApiResponse, 
    StartChatResponseData
} from '~/types/ChatUser'; 

// Endpoint cơ sở cho Chat
const CHAT_BASE_URL = `${API_BASE_URL}v1/customer-chat`;

/**
 * 1. Khởi tạo phiên chat mới
 * Endpoint: POST /api/v1/customer-chat/start
 */
export const StartCustomerChat = async (initialMessage: string, workSpaceId: number) => {
    // Định nghĩa kiểu dữ liệu trả về chính xác
    type ResponseType = ApiResponse<StartChatResponseData>;

    try {
        const response = await axios.post<ResponseType>(`${CHAT_BASE_URL}/start`, {
            initialMessage,
            workSpaceId
        });
        
        // Kiểm tra logic thành công của API (nếu API luôn trả về 200)
        if (response.data.succeeded) {
            return response.data.data; // Trả về StartChatResponseData
        } else {
            throw new Error(response.data.message || 'Khởi tạo chat thất bại.');
        }

    } catch (error) {
        handleError(error);
        throw error;
    }
};

/**
 * 2. Gửi tin nhắn trong phiên chat đã có
 * Endpoint: POST /api/v1/customer-chat/messages
 */
export const SendChatMessage = async (sessionId: string, message: string, senderId: string) => {
    // Định nghĩa kiểu dữ liệu trả về (có thể là một message object, hoặc chỉ là thành công)
    type ResponseType = ApiResponse<any>; 

    try {
        const response = await axios.post<ResponseType>(`${CHAT_BASE_URL}/messages`, {
            sessionId,
            message,
            senderId
        });

        if (response.data.succeeded) {
            return response.data; // Trả về toàn bộ response data
        } else {
            throw new Error(response.data.message || 'Gửi tin nhắn thất bại.');
        }

    } catch (error) {
        handleError(error);
        throw error;
    }
};

/**
 * 3. Lấy lịch sử tin nhắn (Dùng cho Polling)
 * Endpoint: GET /api/v1/customer-chat/messages/history?sessionId=...
 * CHÚ Ý: Đây là API giả định cho Polling.
 */
export const GetChatHistory = async (sessionId: string) => {
    // Định nghĩa kiểu dữ liệu trả về chính xác
    type ResponseType = ApiResponse<Message[]>;

    try {
        // Sử dụng object `params` để axios tự động xử lý query string
        const response = await axios.get<ResponseType>(`${CHAT_BASE_URL}/messages/history`, {
            params: {
                sessionId: sessionId
            }
        });

        if (response.data.succeeded) {
            return response.data.data; // Trả về Message[]
        } else {
            // Trường hợp không thành công nhưng không cần throw error để Polling vẫn tiếp diễn
            console.warn(`[ChatService] Failed to fetch history for ${sessionId}: ${response.data.message}`);
            return []; 
        }

    } catch (error) {
        // Trong Polling, có thể bắt lỗi mạng và trả về mảng rỗng thay vì throw error 
        // để không làm ứng dụng crash, chỉ cần log lỗi.
        handleError(error); 
        return []; 
    }
};
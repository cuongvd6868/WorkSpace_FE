import axios from "axios";
import { API_BASE_URL } from "~/utils/API";
import { handleError } from "~/utils/handleError";
import { ApiResponse, ChatMessage, StartChatRequest, SendMessageRequest, ChatSession, OwnerChatSession, OwnerChatMessage, OwnerReplyResponse } from '~/types/ChatUser';

const BASE_URL = `${API_BASE_URL}v1/customer-chat`;

// Tạo Instance riêng cho Chat
export const chatApi = axios.create({
    baseURL: BASE_URL,
});

export const ownerApi = axios.create({
    baseURL: `${API_BASE_URL}v1/owner/customer-chat`,
});

export const chatService = {
    // Lấy danh sách phiên chat (Thêm t= để tránh trình duyệt cache dữ liệu cũ)
    getMySessions: async () => {
        try {
            const res = await chatApi.get<ChatSession[]>(`/my-sessions?t=${Date.now()}`);
            return res.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },

    getChatHistory: async (sessionId: string) => {
        try {
            const res = await chatApi.get<ChatMessage[]>(`/${sessionId}/messages?t=${Date.now()}`);
            return res.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },

    startChat: async (payload: StartChatRequest) => {
        try {
            const res = await chatApi.post<ApiResponse<ChatSession>>(`/start`, payload);
            return res.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },

    sendMessage: async (payload: SendMessageRequest) => {
        try {
            const res = await chatApi.post<ApiResponse<ChatMessage>>(`/messages`, payload);
            return res.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    }
};

export const ownerChatService = {
    // Lấy danh sách phiên chat (Hình 1)
    getOwnerSessions: async () => {
        const res = await ownerApi.get<OwnerChatSession[]>(`/my-sessions?t=${Date.now()}`);
        return res.data;
    },

    // Lấy tin nhắn theo SessionId (Hình 3)
    getOwnerChatHistory: async (sessionId: string) => {
        const res = await ownerApi.get<OwnerChatMessage[]>(`/sessions/${sessionId}/messages?t=${Date.now()}`);
        return res.data;
    },

    // Trả lời khách hàng (Hình 2: Gửi dạng "content")
    replyToCustomer: async (sessionId: string, content: string) => {
        const res = await ownerApi.post<OwnerReplyResponse>(
            `/sessions/${sessionId}/reply`, 
            JSON.stringify(content), // Chuyển thành chuỗi raw JSON "nội dung"
            { headers: { 'Content-Type': 'application/json' } }
        );
        return res.data;
    }
};
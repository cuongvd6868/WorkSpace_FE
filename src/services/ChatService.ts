import axios from "axios";
import { API_BASE_URL } from "~/utils/API";
import { handleError } from "~/utils/handleError";
import { 
  ApiResponse, 
  ChatMessage, 
  StartChatRequest, 
  SendMessageRequest,
  ChatSession 
} from '~/types/ChatUser';

const BASE_URL = `${API_BASE_URL}v1/customer-chat`;

export const chatService = {
  // 1. Khởi tạo phiên chat (Dùng cho lần chat đầu tiên)
  startChat: async (payload: StartChatRequest) => {
    try {
      // payload bao gồm: { initialMessage: string, workSpaceId: number }
      const response = await axios.post<ApiResponse<ChatSession>>(`${BASE_URL}/start`, payload);
      return response.data; // Trả về sessionId và thông tin phiên chat
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  // 2. Lấy lịch sử tin nhắn
  getChatHistory: async (sessionId: string) => {
    try {
      const response = await axios.get<ChatMessage[]>(`${BASE_URL}/${sessionId}/messages`);
      return response.data;
    } catch (error) {
      handleError(error); 
      throw error;
    }
  },

  // 3. Gửi tin nhắn (Cho các lần tiếp theo sau khi đã có sessionId)
  sendMessage: async (payload: SendMessageRequest) => {
    try {
      // payload bao gồm: { sessionId: string, message: string }
      const response = await axios.post<ApiResponse<ChatMessage>>(`${BASE_URL}/messages`, payload);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }
};
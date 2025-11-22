import axios from 'axios';
import { ChatbotResponse } from '../types/Chat';

// Cập nhật URL API chính xác của bạn tại đây
const API_URL = 'https://localhost:7105/api/v1/ai-chatbot/chat'; 

export const getChatResponse = async (message: string): Promise<ChatbotResponse> => {
  const payload = { message };
  
  try {
    const response = await axios.post<ChatbotResponse>(API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      // Có thể thêm chứng thực (Authorization header) nếu cần
    });

    return response.data;
  } catch (error) {
    console.error('Lỗi khi gọi API Chatbot:', error);
    throw new Error('Không thể kết nối đến Chatbot Service hoặc nhận phản hồi lỗi.');
  }
};
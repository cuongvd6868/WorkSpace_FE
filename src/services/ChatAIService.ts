import axios from 'axios';
import { ChatbotResponse } from '../types/Chat';
import { API_BASE_URL } from '~/utils/API';

const API_URL = `${API_BASE_URL}v1/ai-chatbot/chat`; 

export const getChatResponse = async (message: string): Promise<ChatbotResponse> => {
  const payload = { message };
  
  try {
    const response = await axios.post<ChatbotResponse>(API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Lỗi khi gọi API Chatbot:', error);
    throw new Error('Không thể kết nối đến Chatbot Service hoặc nhận phản hồi lỗi.');
  }
};
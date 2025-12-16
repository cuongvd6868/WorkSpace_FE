// Trong ~/types/Chat.ts (File types của bạn)
export interface Message {
    id: number;
    sessionId: string;
    senderName: string; // User hoặc Agent
    content: string;
    sentAt: string;
}

export interface StartChatResponseData {
    sessionId: string;
    customerName: string;
    customerEmail: string;
    // ... các trường khác
}

// Cấu trúc phản hồi chung từ API (giống cấu trúc trong ảnh bạn cung cấp)
export interface ApiResponse<T> {
    succeeded: boolean;
    message: string;
    errors: string[];
    data: T; // T là kiểu dữ liệu cụ thể cho từng API
}

// Trong ~/utils/API.ts (hoặc nơi bạn định nghĩa BASE_URL)
// export const API_BASE_URL = 'https://your-api-domain.com/';
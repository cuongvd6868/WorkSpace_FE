// Định nghĩa các Interface dựa trên Postman
export interface ChatMessage {
  id: number;
  sessionId: string;
  senderName: string;
  isOwner: boolean;
  content: string;
  sentAt: string;
}

export interface ChatSession {
  sessionId: string;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  lastMessageAt: string;
  isActive: boolean;
  assignedOwnerId: number;
  assignedOwnerName: string;
}

// Cấu trúc dùng chung cho các API có bọc 'data'
export interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  errors: any;
  data: T;
}

// Request Payload cho API Start
export interface StartChatRequest {
  initialMessage: string;
  workSpaceId: number;
}

// Request Payload cho API Send Message
export interface SendMessageRequest {
  sessionId: string;
  message: string;
}
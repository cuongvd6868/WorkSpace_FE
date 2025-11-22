export interface WorkspaceAmenity {
  name: string;
}

export interface Recommendation {
  workSpaceId: number;
  title: string;
  description: string;
  ward: string;
  street: string;
  latitude: number;
  longitude: number;
  minPricePerDay: number;
  maxPricePerDay: number;
  averagePricePerDay: number;
  totalRooms: number;
  availableRooms: number;
  minCapacity: number;
  maxCapacity: number;
  availableAmenities: WorkspaceAmenity[];
  imageUrls: string[];
  averageRating: number;
  totalReviews: number;
  hostName: string;
  isHostVerified: boolean;
  recommendationScore: number;
  recommendationReason: string;
  matchedFeatures: string[];
}

export interface ChatbotResponse {
  message: string;
  recommendations?: Recommendation[];
  images?: string[]; 
}

// BỔ SUNG: Type cho lịch sử chat
export type MessageSender = 'user' | 'ai';

export interface ChatMessage {
  id: number;
  sender: MessageSender;
  text: string;
  recommendations?: Recommendation[]; 
  timestamp: Date;
}
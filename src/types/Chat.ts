// AI Chatbox
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
  minPricePerHour: number;
  maxPricePerHour: number;
  averagePricePerHour: number;
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
  thumbnailUrl: string
}

export interface ChatbotResponse {
  message: string;
  recommendations?: Recommendation[];
  images?: string[]; 
}

export type MessageSender = 'user' | 'ai';

export interface ChatMessage {
  id: number;
  sender: MessageSender;
  text: string;
  recommendations?: Recommendation[]; 
  timestamp: Date;
}

// User Chat
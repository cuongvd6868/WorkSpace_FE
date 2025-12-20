export interface RevenueChartItem {
    month: number;
    year: number;
    label: string;
    revenue: number;
}

export interface AdminStats {
    totalRevenue: number;
    newBookingsThisMonth: number;
    newUsersThisMonth: number;
    totalUsers: number;
    revenueChart: RevenueChartItem[];
}

export interface UserAdminView {
    id: number;
    userName: string;
    email: string;
    fullName: string;
    isActive: boolean;
}

export interface OwnerRegistrationsView {
    id: number;
    companyName: string;
    description: string;
    contactPhone: string;
    userEmail: string;
    avatar: string;
}

export interface PromotionAdminView {
  id: number;
  code: string;
  description: string;
  discountValue: number;
  discountType: string;
  startDate: string; 
  endDate: string;   
  usageLimit: number;
  usedCount: number;
  remainingUsage: number;
  isActive: boolean;
}

export interface Notification {
  id: number;
  title: string;
  content: string;
  senderId: number;
  senderRole: string; 
  createUtc: string; 
}

export interface CreateNotificationRequest {
  title: string;
  content: string;
}

export interface UpdateNotificationRequest {
  id: number;
  title: string;
  content: string;
}

export type DiscountType = 'PERCENT' | 'AMOUNT'; 

export interface CreatePromotionRequest {
    description: string;
    discountValue: number;
    discountType: DiscountType; 
    startDate: string; 
    endDate: string; 
    usageLimit: number;
    minimumAmount: number;
}

export interface Promotion {
    id: number;
    code: string;
    description: string;
    discountValue: number; 
    discountType: DiscountType;
    startDate: string; 
    endDate: string;
    usageLimit: number;
    usedCount: number;
    remainingUsage: number;
    isActive: boolean;
}


export interface ActivatePromotionRequest {
    id: number;
    title: string; 
    content: string;
}

export interface BookingStatus {
    id: number;
    name: string; // Tên trạng thái, ví dụ: "Completed"
}

export interface UpdateUserRoleRequest {
    role: string;
}

export interface Booking {
    isReviewed: boolean;
    id: number;
    bookingCode: string;
    customerId: number | null; 
    customerName: string | null; 
    customerEmail: string | null;
    workSpaceRoomId: number;
    workSpaceRoomTitle: string; 
    
    
    startTimeUtc: string; 
    endTimeUtc: string;   
    
    numberOfParticipants: number;
    
    finalAmount: number;
    currency: string; 
    
    // Trạng thái & Lịch sử
    bookingStatusID: number;
    bookingStatusName: string; 
    
    createUtc: string;
    checkedInAt: string | null; 
    checkedOutAt: string | null; 

}

export type AllBookingsResponse = Booking[];
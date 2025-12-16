export type WorkspacesOwnerView = {
    id: number,
    title: string,
    description: string,
    hostName: string,
    workSpaceTypeName: string,
    addressLine: string,
    totalRooms: number,
    thumbnailUrl: string,
    imageUrls: []
}


export type BookingsOwnerView = {
    id: number,
    bookingCode: string,
    customerName: string,
    workSpaceRoomId: number,
    workSpaceRoomTitle: string,
    startTimeUtc: string,
    endTimeUtc: string,
    finalAmount: number,
    bookingStatusName: string
}

export type BookingsPendingOwnerView = {
    id: number,
    bookingCode: string,
    customerName: string,
    customerEmail: string,
    workSpaceRoomId: number,
    workSpaceRoomTitle: string,
    startTimeUtc: string,
    endTimeUtc: string,
    finalAmount: number,
    bookingStatusName: string
}

export interface WeeklyRevenueData {
  weekLabel: string;
  year: number;
  weekNumber: number;
  totalRevenue: number;
}

export interface OwnerStats {
  totalRevenue: number;
  totalBookings: number;
  completedBookings: number;
  averageRating: number;
  totalReviews: number;
  monthlyRevenue: number;
  newBookingsThisMonth: number;
  occupancyRate: number;
  pendingWorkspaces: number;
  weeklyRevenueTrend: WeeklyRevenueData[];
}

export interface PromotionOwnerView {
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

export interface PromotionsRequest {
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

export interface NotificationItem {
    id: number;
    title: string;
    content: string;
    senderId: number;
    senderRole: string; 
    createUtc: string; 
}


export interface NotificationCreateRequest {
    title: string;
    content: string;
}

export interface NotificationUpdateRequest {
    id: number;
    title: string;
    content: string;
}

export interface DrinkServiceCreateRequest {
    name: string;
    description: string;
    price: number;
    imageUrl: string; // Có thể là string rỗng nếu không có ảnh
}

/**
 * Định nghĩa cho việc Cập nhật Dịch vụ Đồ uống.
 * Cần ID để xác định đối tượng cần cập nhật.
 * Dùng cho PUT /api/v1/owner/drink-services/{id}
 */
export interface DrinkServiceUpdateRequest {
    id: number; // ID của dịch vụ cần cập nhật
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    isActive: boolean; // Trạng thái hoạt động
}


// --- 2. Dữ liệu Response (Đọc) ---

/**
 * Cấu trúc chi tiết của một Dịch vụ Đồ uống (Item).
 * Dùng trong mảng trả về từ GET theo workspace ID.
 */
export interface DrinkServiceItem {
    id: number; // ID của dịch vụ
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    isActive: boolean;
    workSpaceId: number; // ID của Workspace mà dịch vụ thuộc về
}

/**
 * Cấu trúc trả về khi lấy tất cả dịch vụ, được nhóm theo Workspace.
 * Dùng cho GET /api/v1/owner/drink-services.
 */
export interface WorkspaceDrinkServices {
    workSpaceId: number;
    workSpaceTitle: string;
    services: DrinkServiceItem[]; // Danh sách các dịch vụ đồ uống thuộc Workspace đó
}

export interface DrinkServiceCreateRequest {
    name: string;
    description: string;
    price: number;
    imageUrl: string; 
}

export interface DrinkServiceUpdateRequest {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    isActive: boolean;
}

export interface DrinkServiceItem {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    isActive: boolean;
    workSpaceId: number;
}

export interface WorkspaceDrinkServices {
    workSpaceId: number;
    workSpaceTitle: string;
    services: DrinkServiceItem[];
}
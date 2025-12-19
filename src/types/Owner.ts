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







// Interface cho các Tiện ích (Amenities)
export interface Amenity {
    id: number;
    name: string; // Tên tiện ích, ví dụ: "Wi-Fi tốc độ cao"
    iconClass: string; // Class icon, ví dụ: "fa-solid fa-wifi"
}

// Interface cho các Khung giờ bị chặn (Blocked Times) của phòng
export interface BlockedTime {
    id: number;
    startTime: string; // Định dạng ISO 8601, ví dụ: "2025-12-02T00:00:00"
    endTime: string;   // Định dạng ISO 8601, ví dụ: "2025-12-02T01:30:00"
    reason: string; // Lý do bị chặn, ví dụ: "Blocked for booking ID: 57"
}

// Interface cho mỗi Phòng (Room)
export interface Room {
    id: number;
    title: string;
    description: string;
    roomType: string; // Ví dụ: "Meeting Room"
    pricePerHour: number;
    pricePerDay: number;
    pricePerMonth: number;
    capacity: number; // Sức chứa, ví dụ: 12
    area: number; // Diện tích, ví dụ: 40
    isActive: boolean;
    isVerified: boolean;
    images: any[]; // Mảng này trống trong JSON, giữ là 'any[]' hoặc 'string[]' nếu biết rõ
    amenities: Amenity[];
    averageRating: number;
    reviewCount: number;
    isAvailable: boolean;
    blockedTimes: BlockedTime[];
}

// Interface chính cho chi tiết Coworking Space/Workspace
export interface WorkspaceDetail {
    id: number;
    title: string; // Ví dụ: "Coworking Space Phan Chu Trinh"
    description: string;
    imageUrls: string[];
    hostId: number;
    hostName: string;
    hostCompanyName: string;
    hostContactPhone: string;
    isHostVerified: boolean;
    addressLine: string;
    ward: string; // Phường/Xã
    state: string; // Tỉnh/Thành phố
    country: string;
    latitude: number;
    longitude: number;
    workSpaceType: string; // Ví dụ: "Coworking Space"
    isActive: boolean;
    isVerified: boolean;
    rooms: Room[];
    totalRooms: number;
    availableRooms: number;
    minPricePerDay: number;
    maxPricePerDay: number;
}

export interface CreateRoomPayload {
    title: string;
    description: string;
    workSpaceRoomTypeId: number;
    pricePerHour: number;
    pricePerDay: number;
    pricePerMonth: number;
    capacity: number;
    area: number;
    imageUrls: string[]; // Các Public IDs/URL đã tải lên từ Cloudinary
    amenityIds: number[];
}

// Interface cho dữ liệu thô từ Form (trước khi upload ảnh)
export interface RawCreateRoomData {
    title: string;
    description: string;
    workSpaceRoomTypeId: number;
    pricePerHour: number;
    pricePerDay: number;
    pricePerMonth: number;
    capacity: number;
    area: number;
    imageFiles: File[]; // Các File object (cần được upload trước)
    amenityIds: number[];
}

export interface RoomUpdatePayload {
    title: string;
    description: string;
    workSpaceRoomTypeId: number;
    pricePerHour: number;
    pricePerDay: number;
    pricePerMonth: number;
    capacity: number;
    area: number;
    isActive: boolean; // Trường mới trong payload cập nhật
    imageUrls?: string[]; // Thêm trường này nếu có thể cập nhật ảnh (dựa trên ảnh POST room)
    amenityIds?: number[]; // Thêm trường này nếu có thể cập nhật tiện ích
}

// Interface cho dữ liệu thô từ Form (bao gồm ảnh mới nếu có)
export interface RawRoomUpdateData extends RoomUpdatePayload {
    roomId: number;
    newImageFiles?: File[]; // File ảnh mới (để upload)
}

// Interface cho Payload cập nhật Workspace (PUT /api/v1/owner/workspaces/{id})
export interface WorkspaceUpdatePayload {
    title: string;
    description: string;
    street: string;
    ward: string;
    state: string;
    postalCode: string;
    latitude: number;
    longitude: number;
    workSpaceTypeId: number;
    isActive: boolean; // Trường mới trong payload cập nhật
    imageUrls: string[]; // Danh sách URL ảnh (sau khi đã upload)
}

// Interface cho dữ liệu thô từ Form (bao gồm ảnh mới nếu có)
export interface RawWorkspaceUpdateData extends WorkspaceUpdatePayload {
    workspaceId: number; // ID được truyền qua Path Parameter
    newImageFiles?: File[]; // File ảnh mới (để upload)
}

export interface WorkspacePending {
  id: number;
  title: string;
  description: string;
  workSpaceTypeName: string; 
  addressLine: string;
  city: string;
  totalRooms: number;
  thumbnailUrl: string;
}
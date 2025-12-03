export interface CancelledBooking {
  bookingId: number;
  bookingCode: string;
  customerName: string;
  workspaceName: string;
  finalAmount: number;
  cancelledAt: string;  
  cancellationReason: string;
}

export interface StaffDashboardStats {
  newSupportTicketsCount: number;
  pendingReviewsCount: number;
  pendingWorkspacesCount: number;
  bookingsTodayCount: number;
  cancelledBookings: CancelledBooking[];
}

export interface SupportTickets {
    id: number,
    subject: string,
    ticketType: number,
    status: number,
    createUtc: string,
    submittedByUserName: string
}

export interface ReplyTicketPayload {
    message: string;
}

export interface UpdateStatusPayload {
    status: number;
}

export interface BookingTodayList {
  id: number;
  bookingCode: string;
  customerName: string;
  customerEmail: string;
  workSpaceRoomTitle: string;
  startTimeUtc: string;
  endTimeUtc: string;
  numberOfParticipants: number;
  finalAmount: number
}

export interface ReviewsStaffView {
  id: number;
  bookingCode: string;
  userName: string;
  workSpaceRoomTitle: string;
  workSpaceName: string;
  rating: number;
  comment: string;
  isVerified: boolean;
  isPublic: boolean;
}

export interface Room {
    id: number;
    title: string;
    workSpaceId: number;
    workSpaceTitle: string;
    city: string;
    thumbnailUrl: string | null;
    imageUrls: string[];
    pricePerDay: number;
    capacity: number;
    area: number;
    isVerified: boolean;
    averageRating: number;
    ratingCount: number;
}

export interface WorkspaceItem {
    id: number;
    title: string;
    description: string;
    hostName: string;
    hostEmail: string;
    workSpaceTypeName: string;
    addressLine: string;
    city: string;
    isActive: boolean;
    isVerified: boolean;
    createdDate: string;

    totalRooms: number;
    imageUrls: string[];

    rooms: Room[];
}

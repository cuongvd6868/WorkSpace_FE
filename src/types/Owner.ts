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
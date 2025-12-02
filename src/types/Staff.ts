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

export type GuestDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export type CustomerDetails = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export type BookingDetails = {
  workSpaceRoomID: number;
  startTimeUtc: string; // Định dạng "YYYY-MM-DDTHH:mm:ssZ"
  endTimeUtc: string;   // Định dạng "YYYY-MM-DDTHH:mm:ssZ"
  numberOfParticipants: number;
  specialRequests: string;
  totalPrice: number;
  taxAmount: number;
  serviceFee: number;
  finalAmount: number;
}

export type CreateBookingRequestForGuest = {
  guestDetails: GuestDetails;
  bookingDetails: BookingDetails;
}

export interface CreateBookingRequestForCustomer {
  customerDetails: CustomerDetails;
  bookingDetails: BookingDetails;
}

export interface CreateBookingResponse {
  bookingId: number;
  message: string;
}

export interface CreatePaymentUrlResponse {
  url: string; 
}

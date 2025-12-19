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

export type SelectedService = {
  serviceId: number;
  quantity: number;
};

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
  services?: SelectedService[];
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

export type PaymentSuccessResponse = {
  bookingCode: string;
  startTimeUtc: string;
  endTimeUtc: string;
  finalAmount: number;
  title: string;
}

export type workSpaceRoom = {
  title: string,
  description: string
}

export type BookingListType = {
  id: number,
  bookingCode: string,
  workSpaceRoomId: number,
  startTimeUtc: string,
  endTimeUtc: string,
  numberOfParticipants: number,
  specialRequests: string,
  finalAmount: number,
  bookingStatusId: number,
  isReviewed: boolean,
  paymentMethodID: number,
  workSpaceRoom: workSpaceRoom
}

export interface ReviewData {
  rating: number; // Tương ứng với 'rating': integer(int32) trong API
  comment: string; // Tương ứng với 'comment': "string" trong API
}
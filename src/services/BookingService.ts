import axios from 'axios';
import {
  CreateBookingRequestForGuest,
  CreatePaymentUrlResponse,
  CreateBookingRequestForCustomer
} from '~/types/Booking'; 
import { API_BASE_URL } from '~/utils/API';
import { handleError } from '~/utils/handleError';

export const GetBookingByBookingCode = async (bookingCode: any) => {
  try {
      const response = await axios.get(`${API_BASE_URL}v1/booking/booking-code?bookingCode=${bookingCode}`);
      return response.data;
  } catch (error) {
      handleError(error);
      throw error;       
  }
}

export const createBookingGuest = async (bookingData: CreateBookingRequestForGuest) => {
  try {
    const response = await axios.post(`${API_BASE_URL}v1/booking/guest`, bookingData);
    return response.data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

export const createBookingCustomer = async (bookingData: CreateBookingRequestForCustomer) => {
  try {
    const response = await axios.post(`${API_BASE_URL}v1/booking/customer`, bookingData);
    return response.data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

export const createPaymentUrl = async (bookingId: number): Promise<string> => {
  try {
    console.log('Creating payment URL for booking:', bookingId);

    const response = await axios.get<CreatePaymentUrlResponse>(
      `${API_BASE_URL}v1/vnpay/create-payment-url?bookingId=${bookingId}`
    );

    if (!response.data?.url) {
      console.warn('Unexpected response structure:', response.data);
      throw new Error('Cấu trúc phản hồi từ máy chủ không hợp lệ');
    }

    return response.data.url;
  } catch (error: any) {
    console.error('Lỗi tạo URL thanh toán:', error?.response?.data || error.message);
    throw new Error(error?.response?.data?.message || 'Không thể tạo URL thanh toán. Vui lòng thử lại sau.');
  }
};

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { WorkSpaceRoom } from '~/types/WorkSpaceRoom'; // Đảm bảo import đúng WorkSpaceRoom

// Định nghĩa kiểu dữ liệu cho trạng thái đặt phòng
export interface BookingData {
    room: WorkSpaceRoom;
    startTimeUtc: string;
    endTimeUtc: string;
    numberOfParticipants: number;
    totalAmount: number; // Tổng tiền tính toán
    totalHours: number; // Tổng số giờ thuê
    // THÊM CÁC TRƯỜNG DỮ LIỆU CẦN THIẾT TỪ WORKSPACE
    workspaceAddressLine: string;
    workspaceName: string;       
}

// Định nghĩa kiểu dữ liệu cho Context
interface BookingContextType {
    bookingData: BookingData | null;
    setBookingData: (data: BookingData | null) => void;
    clearBookingData: () => void; // Hàm xóa dữ liệu
}

// Khởi tạo Context
const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Hook tùy chỉnh để sử dụng Context
export const useBooking = () => {
    const context = useContext(BookingContext);
    if (context === undefined) {
        throw new Error('useBooking must be used within a BookingProvider');
    }
    return context;
};

// Provider Component
interface BookingProviderProps {
    children: ReactNode;
}

export const BookingProvider: React.FC<BookingProviderProps> = ({ children }) => {
    const [bookingData, setBookingData] = useState<BookingData | null>(null);

    const clearBookingData = () => {
        setBookingData(null);
    };

    return (
        <BookingContext.Provider value={{ bookingData, setBookingData, clearBookingData }}>
            {children}
        </BookingContext.Provider>
    );
};
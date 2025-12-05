import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from './BookingTodayListTable.module.scss'; 
import { getAllBookingToday } from "~/services/StaffService";
import { BookingTodayList } from "~/types/Staff";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarCheck, faSpinner } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

const BookingTodayListTable: React.FC = () => {
    const [bookings, setBookings] = useState<BookingTodayList[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setIsLoading(true);
                // Giả định API trả về danh sách đã được sắp xếp theo thời gian bắt đầu
                const data: BookingTodayList[] = await getAllBookingToday(); 
                setBookings(data);
                setError(null);
            } catch (err) {
                console.error("Lỗi khi fetch booking hôm nay:", err);
                setError("Không thể tải dữ liệu Booking trong ngày. Vui lòng thử lại.");
                setBookings([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookings();
    }, []);

    // Hàm chuyển đổi thời gian UTC sang định dạng giờ địa phương dễ đọc
    const formatTime = (utcString: string): string => {
        try {
            const date = new Date(utcString);
            // Định dạng giờ:phút (24h)
            return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return "N/A";
        }
    };
    
    // Hàm định dạng tiền tệ
    const formatCurrency = (amount: number): string => {
        return amount.toLocaleString('vi-VN') + ' VND';
    }

    // --- RENDER LOGIC ---

    if (isLoading) {
        return <div className={cx('loading')}><FontAwesomeIcon icon={faSpinner} spin /> Đang tải danh sách Booking hôm nay...</div>;
    }

    if (error) {
        return <div className={cx('error-message')}>{error}</div>;
    }

    if (bookings.length === 0) {
        return <div className={cx('no-data')}><FontAwesomeIcon icon={faCalendarCheck} /> Không có Booking nào đang hoặc sẽ diễn ra trong ngày hôm nay.</div>;
    }

    return (
        <div className={cx('table-container')}>
            <table className={cx('booking-table')}>
                <thead>
                    <tr>
                        <th style={{ width: '10%' }}>Mã Booking</th>
                        <th style={{ width: '25%' }}>Workspace / Phòng</th>
                        <th style={{ width: '15%' }}>Khách Hàng</th>
                        <th style={{ width: '18%' }}>Email</th>
                        <th style={{ width: '8%' }}>Bắt Đầu</th>
                        <th style={{ width: '8%' }}>Kết Thúc</th>
                        <th style={{ width: '8%' }} className={cx('center-text')}>Số Người</th>
                        <th style={{ width: '10%' }} className={cx('final-amount')}>Tổng Tiền</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map((booking) => (
                        <tr key={booking.id}>
                            <td className={cx('booking-code')}>{booking.bookingCode}</td>
                            <td className={cx('workspace-title')}>{booking.workSpaceRoomTitle}</td>
                            <td>{booking.customerName}</td>
                            <td>{booking.customerEmail}</td>
                            <td className={cx('time-cell')}>{formatTime(booking.startTimeUtc)}</td>
                            <td className={cx('time-cell')}>{formatTime(booking.endTimeUtc)}</td>
                            <td className={cx('center-text')}>{booking.numberOfParticipants}</td>
                            <td className={cx('final-amount')}>{formatCurrency(booking.finalAmount)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default BookingTodayListTable;
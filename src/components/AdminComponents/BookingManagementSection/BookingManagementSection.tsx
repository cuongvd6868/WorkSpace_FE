import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faEye, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames/bind';
import styles from './BookingManagementSection.module.scss'; 
import { getAllBookings } from '~/services/AdminService'; 
import { Booking } from '~/types/Admin'; 

const cx = classNames.bind(styles);

const formatDate = (isoString: string | null): string => {
    if (!isoString) return 'N/A';
    try {
        // Định dạng lại cho dễ đọc (ví dụ: dd/MM/yyyy HH:mm)
        const date = new Date(isoString);
        return date.toLocaleString('vi-VN', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit',
            timeZoneName: 'short'
        });
    } catch {
        return 'Invalid Date';
    }
};

const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};


const BookingManagementSection: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // --- Logic Tải Dữ liệu THẬT ---
    const fetchBookings = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // GỌI API THẬT
            const data = await getAllBookings(); 
            if (Array.isArray(data)) {
                setBookings(data);
            } else {
                setBookings([]);
                toast.warn('Dữ liệu Booking trả về không đúng định dạng.');
            }
        } catch (err: any) {
            console.error("Lỗi khi tải booking:", err);
            setError('Không thể tải dữ liệu đặt chỗ. Vui lòng kiểm tra Token và thử lại.');
            toast.error(err.message || 'Lỗi kết nối API Booking.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    // --- Render Bảng Booking ---
    const renderBookingTable = () => {
        if (isLoading) {
            return (
                <p className={cx('loading-message')}>
                    <FontAwesomeIcon icon={faSpinner} spin /> Đang tải danh sách Booking...
                </p>
            );
        }
        
        if (error) {
            return (
                <p className={cx('error-message')}>
                    <FontAwesomeIcon icon={faTimesCircle} /> {error}
                </p>
            );
        }
        
        if (bookings.length === 0) {
            return <p className={cx('empty-message')}>Chưa có Booking nào được tìm thấy.</p>;
        }

        return (
            <div className={cx('table-container')}>
                <table className={cx('booking-table')}>
                    <thead>
                        <tr>
                            <th>Mã Booking</th>
                            <th>Khách hàng</th>
                            <th>Room/Workspace</th>
                            <th>Thời gian</th>
                            <th>Trạng thái</th>
                            <th>Tổng tiền</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((booking) => (
                            <tr key={booking.id} className={cx('table-row')}>
                                <td className={cx('booking-code')}>{booking.bookingCode}</td>
                                <td>
                                    {/* Hiển thị "Guest" nếu customerName là null */}
                                    <span className={cx({ 'is-guest': !booking.customerName })}>
                                        {booking.customerName || `Guest (${booking.customerEmail || 'N/A'})`}
                                    </span>
                                </td>
                                <td>{booking.workSpaceRoomTitle}</td>
                                <td className={cx('date-range')}>
                                    {formatDate(booking.startTimeUtc)}
                                    <br />
                                    <span className={cx('separator')}>đến</span>
                                    <br />
                                    {formatDate(booking.endTimeUtc)}
                                </td>
                                <td className={cx('status-cell', `status-${booking.bookingStatusName.replace(/\s/g, '')}`)}>
                                    {booking.bookingStatusName}
                                </td>
                                <td className={cx('final-amount')}>
                                    {formatCurrency(booking.finalAmount, booking.currency)}
                                </td>
                                <td className={cx('action-btns')}>
                                    <button 
                                        className={cx('view-btn')}
                                        title="Xem chi tiết Booking"
                                    >
                                        <FontAwesomeIcon icon={faEye} />
                                    </button>
                                    {/* Nút cập nhật trạng thái sẽ được thêm vào đây khi có API */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className={cx('booking-section')}>
            {/* Thanh control (ví dụ: nút Filter, Search - có thể thêm sau) */}
            <div className={cx('header-control')}>
                <button 
                    onClick={fetchBookings} 
                    className={cx('refresh-btn')}
                    disabled={isLoading}
                >
                    <FontAwesomeIcon icon={faSpinner} spin={isLoading} /> Tải lại
                </button>
            </div>
            
            {renderBookingTable()}
        </div>
    );
};

export default BookingManagementSection;
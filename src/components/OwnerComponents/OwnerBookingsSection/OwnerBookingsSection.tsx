// src/components/OwnerDashboard/OwnerBookingsSection.tsx
import React, { useState, useEffect, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './OwnerBookingsSection.module.scss'; // Thay thế bằng đường dẫn SCSS của bạn
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faArrowRight, faDoorOpen, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
// Import types và service methods của bạn
import { BookingsOwnerView } from '~/types/Owner'; 
import { 
    getAllBookingsOwnerView, 
    getPendingBookingsOwnerView,
    confirmBookingOwner,
    cancelBookingOwner,
    checkInBookingOwner,
    checkOutBookingOwner
} from '~/services/OwnerService'; 

const cx = classNames.bind(styles);

// Định nghĩa các trạng thái lọc
enum BookingFilter {
    ALL = 'Tất Cả',
    PENDING = 'Đang Chờ Duyệt',
    UPCOMING = 'Sắp Tới',
    COMPLETED = 'Đã Hoàn Thành',
    CANCELLED = 'Đã Hủy',
}

const OwnerBookingsSection: React.FC = () => {
    const [bookings, setBookings] = useState<BookingsOwnerView[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<BookingFilter>(BookingFilter.ALL);

    // Hàm fetch dữ liệu chính
    const fetchBookings = useCallback(async () => {
        setIsLoading(true);
        try {
            let data: BookingsOwnerView[];
            if (activeFilter === BookingFilter.PENDING) {
                // Giả sử service getPendingBookingsOwnerView trả về mảng
                data = await getPendingBookingsOwnerView(); 
            } else {
                // Giả sử service getAllBookingsOwnerView trả về mảng
                data = await getAllBookingsOwnerView(); 
            }
            
            // Xử lý lọc client-side cho các trạng thái khác
            const filteredData = data.filter(booking => {
                const status = booking.bookingStatusName.toUpperCase();
                switch (activeFilter) {
                    case BookingFilter.PENDING:
                        return status === 'PENDING';
                    case BookingFilter.UPCOMING:
                        // UPCOMING là Confirmed và đang chờ Check-in HOẶC đã Check-in
                        return status === 'CONFIRMED' || status === 'CHECKED_IN' || status === 'CHECKEDIN';
                    case BookingFilter.COMPLETED:
                        return status === 'COMPLETED';
                    case BookingFilter.CANCELLED:
                        return status.includes('CANCEL') || status.includes('REJECTED');
                    default:
                        return true;
                }
            });

            setBookings(filteredData);

        } catch (error) {
            toast.error("Lỗi khi tải danh sách Booking.");
        } finally {
            setIsLoading(false);
        }
    }, [activeFilter]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);


    // Hàm xử lý hành động (Confirm/Cancel/Check-in/out)
    const handleAction = async (bookingId: number, action: 'confirm' | 'cancel' | 'checkin' | 'checkout') => {
        // 1. Dùng window.confirm để xác nhận hành động
        if (!window.confirm(`Bạn có chắc chắn muốn ${action.toUpperCase()} Booking #${bookingId} không?`)) {
            return;
        }

        try {
            let actionFunction: (id: number, reason?: string) => Promise<any>;
            let successMessage = "";
            
            switch (action) {
                case 'confirm':
                    actionFunction = confirmBookingOwner;
                    successMessage = "Booking đã được **XÁC NHẬN** thành công!";
                    break;
                case 'cancel':
                    // Dùng prompt để lấy lý do hủy
                    const reason = prompt("Vui lòng nhập lý do hủy:");
                    if (!reason || reason.trim() === "") {
                        toast.info("Hành động hủy đã bị gián đoạn hoặc lý do trống.");
                        return;
                    }
                    actionFunction = (id) => cancelBookingOwner(id, reason);
                    successMessage = "Booking đã được **HỦY** thành công!";
                    break;
                case 'checkin':
                    actionFunction = checkInBookingOwner;
                    successMessage = "Khách hàng đã **CHECK-IN**!";
                    break;
                case 'checkout':
                    actionFunction = checkOutBookingOwner;
                    successMessage = "Khách hàng đã **CHECK-OUT** và hoàn thành giao dịch!";
                    break;
                default:
                    return;
            }

            // Gọi API
            await actionFunction(bookingId as number);
            toast.success(successMessage);
            fetchBookings(); // Tải lại dữ liệu sau khi hành động thành công

        } catch (error) {
            toast.error(`Thực hiện hành động ${action} thất bại.`);
        }
    };
    
    // Hàm render các nút hành động (ĐÃ SỬA: Thêm CHECKEDIN)
    const renderActions = (booking: BookingsOwnerView) => {
        const status = booking.bookingStatusName.toUpperCase();

        switch (status) {
            case 'PENDING':
                return (
                    <>
                        <button className={cx('action-btn', 'confirm')} onClick={() => handleAction(booking.id, 'confirm')}>
                            <FontAwesomeIcon icon={faCheckCircle} /> Duyệt
                        </button>
                        <button className={cx('action-btn', 'cancel')} onClick={() => handleAction(booking.id, 'cancel')}>
                            <FontAwesomeIcon icon={faTimesCircle} /> Hủy
                        </button>
                    </>
                );
            case 'CONFIRMED':
                return (
                    <>
                        <button className={cx('action-btn', 'checkin')} onClick={() => handleAction(booking.id, 'checkin')}>
                            <FontAwesomeIcon icon={faDoorOpen} /> Check-in
                        </button>
                        <button className={cx('action-btn', 'cancel')} onClick={() => handleAction(booking.id, 'cancel')}>
                            Hủy
                        </button>
                    </>
                );
            case 'CHECKED_IN':
            case 'CHECKEDIN': // Thêm case này để khớp với dữ liệu API của bạn
                return (
                    <button className={cx('action-btn', 'checkout')} onClick={() => handleAction(booking.id, 'checkout')}>
                        <FontAwesomeIcon icon={faArrowRight} /> Check-out
                    </button>
                );
            default:
                // Hiển thị nhãn cho các trạng thái đã kết thúc (COMPLETED, CANCELLED, REJECTED, v.v.)
                return <span className={cx('status-label', status.toLowerCase())}>{status}</span>;
        }
    };

    return (
        <div className={cx('bookings-management')}>
            
            {/* Thanh Filter/Tabs */}
            <div className={cx('booking-filters')}>
                {Object.values(BookingFilter).map(filter => (
                    <button
                        key={filter}
                        className={cx('filter-btn', { active: activeFilter === filter })}
                        onClick={() => setActiveFilter(filter)}
                        disabled={isLoading}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className={cx('loading-state')}>
                    <FontAwesomeIcon icon={faSpinner} spin /> Đang tải dữ liệu bookings...
                </div>
            ) : (
                <div className={cx('table-wrapper')}>
                    {bookings.length === 0 ? (
                        <p className={cx('no-data')}>Không có Booking nào ở trạng thái **{activeFilter}**.</p>
                    ) : (
                        <table className={cx('booking-table')}>
                            <thead>
                                <tr>
                                    <th>Mã Booking</th>
                                    <th>Khách Hàng</th>
                                    <th>Workspace</th>
                                    <th>Thời Gian Thuê</th>
                                    <th>Tổng Tiền</th>
                                    <th>Trạng Thái</th>
                                    <th>Hành Động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((booking) => (
                                    <tr key={booking.id}>
                                        <td>**{booking.bookingCode}**</td>
                                        <td>{booking.customerName}</td>
                                        <td>{booking.workSpaceRoomTitle}</td>
                                        <td>
                                            {new Date(booking.startTimeUtc).toLocaleString()}
                                            <FontAwesomeIcon icon={faArrowRight} className={cx('time-arrow')}/>
                                            {new Date(booking.endTimeUtc).toLocaleString()}
                                        </td>
                                        <td>{booking.finalAmount.toLocaleString('vi-VN')} VND</td>
                                        <td>
                                            <span className={cx('status-label', booking.bookingStatusName.toLowerCase())}>
                                                {booking.bookingStatusName}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={cx('action-cell')}>
                                                {renderActions(booking)}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}

export default OwnerBookingsSection;
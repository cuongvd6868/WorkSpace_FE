import React, { useState, useEffect, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './OwnerBookingsSection.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faArrowRight, faDoorOpen, faSpinner, faClipboardCheck } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { BookingsOwnerView } from '~/types/Owner'; 
import { 
    getAllBookingsOwnerView, 
    confirmBookingOwner,
    cancelBookingOwner,
    checkInBookingOwner,
    checkOutBookingOwner,
    completeBookingOwner 
} from '~/services/OwnerService'; 

const cx = classNames.bind(styles);

enum BookingFilter {
    ALL = 'Tất Cả',
    PENDING = 'Đang Chờ Duyệt',
    UPCOMING = 'Sắp Tới',
    COMPLETED = 'Đã Hoàn Thành',
    CANCELLED = 'Đã Hủy',
}

// Định nghĩa các trạng thái chuẩn hóa để dễ kiểm soát hơn
const Status = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    CHECKED_IN: 'CHECKED_IN',
    CHECKEDIN: 'CHECKEDIN', // Giữ lại cả hai nếu backend không nhất quán
    CHECKED_OUT: 'CHECKED_OUT',
    CHECKEDOUT: 'CHECKEDOUT', // Giữ lại cả hai nếu backend không nhất quán
    COMPLETED: 'COMPLETED',
    CANCEL: 'CANCEL', // Chỉ kiểm tra 'CANCEL' và 'REJECTED'
    REJECTED: 'REJECTED',
};

const OwnerBookingsSection: React.FC = () => {
    const [bookings, setBookings] = useState<BookingsOwnerView[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<BookingFilter>(BookingFilter.ALL);

    // Bọc handleAction trong useCallback
    const handleAction = useCallback(async (bookingId: number, action: 'confirm' | 'cancel' | 'checkin' | 'checkout' | 'complete') => {
        
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
                    successMessage = "Khách hàng đã **CHECK-OUT** (Đang chờ Hoàn tất)!";
                    break;
                case 'complete':
                    actionFunction = completeBookingOwner;
                    successMessage = "Booking đã được **HOÀN TẤT** thủ công!";
                    break;
                default:
                    return;
            }

            // Gọi API
            await actionFunction(bookingId as number);
            toast.success(successMessage);

        } catch (error) {
            console.error(`Error performing action ${action} for booking ${bookingId}:`, error);
            toast.error(`Thực hiện hành động ${action} thất bại.`);
        }
        

        await fetchBookings(); 
    }, []); 

    
    // Bọc fetchBookings trong useCallback và đưa dependencies vào
    const fetchBookings = useCallback(async () => {
        setIsLoading(true);
        try {
            let data: BookingsOwnerView[] = await getAllBookingsOwnerView(); 
            
            const filteredData = data.filter(booking => {
                const status = booking.bookingStatusName.toUpperCase();

                switch (activeFilter) {
                    case BookingFilter.PENDING:
                        return status === Status.PENDING;
                    case BookingFilter.UPCOMING:
                        // Lỗi tiềm ẩn đã được sửa: loại bỏ CHECKED_OUT khỏi UPCOMING
                        return (
                            status === Status.CONFIRMED || 
                            status === Status.CHECKED_IN ||
                            status === Status.CHECKEDIN // Giữ lại CHECKEDIN nếu cần
                        );
                    case BookingFilter.COMPLETED:
                        return status === Status.COMPLETED;
                    case BookingFilter.CANCELLED:
                        // Sử dụng includes để bao gồm CANCELED/REJECTED
                        return status.includes(Status.CANCEL) || status.includes(Status.REJECTED);
                    default:
                        return true;
                }
            });

            setBookings(filteredData);

        } catch (error) {
            console.error("Lỗi khi tải danh sách Booking:", error);
            toast.error("Lỗi khi tải danh sách Booking.");
        } finally {
            setIsLoading(false);
        }
    }, [activeFilter]); // Dependency chính là activeFilter

    // Hook để gọi fetchBookings mỗi khi activeFilter thay đổi hoặc lần đầu tiên component mount
    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]); // Đảm bảo fetchBookings là dependency


    // Bổ sung: Định nghĩa lại handleAction sau khi fetchBookings đã được định nghĩa
    // **Chú ý quan trọng:** Để `handleAction` hoạt động, ta cần định nghĩa lại nó 
    // sau khi `fetchBookings` đã được định nghĩa, HOẶC làm cho `fetchBookings` 
    // không có dependency. Tốt nhất là thêm `fetchBookings` vào dependency của `handleAction`.
    // Tôi sẽ sửa lại `handleAction` để lấy `fetchBookings` làm dependency:

    // Khai báo lại handleAction với dependency:
    const handleActionWithDep = useCallback(async (bookingId: number, action: 'confirm' | 'cancel' | 'checkin' | 'checkout' | 'complete') => {
        
        if (!window.confirm(`Bạn có chắc chắn muốn ${action.toUpperCase()} Booking #${bookingId} không?`)) {
            return;
        }

        try {
            let actionFunction: (id: number, reason?: string) => Promise<any>;
            let successMessage = "";
            
            switch (action) {
                // ... (giữ nguyên logic switch case)
                case 'confirm':
                    actionFunction = confirmBookingOwner;
                    successMessage = "Booking đã được **XÁC NHẬN** thành công!";
                    break;
                case 'cancel':
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
                    successMessage = "Khách hàng đã **CHECK-OUT** (Đang chờ Hoàn tất)!";
                    break;
                case 'complete':
                    actionFunction = completeBookingOwner;
                    successMessage = "Booking đã được **HOÀN TẤT** thủ công!";
                    break;
                default:
                    return;
            }

            await actionFunction(bookingId as number);
            toast.success(successMessage);
            await fetchBookings(); // Tải lại dữ liệu sau khi hành động thành công

        } catch (error) {
            console.error(`Error performing action ${action} for booking ${bookingId}:`, error);
            toast.error(`Thực hiện hành động ${action} thất bại.`);
        }
    }, [fetchBookings]); // <-- Dependency quan trọng

    
    // Hàm render các nút hành động
    const renderActions = (booking: BookingsOwnerView) => {
        const status = booking.bookingStatusName.toUpperCase();

        switch (status) {
            case Status.PENDING:
                return (
                    <>
                        <button className={cx('action-btn', 'confirm')} onClick={() => handleActionWithDep(booking.id, 'confirm')}>
                            <FontAwesomeIcon icon={faCheckCircle} /> Duyệt
                        </button>
                        <button className={cx('action-btn', 'cancel')} onClick={() => handleActionWithDep(booking.id, 'cancel')}>
                            <FontAwesomeIcon icon={faTimesCircle} /> Hủy
                        </button>
                    </>
                );
            case Status.CONFIRMED:
                return (
                    <>
                        <button className={cx('action-btn', 'checkin')} onClick={() => handleActionWithDep(booking.id, 'checkin')}>
                            <FontAwesomeIcon icon={faDoorOpen} /> Check-in
                        </button>
                        <button className={cx('action-btn', 'cancel')} onClick={() => handleActionWithDep(booking.id, 'cancel')}>
                            Hủy
                        </button>
                    </>
                );
            case Status.CHECKED_IN:
            case Status.CHECKEDIN: 
                return (
                    <>
                        <button className={cx('action-btn', 'checkout')} onClick={() => handleActionWithDep(booking.id, 'checkout')}>
                            <FontAwesomeIcon icon={faArrowRight} /> Check-out
                        </button>
                        {/* <button className={cx('action-btn', 'complete')} onClick={() => handleActionWithDep(booking.id, 'complete')}>
                            <FontAwesomeIcon icon={faClipboardCheck} /> Hoàn tất (Thủ công)
                        </button> */}
                    </>
                );
            case Status.CHECKED_OUT: 
            case Status.CHECKEDOUT: 
                return (
                    <button className={cx('action-btn', 'complete')} onClick={() => handleActionWithDep(booking.id, 'complete')}>
                        <FontAwesomeIcon icon={faClipboardCheck} /> Hoàn tất giao dịch
                    </button>
                );
            default:
                return <span className={cx('status-label', status.toLowerCase())}>{booking.bookingStatusName}</span>;
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
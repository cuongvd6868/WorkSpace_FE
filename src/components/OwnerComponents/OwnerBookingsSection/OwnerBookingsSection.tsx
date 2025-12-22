import React, { useState, useEffect, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './OwnerBookingsSection.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCheckCircle, faTimesCircle, faArrowRight, 
    faDoorOpen, faSpinner, faClipboardCheck, faCommentDots,
    faCalendarAlt, faUser, faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
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

const Status = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    CHECKED_IN: 'CHECKED_IN',
    CHECKEDIN: 'CHECKEDIN',
    CHECKED_OUT: 'CHECKED_OUT',
    CHECKEDOUT: 'CHECKEDOUT',
    COMPLETED: 'COMPLETED',
    CANCEL: 'CANCEL',
    REJECTED: 'REJECTED',
};

const OwnerBookingsSection: React.FC = () => {
    const [bookings, setBookings] = useState<BookingsOwnerView[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<BookingFilter>(BookingFilter.ALL);
    
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);

    const fetchBookings = useCallback(async () => {
        setIsLoading(true);
        try {
            const data: BookingsOwnerView[] = await getAllBookingsOwnerView(); 
            const filteredData = data.filter(booking => {
                const status = booking.bookingStatusName.toUpperCase();
                switch (activeFilter) {
                    case BookingFilter.PENDING: return status === Status.PENDING;
                    case BookingFilter.UPCOMING:
                        return [Status.CONFIRMED, Status.CHECKED_IN, Status.CHECKEDIN].includes(status);
                    case BookingFilter.COMPLETED: return status === Status.COMPLETED;
                    case BookingFilter.CANCELLED:
                        return status.includes(Status.CANCEL) || status.includes(Status.REJECTED);
                    default: return true;
                }
            });
            setBookings(filteredData);
        } catch (error) {
            toast.error("Không thể tải danh sách đặt phòng.");
        } finally {
            setIsLoading(false);
        }
    }, [activeFilter]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const handleAction = useCallback(async (bookingId: number, action: string, reason?: string) => {
        try {
            if (action === 'confirm') await confirmBookingOwner(bookingId);
            else if (action === 'checkin') await checkInBookingOwner(bookingId);
            else if (action === 'checkout') await checkOutBookingOwner(bookingId);
            else if (action === 'complete') await completeBookingOwner(bookingId);
            else if (action === 'cancel' && reason) await cancelBookingOwner(bookingId, reason);
            
            toast.success(`Hành động thực hiện thành công!`);
            await fetchBookings();
        } catch (error) {
            toast.error(`Có lỗi xảy ra, vui lòng thử lại.`);
        }
    }, [fetchBookings]);

    const handleConfirmCancel = () => {
        if (!cancelReason.trim()) {
            toast.warning("Vui lòng nhập lý do cụ thể.");
            return;
        }
        if (selectedBookingId) {
            handleAction(selectedBookingId, 'cancel', cancelReason);
            setIsCancelModalOpen(false);
        }
    };

    const renderActions = (booking: BookingsOwnerView) => {
        const status = booking.bookingStatusName.toUpperCase();
        const now = new Date();
        const startTime = new Date(booking.startTimeUtc);
        const isTimeStarted = now >= startTime;

        switch (status) {
            case Status.PENDING:
                return (
                    <div className={cx('action-group')}>
                        <button className={cx('btn-ui', 'btn-primary')} onClick={() => handleAction(booking.id, 'confirm')}>
                            <FontAwesomeIcon icon={faCheckCircle} /> Duyệt
                        </button>
                        <button className={cx('btn-ui', 'btn-outline-danger')} onClick={() => { setSelectedBookingId(booking.id); setIsCancelModalOpen(true); }}>
                            Từ chối
                        </button>
                    </div>
                );
            case Status.CONFIRMED:
                return (
                    <div className={cx('action-group')}>
                        <button 
                            className={cx('btn-ui', 'btn-success', { 'is-frozen': !isTimeStarted })} 
                            onClick={() => isTimeStarted && handleAction(booking.id, 'checkin')}
                            disabled={!isTimeStarted}
                        >
                            <FontAwesomeIcon icon={faDoorOpen} /> Check-in
                        </button>
                        <button className={cx('btn-link-danger')} onClick={() => { setSelectedBookingId(booking.id); setIsCancelModalOpen(true); }}>
                            Hủy đặt
                        </button>
                    </div>
                );
            case Status.CHECKED_IN:
            case Status.CHECKEDIN: 
                return (
                    <button className={cx('btn-ui', 'btn-warning')} onClick={() => handleAction(booking.id, 'checkout')}>
                        <FontAwesomeIcon icon={faArrowRight} /> Trả phòng
                    </button>
                );
            case Status.CHECKED_OUT: 
            case Status.CHECKEDOUT: 
                return (
                    <button className={cx('btn-ui', 'btn-dark')} onClick={() => handleAction(booking.id, 'complete')}>
                        <FontAwesomeIcon icon={faClipboardCheck} /> Hoàn tất
                    </button>
                );
            default: return <span className={cx('text-muted')}>N/A</span>;
        }
    };

    return (
        <div className={cx('section-container')}>
            <header className={cx('section-header')}>
                <div className={cx('header-info')}>
                    <h2>Quản lý Đặt chỗ</h2>
                    <p>Theo dõi và điều phối các lịch thuê tại cơ sở của bạn</p>
                </div>
                <div className={cx('filter-bar')}>
                    {Object.values(BookingFilter).map(f => (
                        <button 
                            key={f}
                            className={cx('tab-item', { active: activeFilter === f })}
                            onClick={() => setActiveFilter(f)}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </header>

            <div className={cx('content-card')}>
                {isLoading ? (
                    <div className={cx('loading-wrapper')}>
                        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                        <p>Đang đồng bộ dữ liệu...</p>
                    </div>
                ) : (
                    <div className={cx('table-responsive')}>
                        <table className={cx('custom-table')}>
                            <thead>
                                <tr>
                                    <th>Thông tin đặt</th>
                                    <th>Không gian</th>
                                    <th>Lịch trình</th>
                                    <th>Thanh toán</th>
                                    <th>Trạng thái</th>
                                    <th className={cx('text-center')}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.length > 0 ? bookings.map((b) => (
                                    <tr key={b.id}>
                                        <td>
                                            <div className={cx('customer-info')}>
                                                <span className={cx('booking-id')}>#{b.bookingCode}</span>
                                                <span className={cx('customer-name')}><FontAwesomeIcon icon={faUser} /> {b.customerName}</span>
                                            </div>
                                        </td>
                                        <td><span className={cx('room-tag')}>{b.workSpaceRoomTitle}</span></td>
                                        <td>
                                            <div className={cx('time-display')}>
                                                <small><FontAwesomeIcon icon={faCalendarAlt} /> Bắt đầu:</small>
                                                <span>{new Date(b.startTimeUtc).toLocaleString('vi-VN')}</span>
                                                <small className={cx('mt-1')}>Kết thúc:</small>
                                                <span>{new Date(b.endTimeUtc).toLocaleString('vi-VN')}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={cx('amount-text')}>{b.finalAmount.toLocaleString('vi-VN')}đ</span>
                                        </td>
                                        <td>
                                            <div className={cx('status-badge', b.bookingStatusName.toLowerCase())}>
                                                {b.bookingStatusName}
                                            </div>
                                        </td>
                                        <td>
                                            <div className={cx('action-wrapper')}>
                                                {renderActions(b)}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className={cx('empty-state')}>
                                            Không có dữ liệu hiển thị.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {isCancelModalOpen && (
                <div className={cx('modal-backdrop')}>
                    <div className={cx('modal-glass')}>
                        <div className={cx('modal-header')}>
                            <div className={cx('icon-circle')}><FontAwesomeIcon icon={faExclamationTriangle} /></div>
                            <div>
                                <h3>Xác nhận hủy yêu cầu</h3>
                                <p>Hành động này không thể hoàn tác</p>
                            </div>
                        </div>
                        <div className={cx('modal-body')}>
                            <label>Lý do hủy (gửi đến khách hàng):</label>
                            <textarea 
                                autoFocus
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Vui lòng nhập lý do cụ thể để khách hàng thông cảm..."
                            />
                        </div>
                        <div className={cx('modal-actions')}>
                            <button className={cx('btn-cancel')} onClick={() => setIsCancelModalOpen(false)}>Quay lại</button>
                            <button className={cx('btn-submit')} onClick={handleConfirmCancel}>Xác nhận hủy bỏ</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default OwnerBookingsSection;
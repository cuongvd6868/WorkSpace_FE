import React, { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from './BookingList.module.scss';
import { GetBookingsByUser } from "~/services/BookingService"; 
import { BookingListType } from "~/types/Booking";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardList, faUser } from "@fortawesome/free-solid-svg-icons";

const cx = classNames.bind(styles);

const BOOKING_STATUS_MAP = {
    3: { description: 'Đang chờ xác nhận', className: 'pending' },
    4: { description: 'Đã xác nhận', className: 'confirmed' },
    5: { description: 'Đã check-in', className: 'checked-in' },
    6: { description: 'Đã check-out', className: 'checked-out' },
    7: { description: 'Đã hủy', className: 'cancelled' },
    8: { description: 'Không đến', className: 'no-show' },
    9: { description: 'Đã thanh toán', className: 'completed' },
    10: { description: 'Thanh toán thất bại', className: 'failed' },
};

type BookingStatusKey = keyof typeof BOOKING_STATUS_MAP;

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
        day: date.getDate().toString().padStart(2, '0'),
        month: date.toLocaleDateString('vi-VN', { month: 'short' }),
        time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
};


const BookingList: React.FC = () => {
    const [bookings, setBookings] = useState<BookingListType[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBookings = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await GetBookingsByUser();
                setBookings(data);
            } catch (err) {
                setError("Không thể tải danh sách đặt chỗ. Vui lòng kiểm tra kết nối.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookings();
    }, []);

    // ------------------ HIỂN THỊ CÁC TRẠNG THÁI ------------------

    if (isLoading) {
        return (
            <div className={cx('wrapper')}>
                <div className={cx('page-header')}>Danh sách đặt chỗ</div>
                <p className={cx('message-status', 'loading')}>⏳ Đang tải dữ liệu đặt chỗ của bạn...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={cx('wrapper')}>
                <div className={cx('page-header')}>Danh sách đặt chỗ</div>
                <p className={cx('message-status', 'error')}>⚠️ Lỗi: {error}</p>
            </div>
        );
    }
    
    if (bookings.length === 0) {
        return (
            <div className={cx('wrapper')}>
                <div className={cx('page-header')}>Danh sách đặt chỗ</div>
                <p className={cx('message-status')}>Bạn chưa có bất kỳ đặt chỗ nào.</p>
            </div>
        );
    }

    // ------------------ HIỂN THỊ DANH SÁCH CHUYÊN NGHIỆP ------------------

    return (
        <div className={cx('wrapper')}>
            <div className={cx('page-header_container')}>
                <FontAwesomeIcon icon={faClipboardList} className={cx('page-header_icon')} />
                <div className={cx('page-header')}>Danh sách đặt chỗ</div>
            </div>
            
            <div className={cx('booking-list-grid')}>
                {bookings.map((booking) => {
                    const start = formatDate(booking.startTimeUtc);
                    const end = formatDate(booking.endTimeUtc);
                    const statusKey = String(booking.bookingStatusId) as unknown as BookingStatusKey;
                    
                    const statusInfo = BOOKING_STATUS_MAP[statusKey] || 
                                       { description: 'Không rõ', className: 'unknown' };

                    return (
                        <div key={booking.bookingCode} className={cx('booking-card', statusInfo.className)}>
                            
                            {/* KHỐI NGÀY/THỜI GIAN (Calendar Left) */}
                            <div className={cx('card-time-date-block')}>
                                <div className={cx('date-display')}>
                                    <span className={cx('date-day')}>{start.day}</span>
                                    <span className={cx('date-month')}>{start.month}</span>
                                </div>
                                <div className={cx('time-detail')}>
                                    <p className={cx('time-range')}>{start.time} - {end.time}</p>
                                    <p className={cx('participants-count')}><FontAwesomeIcon icon={faUser} className="user-icon" /> {booking.numberOfParticipants} người</p>
                                </div>
                            </div>
                            
                            {/* KHỐI CHI TIẾT (Content Right) */}
                            <div className={cx('card-details-block')}>
                                <div className={cx('room-info')}>
                                    <div className={cx('room-title')}>{booking.workSpaceRoom.title}</div>
                                    <p className={cx('booking-id')}>Mã đặt chỗ: <span>{booking.bookingCode}</span></p>
                                </div>

                                <div className={cx('summary-info')}>
                                    <div className={cx('info-item')}>
                                        <span className={cx('item-label')}>Tổng tiền</span>
                                        <span className={cx('item-value', 'amount')}>{booking.finalAmount.toLocaleString('vi-VN')} VND</span>
                                    </div>
                                    <div className={cx('info-item')}>
                                        <span className={cx('item-label')}>Trạng thái</span>
                                        <span className={cx('item-value', 'status-badge', statusInfo.className)}>
                                            {statusInfo.description}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}

export default BookingList;
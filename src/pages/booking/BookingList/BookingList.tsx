import React, { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from './BookingList.module.scss';
import { GetBookingsByUser } from "~/services/BookingService"; 
import { BookingListType } from "~/types/Booking";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardList, faUser, faStar } from "@fortawesome/free-solid-svg-icons"; // Thêm faStar
import ReviewModal from "./ReviewModal/ReviewModal";
import { toast } from "react-toastify";

const cx = classNames.bind(styles);

const BOOKING_STATUS_MAP = {
    3: { description: 'Đang chờ xác nhận', className: 'pending' },
    4: { description: 'Đã xác nhận', className: 'confirmed' },
    5: { description: 'Đã check-in', className: 'checked-in' },
    6: { description: 'Đã check-out', className: 'checked-out' },
    7: { description: 'Đã hủy', className: 'cancelled' },
    8: { description: 'Không đến', className: 'no-show' },
    9: { description: 'Đã hoàn thành', className: 'completed' }, // 👈 Target Status
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

    // 💥 STATE CHO MODAL
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<BookingListType | null>(null);

    useEffect(() => {
        // ... (Logic fetchBookings giữ nguyên)
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

    // 💥 HÀM MỞ MODAL
    const handleOpenReviewModal = (booking: BookingListType) => {
        setSelectedBooking(booking);
        setIsReviewModalOpen(true);
    };

    // 💥 HÀM ĐÓNG MODAL
    const handleCloseReviewModal = () => {
        setIsReviewModalOpen(false);
        setSelectedBooking(null);
        // Có thể thêm logic refresh danh sách đặt chỗ tại đây nếu cần
    };

    // ------------------ HIỂN THỊ CÁC TRẠNG THÁI ------------------
    // ... (Phần hiển thị Loading, Error, No Bookings giữ nguyên)

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

    const handleReviewSuccess = () => {
        toast.success("review successful")
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

                    // 💥 XÁC ĐỊNH NÚT HÀNH ĐỘNG
                    const isCompleted = booking.bookingStatusId === 9; // Trạng thái 'Đã hoàn thành'

                    const canReview = isCompleted && !booking.isReviewed; // Giả định có trường 'hasReviewed'
                    const isPending = booking.bookingStatusId === 3;

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

                                {/* 💥 NÚT HÀNH ĐỘNG - ĐÁNH GIÁ */}
                                {canReview && (
                                    <div className={cx('action-area')}>
                                        <button 
                                            className={cx('review-button')}
                                            onClick={() => handleOpenReviewModal(booking)}
                                        >
                                            <FontAwesomeIcon icon={faStar} /> Gửi đánh giá
                                        </button>
                                    </div>
                                )}
                                {/* Thêm các nút khác (Ví dụ: Hủy, Xem chi tiết...) tại đây nếu cần */}
                                {isPending && (
                                    <button
                                        className={cx('cancel-button')}
                                        // onClick={() => handleCancelBooking(booking.bookingCode)}
                                    >
                                        ❌ Hủy đặt chỗ
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 💥 MODAL ĐÁNH GIÁ */}
            {isReviewModalOpen && selectedBooking && (
                <ReviewModal 
                    isOpen={isReviewModalOpen}
                    onClose={handleCloseReviewModal}
                    booking={selectedBooking}
                    // 💥 THÊM PROP MỚI ĐƯỢC YÊU CẦU
                    onReviewSuccess={handleReviewSuccess}
                />
            )}
        </div>
    )
}

export default BookingList;
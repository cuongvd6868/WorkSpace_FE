import React from "react";
import classNames from "classnames/bind";
import styles from './CancelledBookingList.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan, faClock, faWallet, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { CancelledBooking } from "~/types/Staff";

const cx = classNames.bind(styles);


interface CancelledBookingListProps {
    bookings: CancelledBooking[];
}


const CancelledBookingList: React.FC<CancelledBookingListProps> = ({ bookings }) => {
    // Chỉ hiển thị tối đa 5 đơn hàng gần nhất (hoặc theo nhu cầu)
    const recentBookings = bookings.slice(0, 5); 

    // Hàm format ngày và giờ (Ví dụ: 01/12/2025 14:05:00)
    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false, // Sử dụng định dạng 24h
        });
    };

    if (recentBookings.length === 0) {
        return (
            <div className={cx('no-data')}>
                <FontAwesomeIcon icon={faBan} />
                <p>Không có đơn hàng nào bị hủy gần đây.</p>
            </div>
        );
    }

    return (
        <ul className={cx('cancelled-list')}>
            {recentBookings.map((booking) => (
                <li 
                    key={booking.bookingId} 
                    className={cx('cancelled-item')}
                >
                    <div className={cx('header')}>
                        <span className={cx('booking-code')}>
                            #{booking.bookingCode}
                        </span>
                        <span className={cx('time')}>
                            <FontAwesomeIcon icon={faClock} /> Hủy lúc **{formatDateTime(booking.cancelledAt)}**
                        </span>
                    </div>

                    <div className={cx('body')}>
                        <p className={cx('workspace-name')}>{booking.workspaceName}</p>
                        
                        <div className={cx('metadata')}>
                            <span className={cx('amount', 'danger')}>
                                <FontAwesomeIcon icon={faWallet} />
                                -{booking.finalAmount.toLocaleString('vi-VN')} VNĐ
                            </span>
                            
                            <span className={cx('reason-tooltip')}>
                                <FontAwesomeIcon icon={faInfoCircle} className={cx('info-icon')} />
                                Lý do
                                <div className={cx('tooltip-box')}>
                                    {booking.cancellationReason}
                                
                                </div>
                            </span>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );
};

export default CancelledBookingList;
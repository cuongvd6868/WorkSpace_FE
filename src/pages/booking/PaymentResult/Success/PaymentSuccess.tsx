import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from './PaymentSuccess.module.scss';
import { CheckCircle, Zap, Clock, User, DollarSign, ChevronRight } from 'lucide-react';
import { Link, useSearchParams } from "react-router-dom";
import { PaymentSuccessResponse } from "~/types/Booking";
import { GetBookingByBookingCode } from "~/services/BookingService";

const cx = classNames.bind(styles);

// Hàm Helper để format thời gian theo yêu cầu:
// 1. Nếu cùng ngày: "HH:mm - HH:mm, dd/MM/yyyy"
// 2. Nếu khác ngày: "HH:mm, dd/MM/yyyy - HH:mm, dd/MM/yyyy"
const formatBookingPeriod = (startTimeUtc: string | undefined, endTimeUtc: string | undefined): string => {
    if (!startTimeUtc || !endTimeUtc) return 'N/A';

    try {
        const startDate = new Date(startTimeUtc);
        const endDate = new Date(endTimeUtc);

        // Định dạng Ngày (dd/MM/yyyy)
        const formatDate = (date: Date): string => date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });

        // Định dạng Giờ (HH:mm)
        const formatTime = (date: Date): string => date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false, // Sử dụng định dạng 24h
        });

        const startTime = formatTime(startDate);
        const endTime = formatTime(endDate);
        const startDateString = formatDate(startDate);
        const endDateString = formatDate(endDate);

        // Kiểm tra xem có cùng ngày hay không
        if (startDateString === endDateString) {
            // Trường hợp 1: CÙNG NGÀY
            // Ví dụ: 14:00 - 17:00, 08/12/2025
            return `${startTime} - ${endTime}, ${startDateString}`;
        } else {
            // Trường hợp 2: KHÁC NGÀY
            // Ví dụ: 14:00, 08/12/2025 - 10:00, 09/12/2025
            return `${startTime}, ${startDateString} - ${endTime}, ${endDateString}`;
        }
    } catch (e) {
        console.error("Lỗi khi định dạng thời gian đặt chỗ:", e);
        return 'Thời gian không hợp lệ';
    }
};

const PaymentSuccess: React.FC = () => {
    const [bookingDetails, setBookingDetail] = useState<PaymentSuccessResponse>();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [searchParams] = useSearchParams();
    const bookingCode = searchParams.get("bookingCode");

    useEffect(() => {
        const fetchBookingResponse = async() => {
            try {
                const apiResponse = await GetBookingByBookingCode(bookingCode);
                setBookingDetail(apiResponse);
            } catch (error) {
                setError('' + error);
                console.log(error);
            } finally {
                setLoading(false)
            }
        };
        if (bookingCode) {
            fetchBookingResponse();
        } else {
            setLoading(false);
            setError("Không tìm thấy mã đặt chỗ (bookingCode) trong URL.");
        }
    }, [bookingCode])

    useEffect(() => {
        document.title = "Thanh toán thành công | Your Platform Name";
    }, []);

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };

    // Chuẩn bị dữ liệu hiển thị sau khi fetch thành công
    const formattedBookingPeriod = formatBookingPeriod(bookingDetails?.startTimeUtc, bookingDetails?.endTimeUtc);
    const formattedAmount = bookingDetails?.finalAmount ? formatCurrency(bookingDetails.finalAmount) : 'N/A';


    if (loading) {
        return <div className={cx('wrapper')}><p>Đang tải chi tiết đặt chỗ...</p></div>;
    }

    if (error || !bookingDetails) {
        return <div className={cx('wrapper')}><p>Đã xảy ra lỗi khi tải chi tiết đặt chỗ. Vui lòng kiểm tra lại. Lỗi: {error}</p></div>;
    }


    return (
        <div className={cx('wrapper')}>
            <div className={cx('success-container')}>
                
                {/* 1. Phần Header/Biểu tượng chính */}
                <div className={cx('success-header')}>
                    <CheckCircle className={cx('check-icon')} size={72} />
                    <h1 className={cx('main-title')}>Đặt chỗ thành công!</h1>
                    <p className={cx('subtitle')}>Giao dịch của bạn đã được xác nhận. Chúc bạn có một trải nghiệm làm việc hiệu quả.</p>
                </div>

                {/* 2. Phần Tóm tắt Đơn hàng */}
                <div className={cx('summary-card')}>
                    <div className={cx('card-item')}>
                        <Zap size={20} className={cx('item-icon')} />
                        <span className={cx('item-label')}>Mã đặt chỗ</span>
                        <span className={cx('item-value', 'highlight')}>{bookingDetails.bookingCode}</span>
                    </div>
                    <div className={cx('card-item')}>
                        <User size={20} className={cx('item-icon')} />
                        <span className={cx('item-label')}>Địa điểm</span>
                        <span className={cx('item-value')}>{bookingDetails.title} </span>
                    </div>
                    
                    {/* ĐÃ SỬA: SỬ DỤNG HÀM formatBookingPeriod MỚI */}
                    <div className={cx('card-item')}>
                        <Clock size={20} className={cx('item-icon')} />
                        <span className={cx('item-label')}>Thời gian</span>
                        <span className={cx('item-value')}>
                            {formattedBookingPeriod}
                        </span>
                    </div>

                    <div className={cx('card-item', 'total-line')}>
                        <DollarSign size={24} className={cx('item-icon')} />
                        <span className={cx('item-label', 'total-label')}>Tổng số tiền thanh toán</span>
                        <span className={cx('item-value', 'total-amount')}>{formattedAmount}</span>
                    </div>
                </div>

                {/* 3. Phần Hành động Tiếp theo */}
                <div className={cx('next-steps')}>
                    <Link to={'/booking-list'}>
                        <button className={cx('action-button', 'primary')}>
                            Xem Chi tiết Đặt chỗ
                            <ChevronRight size={20} />
                        </button>
                    </Link>

                </div>
                
                <p className={cx('secure-note')}>
                    Thông tin chi tiết (Hóa đơn điện tử, Hướng dẫn nhận phòng) đã được gửi đến Email của bạn.
                </p>

            </div>
        </div>
    )
}

export default PaymentSuccess;
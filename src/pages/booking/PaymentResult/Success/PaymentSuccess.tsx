import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from './PaymentSuccess.module.scss';
import { CheckCircle, Zap, Clock, User, DollarSign, ChevronRight } from 'lucide-react';
import { Link, useSearchParams } from "react-router-dom";
import { PaymentSuccessResponse } from "~/types/Booking";
import { GetBookingByBookingCode } from "~/services/BookingService";

const cx = classNames.bind(styles);



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
        fetchBookingResponse();

    }, [bookingCode])





    useEffect(() => {
        document.title = "Thanh toán thành công | Your Platform Name";
    }, []);

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };

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
                        <span className={cx('item-value', 'highlight')}>{bookingDetails?.bookingCode}</span>
                    </div>
                    <div className={cx('card-item')}>
                        <User size={20} className={cx('item-icon')} />
                        <span className={cx('item-label')}>Địa điểm</span>
                        <span className={cx('item-value')}>{bookingDetails?.title} </span>
                    </div>
                    <div className={cx('card-item')}>
                        <Clock size={20} className={cx('item-icon')} />
                        <span className={cx('item-label')}>Thời gian</span>
                        <span className={cx('item-value')}>từ {bookingDetails?.startTimeUtc} đến {bookingDetails?.endTimeUtc}</span>
                    </div>
                    <div className={cx('card-item', 'total-line')}>
                        <DollarSign size={24} className={cx('item-icon')} />
                        <span className={cx('item-label', 'total-label')}>Tổng số tiền thanh toán</span>
                        <span className={cx('item-value', 'total-amount')}>{bookingDetails?.finalAmount} VND</span>
                    </div>
                </div>

                {/* 3. Phần Hành động Tiếp theo */}
                <div className={cx('next-steps')}>
                    {/* <Link to={'/'}>
                        <button className={cx('action-button', 'primary')}>
                            Xem Chi tiết Đặt chỗ
                            <ChevronRight size={20} />
                        </button>
                    </Link> */}
                    <Link to={'/'}>
                        <button className={cx('action-button', 'primary')}>
                            Trở về Trang chủ
                        </button>
                    </Link>
                </div>
                
                {/* 4. Ghi chú bảo mật */}
                <p className={cx('secure-note')}>
                    Thông tin chi tiết (Hóa đơn điện tử, Hướng dẫn nhận phòng) đã được gửi đến Email của bạn.
                </p>

            </div>
        </div>
    )
}

export default PaymentSuccess;
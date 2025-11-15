import React, { useEffect } from "react";
import classNames from "classnames/bind";
import styles from './PaymentSuccess.module.scss';
import { CheckCircle, Zap, Clock, User, DollarSign, ChevronRight } from 'lucide-react';

const cx = classNames.bind(styles);

const PaymentSuccess: React.FC = () => {
    // Giả lập dữ liệu cần hiển thị (thường lấy từ query params hoặc state/API)
    const bookingDetails = {
        bookingId: "WSP-532456",
        workspaceName: "The Executive Hub - Coworking & Meeting",
        roomTitle: "Phòng họp cao cấp 'The Zenith'",
        date: "Thứ Năm, 28/08/2026",
        time: "14:00 - 16:30",
        finalAmount: 1250000,
        paymentMethod: "VNPay/Chuyển khoản",
    };

    // Có thể thêm logic side effect ở đây, ví dụ: gửi sự kiện tracking.
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
                        <span className={cx('item-value', 'highlight')}>{bookingDetails.bookingId}</span>
                    </div>
                    <div className={cx('card-item')}>
                        <User size={20} className={cx('item-icon')} />
                        <span className={cx('item-label')}>Địa điểm</span>
                        <span className={cx('item-value')}>{bookingDetails.roomTitle} tại {bookingDetails.workspaceName}</span>
                    </div>
                    <div className={cx('card-item')}>
                        <Clock size={20} className={cx('item-icon')} />
                        <span className={cx('item-label')}>Thời gian</span>
                        <span className={cx('item-value')}>{bookingDetails.date}, từ {bookingDetails.time}</span>
                    </div>
                    <div className={cx('card-item', 'total-line')}>
                        <DollarSign size={24} className={cx('item-icon')} />
                        <span className={cx('item-label', 'total-label')}>Tổng số tiền thanh toán</span>
                        <span className={cx('item-value', 'total-amount')}>{formatCurrency(bookingDetails.finalAmount)}</span>
                    </div>
                </div>

                {/* 3. Phần Hành động Tiếp theo */}
                <div className={cx('next-steps')}>
                    <button className={cx('action-button', 'primary')}>
                        Xem Chi tiết Đặt chỗ
                        <ChevronRight size={20} />
                    </button>
                    <button className={cx('action-button', 'secondary')}>
                        Trở về Trang chủ
                    </button>
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
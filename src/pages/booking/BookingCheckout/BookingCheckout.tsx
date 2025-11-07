import React, { useState, useEffect } from 'react';
import styles from './BookingCheckout.module.scss';
import classNames from 'classnames/bind';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '~/context/BookingContext';
import { 
    CreditCard, Calendar, Clock, Users, DollarSign, MapPin, 
    User, Lock, Home, Loader, ChevronLeft, Tag,
    CheckCircle, AlertCircle
} from 'lucide-react';

const cx = classNames.bind(styles);

const BookingCheckout: React.FC = () => {
    const { bookingData, clearBookingData } = useBooking();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    
    // State cho Form Thông Tin Khách Hàng
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [notes, setNotes] = useState('');

    // State cho Khuyến Mãi
    const [promotionCode, setPromotionCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [isCodeApplied, setIsCodeApplied] = useState(false);
    const [promoError, setPromoError] = useState('');

    // --- KIỂM TRA DỮ LIỆU ĐẶT PHÒNG ---
    useEffect(() => {
        if (!bookingData) {
            alert("Không tìm thấy thông tin đặt phòng. Vui lòng chọn phòng trước khi thanh toán.");
            navigate('/'); 
        }
    }, [bookingData, navigate]);

    if (!bookingData) {
        return null;
    }

    const { room, totalAmount, totalHours, startTimeUtc, endTimeUtc, numberOfParticipants, workspaceName, workspaceAddressLine } = bookingData;
    
    // Tính lại tổng tiền sau khi áp dụng khuyến mãi
    const finalAmount = totalAmount - discountAmount;

    // Logic xử lý Mã Khuyến Mãi
    const handleApplyPromotion = () => {
        if (isProcessing) return;
        
        const code = promotionCode.toUpperCase().trim();
        setPromoError('');

        if (code === 'GIAMGIA10' && totalAmount > 0) {
            const discount = totalAmount * 0.1; // Giảm 10%
            setDiscountAmount(Math.round(discount));
            setIsCodeApplied(true);
        } else if (code) {
            setDiscountAmount(0);
            setIsCodeApplied(false);
            setPromoError("Mã khuyến mãi không hợp lệ hoặc đã hết hạn.");
        } else {
            setDiscountAmount(0);
            setIsCodeApplied(false);
        }
    };

    // Định dạng thời gian
    const formatDateTime = (isoString: string) => {
        if (!isoString) return 'Chưa xác định';
        const date = new Date(isoString);
        return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const handlePlaceBooking = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name || !email || !contactPhone) {
            alert("Vui lòng điền đầy đủ thông tin liên hệ.");
            return;
        }

        setIsProcessing(true);

        // --- MOCK LOGIC XỬ LÝ THANH TOÁN ---
        setTimeout(() => {
            setIsProcessing(false);
            
            // Dữ liệu đặt phòng đã gửi (có cả khuyến mãi)
            console.log("Dữ liệu đặt phòng đã gửi:", {
                room: room.id,
                startTime: startTimeUtc,
                endTime: endTimeUtc,
                participants: numberOfParticipants,
                customerInfo: { name, email, contactPhone, notes },
                amount: finalAmount,
                discount: discountAmount,
                promotionCode: promotionCode
            });

            // Sau khi thành công:
            clearBookingData();
            alert(`Đặt phòng ${room.title} thành công! Tổng tiền cuối cùng: ${finalAmount.toLocaleString()} VNĐ.`);
            
            navigate('/booking/success');

        }, 2500); 
    };

    return (
        <div className={cx('checkout-container')}>
            <div className={cx('checkout-header')}>
                <button 
                    className={cx('back-button')} 
                    onClick={() => navigate(-1)}
                    disabled={isProcessing}
                >
                    <ChevronLeft size={20} />
                </button>
                <h1 className={cx('page-title')}>
                    <CreditCard size={28} />
                    Thanh Toán
                </h1>
            </div>
            
            <div className={cx('checkout-layout')}>
                {/* CỘT TRÁI: Thông tin đặt phòng */}
                <div className={cx('left-column')}>
                    <div className={cx('booking-summary')}>
                        <h2 className={cx('section-title')}>
                            <Home size={20} />
                            Thông tin đặt phòng
                        </h2>
                        
                        <div className={cx('workspace-info')}>
                            <h3 className={cx('workspace-name')}>{workspaceName}</h3>
                            <p className={cx('room-name')}>{room.title} <span className={cx('room-type')}>({room.roomType})</span></p>
                            <div className={cx('address')}>
                                <MapPin size={16} />
                                <span>{workspaceAddressLine}</span>
                            </div>
                        </div>

                        <div className={cx('booking-details')}>
                            <div className={cx('detail-item')}>
                                <Calendar size={18} />
                                <div className={cx('detail-content')}>
                                    <span className={cx('detail-label')}>Ngày bắt đầu</span>
                                    <span className={cx('detail-value')}>{formatDateTime(startTimeUtc)}</span>
                                </div>
                            </div>
                            
                            <div className={cx('detail-item')}>
                                <Clock size={18} />
                                <div className={cx('detail-content')}>
                                    <span className={cx('detail-label')}>Ngày kết thúc</span>
                                    <span className={cx('detail-value')}>{formatDateTime(endTimeUtc)}</span>
                                </div>
                            </div>
                            
                            <div className={cx('detail-item')}>
                                <Users size={18} />
                                <div className={cx('detail-content')}>
                                    <span className={cx('detail-label')}>Số người</span>
                                    <span className={cx('detail-value')}>{numberOfParticipants} người</span>
                                </div>
                            </div>
                            
                            <div className={cx('detail-item')}>
                                <Clock size={18} />
                                <div className={cx('detail-content')}>
                                    <span className={cx('detail-label')}>Tổng giờ thuê</span>
                                    <span className={cx('detail-value')}>{totalHours.toFixed(2)} giờ</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Phần khuyến mãi */}
                    <div className={cx('promotion-section')}>
                        <h2 className={cx('section-title')}>
                            <Tag size={20} />
                            Mã khuyến mãi
                        </h2>
                        
                        <div className={cx('promo-input-container')}>
                            <input
                                type="text"
                                placeholder="Nhập mã khuyến mãi"
                                value={promotionCode}
                                onChange={(e) => setPromotionCode(e.target.value)}
                                disabled={isProcessing || isCodeApplied}
                                className={cx('promo-input', { applied: isCodeApplied })}
                            />
                            <button 
                                type="button" 
                                onClick={handleApplyPromotion}
                                className={cx('promo-button', { applied: isCodeApplied })}
                                disabled={isProcessing || isCodeApplied}
                            >
                                {isCodeApplied ? <CheckCircle size={18} /> : "Áp dụng"}
                            </button>
                        </div>
                        
                        {isCodeApplied && (
                            <div className={cx('promo-success')}>
                                <CheckCircle size={16} />
                                <span>Mã khuyến mãi đã được áp dụng thành công!</span>
                            </div>
                        )}
                        
                        {promoError && (
                            <div className={cx('promo-error')}>
                                <AlertCircle size={16} />
                                <span>{promoError}</span>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* CỘT PHẢI: Form thanh toán */}
                <div className={cx('right-column')}>
                    <form onSubmit={handlePlaceBooking} className={cx('payment-form')}>
                        <div className={cx('form-section')}>
                            <h2 className={cx('section-title')}>
                                <User size={20} />
                                Thông tin liên hệ
                            </h2>
                            
                            <div className={cx('form-grid')}>
                                <div className={cx('form-group', 'full-width')}>
                                    <label htmlFor="name">Họ và tên *</label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        disabled={isProcessing}
                                        placeholder="Nhập họ và tên của bạn"
                                    />
                                </div>
                                
                                <div className={cx('form-group')}>
                                    <label htmlFor="email">Email *</label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isProcessing}
                                        placeholder="your@email.com"
                                    />
                                </div>
                                
                                <div className={cx('form-group')}>
                                    <label htmlFor="phone">Số điện thoại *</label>
                                    <input
                                        id="phone"
                                        type="tel"
                                        value={contactPhone}
                                        onChange={(e) => setContactPhone(e.target.value)}
                                        required
                                        disabled={isProcessing}
                                        placeholder="0123 456 789"
                                    />
                                </div>
                            </div>
                            
                            <div className={cx('form-group', 'full-width')}>
                                <label htmlFor="notes">Yêu cầu đặc biệt (tùy chọn)</label>
                                <textarea
                                    id="notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={3}
                                    disabled={isProcessing}
                                    placeholder="Ghi chú thêm về yêu cầu của bạn..."
                                />
                            </div>
                        </div>
                        
                        <div className={cx('form-section')}>
                            <h2 className={cx('section-title')}>
                                <Lock size={20} />
                                Phương thức thanh toán
                            </h2>
                            
                            <div className={cx('payment-options')}>
                                <label className={cx('payment-option')}>
                                    <input type="radio" name="paymentMethod" value="transfer" defaultChecked disabled={isProcessing} />
                                    <div className={cx('option-content')}>
                                        <span className={cx('option-title')}>Chuyển khoản ngân hàng</span>
                                        <span className={cx('option-description')}>VietQR, Momo, ZaloPay</span>
                                    </div>
                                </label>
                                
                                <label className={cx('payment-option')}>
                                    <input type="radio" name="paymentMethod" value="card" disabled={isProcessing} />
                                    <div className={cx('option-content')}>
                                        <span className={cx('option-title')}>Thẻ tín dụng/ghi nợ</span>
                                        <span className={cx('option-description')}>Visa, Mastercard, JCB</span>
                                    </div>
                                </label>
                                
                                <label className={cx('payment-option')}>
                                    <input type="radio" name="paymentMethod" value="onsite" disabled={isProcessing} />
                                    <div className={cx('option-content')}>
                                        <span className={cx('option-title')}>Thanh toán tại chỗ</span>
                                        <span className={cx('option-description')}>Đặt cọc khi nhận phòng</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                        
                        <div className={cx('order-summary')}>
                            <h2 className={cx('section-title')}>
                                <DollarSign size={20} />
                                Tổng thanh toán
                            </h2>
                            
                            <div className={cx('price-breakdown')}>
                                <div className={cx('price-row')}>
                                    <span>Giá thuê cơ bản</span>
                                    <span>{totalAmount.toLocaleString()} VNĐ</span>
                                </div>
                                
                                {discountAmount > 0 && (
                                    <div className={cx('price-row', 'discount')}>
                                        <span>Giảm giá khuyến mãi</span>
                                        <span>- {discountAmount.toLocaleString()} VNĐ</span>
                                    </div>
                                )}
                                
                                <div className={cx('price-row', 'total')}>
                                    <span>Tổng thanh toán</span>
                                    <span>{finalAmount.toLocaleString()} VNĐ</span>
                                </div>
                            </div>
                            
                            <p className={cx('tax-note')}>Đã bao gồm VAT và phí dịch vụ</p>
                            
                            <button 
                                type="submit" 
                                className={cx('submit-button', { processing: isProcessing })}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader size={20} className={cx('loader')} />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard size={20} />
                                        Thanh toán {finalAmount.toLocaleString()} VNĐ
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookingCheckout;
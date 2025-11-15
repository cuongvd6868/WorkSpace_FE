import React, { useState, useEffect } from 'react';
import styles from './BookingCheckout.module.scss';
import classNames from 'classnames/bind';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '~/context/BookingContext';
import { 
    CreditCard, Calendar, Clock, Users, DollarSign, MapPin, 
    User, Lock, Home, Loader, ChevronLeft, Tag,
    CheckCircle, AlertCircle, Phone, Mail, FileText, Briefcase
} from 'lucide-react';
import { toast } from 'react-toastify';

import { createBookingCustomer, createBookingGuest, createPaymentUrl } from '~/services/BookingService';
import { CreateBookingRequestForGuest, BookingDetails, GuestDetails, CreateBookingResponse, CustomerDetails, CreateBookingRequestForCustomer } from '~/types/Booking'; 
import { getEmailByToken, isToken, isTokenExpired } from '~/services/JwtService';

const cx = classNames.bind(styles);

const BookingCheckout: React.FC = () => {
    const token = localStorage.getItem('token');
    const isLoggedIn = token && isToken() && !isTokenExpired(token);

    const { bookingData, clearBookingData } = useBooking();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    
    // State cho Form Thông Tin Khách Hàng
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [specialRequests, setSetspecialRequests] = useState('');

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


    const taxAmount = totalAmount * 0.1;
    const finalAmount = (totalAmount + taxAmount) - discountAmount;
    // nền tảng đớp
    const serviceFee = finalAmount * 0.1; 

    //============================ Logic xử lý Mã Khuyến Mãi ============================
    const handleApplyPromotion = () => {
        if (isProcessing) return;
        
        const code = promotionCode.toUpperCase().trim();
        setPromoError('');

        if (code === 'GIAMGIA10' && totalAmount > 0) {
            const discount = totalAmount * 0.1; // Giảm 10%
            setDiscountAmount(Math.round(discount));
            setIsCodeApplied(true);
            toast.success("Áp dụng mã khuyến mãi thành công!");
        } else if (code) {
            setDiscountAmount(0);
            setIsCodeApplied(false);
            setPromoError("Mã khuyến mãi không hợp lệ hoặc đã hết hạn.");
            toast.error("Mã khuyến mãi không hợp lệ.");
        } else {
            setDiscountAmount(0);
            setIsCodeApplied(false);
            setPromoError("Vui lòng nhập mã khuyến mãi.");
        }
    };

    // Định dạng thời gian
    const formatDateTime = (isoString: string) => {
        if (!isoString) return 'Chưa xác định';
        const date = new Date(isoString);
        return date.toLocaleDateString('vi-VN', { 
            weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' 
        }) + ' lúc ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    // ============================ Logic xử lý Đặt chỗ ============================
    const handlePlaceBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isProcessing) return;

        // 1. Kiểm tra thông tin bắt buộc
        if (!firstName || !lastName || !email || !phoneNumber) {
            toast.error("Vui lòng điền đầy đủ thông tin liên hệ bắt buộc.");
            return;
        }

        setIsProcessing(true);

        try {
            // Chuẩn bị dữ liệu BookingDetails
            const bookingDetails: BookingDetails = {
                workSpaceRoomID: room.id,
                startTimeUtc: startTimeUtc,
                endTimeUtc: endTimeUtc,
                numberOfParticipants: numberOfParticipants,
                specialRequests: specialRequests,
                totalPrice: totalAmount, // Tổng giá cơ bản
                taxAmount: taxAmount,
                serviceFee: serviceFee,
                finalAmount: finalAmount, // Tổng cuối cùng sau giảm giá
            };

            // Chuẩn bị dữ liệu GuestDetails
            const guestDetails: GuestDetails = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                phoneNumber: phoneNumber.trim(),
            };

            const customerDetails: CustomerDetails = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                phoneNumber: phoneNumber.trim(),
            };

            if(!isLoggedIn) {
                const requestData: CreateBookingRequestForGuest = {
                    guestDetails,
                    bookingDetails,
                };
                const bookingResponse: CreateBookingResponse = await createBookingGuest(requestData);
                const bookingId = bookingResponse.bookingId;
                
                toast.success(`Đặt chỗ thành công (ID: ${bookingId}). Đang chuyển hướng đến trang thanh toán...`);
                const paymentUrl = await createPaymentUrl(bookingId);
    
                window.location.href = paymentUrl; 
            } else {
                const requestData: CreateBookingRequestForCustomer = {
                    customerDetails,
                    bookingDetails,
                };
                const bookingResponse: CreateBookingResponse = await createBookingCustomer(requestData);
                const bookingId = bookingResponse.bookingId;
                
                toast.success(`Đặt chỗ thành công (ID: ${bookingId}). Đang chuyển hướng đến trang thanh toán...`);
    
                const paymentUrl = await createPaymentUrl(bookingId);

                window.location.href = paymentUrl; 
            }

        } catch (error: any) {
            console.error('Lỗi quy trình đặt chỗ:', error);
            // Hiển thị thông báo lỗi chi tiết hơn nếu có
            const errorMessage = error?.response?.data?.message || error.message || "Đã xảy ra lỗi trong quá trình đặt chỗ. Vui lòng thử lại.";
            toast.error(errorMessage);

        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className={cx('checkout-page-wrapper')}>
            <div className={cx('checkout-header-bar')}>
                <button 
                    className={cx('back-button')} 
                    onClick={() => navigate(-1)}
                    disabled={isProcessing}
                >
                    <ChevronLeft size={20} />
                    <span>Quay lại</span>
                </button>
                <h1 className={cx('page-main-title')}>
                    <CreditCard size={28} />
                    Hoàn tất đặt chỗ
                </h1>
            </div>

            <div className={cx('checkout-main-content')}>
                <div className={cx('left-panel')}>

                    {/*============================ THÔNG TIN LIÊN HỆ ============================*/}
                    <div className={cx('section-card', 'contact-section')}>
                        <h2 className={cx('card-title')}>
                            <User size={20} />
                            Thông tin của bạn
                        </h2>
                        {/* Bọc form với onSubmit để kích hoạt handlePlaceBooking */}
                        <form onSubmit={handlePlaceBooking} id="booking-form" className={cx('contact-form')}>
                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label htmlFor="firstName">Họ *</label>
                                    <div className={cx('input-icon-wrapper')}>
                                        <User size={18} />
                                        <input
                                            id="firstName"
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            required
                                            disabled={isProcessing}
                                            placeholder="Ví dụ: Nguyễn"
                                        />
                                    </div>
                                </div>
                                <div className={cx('form-group')}>
                                    <label htmlFor="lastName">Tên *</label>
                                    <div className={cx('input-icon-wrapper')}>
                                        <User size={18} />
                                        <input
                                            id="lastName"
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            required
                                            disabled={isProcessing}
                                            placeholder="Ví dụ: Văn A"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label htmlFor="phone">Số điện thoại *</label>
                                    <div className={cx('input-icon-wrapper')}>
                                        <Phone size={18} />
                                        <input
                                            id="phone"
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            required
                                            disabled={isProcessing}
                                            placeholder="09xx xxx xxx"
                                        />
                                    </div>
                                </div>
                                {isLoggedIn && (
                                    <div className={cx('form-group_2')}>
                                        <label htmlFor="email">Email (Mặc định)</label>
                                        <div className={cx('input-icon-wrapper')}>
                                            <Mail size={18} />
                                            <input
                                                id="email"
                                                type="email"
                                                value={getEmailByToken()}
                                                required
                                                disabled={isProcessing}
                                                placeholder="email@example.com"
                                            />
                                        </div>
                                    </div>
                                )}
                                {!isLoggedIn && (
                                    <div className={cx('form-group')}>
                                        <label htmlFor="email">Email *</label>
                                        <div className={cx('input-icon-wrapper')}>
                                            <Mail size={18} />
                                            <input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                disabled={isProcessing}
                                                placeholder="email@example.com"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className={cx('form-group')}>
                                <label htmlFor="notes">Yêu cầu đặc biệt (tùy chọn)</label>
                                <div className={cx('input-icon-wrapper', 'textarea-wrapper')}>
                                    <FileText size={18} className={cx('textarea-icon')} />
                                    <textarea
                                        id="notes"
                                        value={specialRequests}
                                        onChange={(e) => setSetspecialRequests(e.target.value)}
                                        rows={3}
                                        disabled={isProcessing}
                                        placeholder="Cần thêm màn hình phụ, nước uống,..."
                                    />
                                </div>
                            </div>
                        </form>
                    </div>


                    {/* =========================================PHƯƠNG THỨC THANH TOÁN=================================== */}
                    <div className={cx('section-card', 'payment-method-section')}>
                        <h2 className={cx('card-title')}>
                            <Lock size={20} />
                            Chọn phương thức thanh toán
                        </h2>
                        <div className={cx('payment-options-grid')}>
                            <label className={cx('payment-option-card')}>
                                <input type="radio" name="paymentMethod" value="transfer" defaultChecked disabled={isProcessing} />
                                <div className={cx('option-content')}>
                                    <CreditCard size={24} />
                                    <span className={cx('option-title')}>Chuyển khoản trực tuyến</span>
                                    <span className={cx('option-description')}>VietQR, Momo, ZaloPay (qua cổng VNPAY)</span>
                                </div>
                            </label>
                            
                            {/* Các phương thức thanh toán khác */}
                            <label className={cx('payment-option-card')}>
                                <input type="radio" name="paymentMethod" value="card" disabled={isProcessing} />
                                <div className={cx('option-content')}>
                                    <CreditCard size={24} />
                                    <span className={cx('option-title')}>Thẻ tín dụng/ghi nợ</span>
                                    <span className={cx('option-description')}>Visa, Mastercard, JCB (bảo mật bởi Stripe)</span>
                                </div>
                            </label>
                            
                            <label className={cx('payment-option-card')}>
                                <input type="radio" name="paymentMethod" value="onsite" disabled={isProcessing} />
                                <div className={cx('option-content')}>
                                    <Briefcase size={24} />
                                    <span className={cx('option-title')}>Thanh toán tại chỗ</span>
                                    <span className={cx('option-description')}>Áp dụng cho đơn hàng nhỏ hơn 1.000.000 VNĐ</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className={cx('right-panel')}>
                    {/* TÓM TẮT ĐƠN HÀNG - Giữ nguyên */}
                    <div className={cx('summary-card')}>
                        <h2 className={cx('summary-card-title')}>
                            <Home size={20} />
                            Thông tin đặt chỗ
                        </h2>
                        <div className={cx('summary-details')}>
                            <p className={cx('summary-workspace-name')}>{workspaceName}</p>
                            <p className={cx('summary-room-name')}>{room.title} <span className={cx('summary-room-type')}>({room.roomType})</span></p>
                            <div className={cx('summary-item')}>
                                <MapPin size={16} />
                                <span>{workspaceAddressLine}</span>
                            </div>
                            <div className={cx('summary-item')}>
                                <Calendar size={16} />
                                <span>Bắt đầu: {formatDateTime(startTimeUtc)}</span>
                            </div>
                            <div className={cx('summary-item')}>
                                <Clock size={16} />
                                <span>Kết thúc: {formatDateTime(endTimeUtc)}</span>
                            </div>
                            <div className={cx('summary-item')}>
                                <Users size={16} />
                                <span>Số người: {numberOfParticipants}</span>
                            </div>
                            <div className={cx('summary-item')}>
                                <Clock size={16} />
                                <span>Tổng thời gian: {totalHours.toFixed(2)} giờ</span>
                            </div>
                        </div>
                    </div>

                    {/* MÃ KHUYẾN MÃI - Giữ nguyên */}
                    <div className={cx('promo-card')}>
                        <h3 className={cx('promo-card-title')}>
                            <Tag size={18} />
                            Mã khuyến mãi
                        </h3>
                        <div className={cx('promo-input-group')}>
                            <input
                                type="text"
                                placeholder="Nhập mã giảm giá..."
                                value={promotionCode}
                                onChange={(e) => setPromotionCode(e.target.value)}
                                disabled={isProcessing || isCodeApplied}
                                className={cx('promo-input', { applied: isCodeApplied })}
                            />
                            <button 
                                type="button" 
                                onClick={handleApplyPromotion}
                                className={cx('apply-promo-btn', { applied: isCodeApplied })}
                                disabled={isProcessing || isCodeApplied}
                            >
                                {isCodeApplied ? <CheckCircle size={18} /> : "Áp dụng"}
                            </button>
                        </div>
                        {isCodeApplied && (
                            <div className={cx('promo-message', 'success')}>
                                <CheckCircle size={16} />
                                <span>Mã khuyến mãi đã được áp dụng.</span>
                            </div>
                        )}
                        {promoError && (
                            <div className={cx('promo-message', 'error')}>
                                <AlertCircle size={16} />
                                <span>{promoError}</span>
                            </div>
                        )}
                    </div>

                    {/* TỔNG THANH TOÁN - Giữ nguyên */}
                    <div className={cx('total-payment-card')}>
                        <h2 className={cx('total-payment-title')}>
                            <DollarSign size={20} />
                            Chi tiết thanh toán
                        </h2>
                        <div className={cx('price-breakdown')}>
                            <div className={cx('price-item')}>
                                <span className={cx('label')}>Giá thuê cơ bản</span>
                                <span className={cx('value')}>{totalAmount.toLocaleString()} VNĐ</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className={cx('price-item', 'discount-line')}>
                                    <span className={cx('label')}>Giảm giá khuyến mãi</span>
                                    <span className={cx('value')}>- {discountAmount.toLocaleString()} VNĐ</span>
                                </div>
                            )}
                            <div className={cx('price-item', 'total-line')}>
                                <span className={cx('label')}>Tổng cộng</span>
                                <span className={cx('value', 'final-price')}>{finalAmount.toLocaleString()} VNĐ</span>
                            </div>
                        </div>
                        <p className={cx('tax-note')}>Đã bao gồm thuế và phí dịch vụ.</p>

                        {/* Nút thanh toán gắn với form bằng thuộc tính form="booking-form" */}
                        <button 
                            type="submit" 
                            className={cx('confirm-payment-btn', { processing: isProcessing })}
                            disabled={isProcessing}
                            form="booking-form" // Liên kết với form ở cột trái
                        >
                            {isProcessing ? (
                                <>
                                    <Loader size={20} className={cx('loader-spin')} />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <CreditCard size={20} />
                                    Xác nhận và Thanh toán
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            
            
            <div className={cx('footer-note')}>
                Bằng việc xác nhận, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của chúng tôi.
            </div>
        </div>
    );
};

export default BookingCheckout;
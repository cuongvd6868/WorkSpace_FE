import React, { useState, useEffect } from 'react';
import styles from './BookingCheckout.module.scss';
import classNames from 'classnames/bind';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '~/context/BookingContext';
import { 
    CreditCard, Calendar, Clock, Users, DollarSign, MapPin, 
    User, Lock, Home, Loader, ChevronLeft, Tag,
    CheckCircle, AlertCircle, Phone, Mail, FileText
} from 'lucide-react';
import { toast } from 'react-toastify';
import { 
    SelectedService 
} from '~/types/Booking';
import { Drink } from '~/types/Drink';
import { 
    createBookingCustomer, 
    createBookingGuest, 
    createVnpayPaymentUrl, 
    createPayOsPaymentUrl, 
} from '~/services/BookingService'; 
import { CreateBookingRequestForGuest, BookingDetails, GuestDetails, CreateBookingResponse, CustomerDetails, CreateBookingRequestForCustomer } from '~/types/Booking'; 
import { getEmailByToken, isToken, isTokenExpired } from '~/services/JwtService';
import { Promotions } from '~/types/Promotions';
import { GetPromotionByCode } from '~/services/PromotionService';
import payos_logo from '~/assets/img/payment/payos_logo.svg';
import vnpay_logo from '~/assets/img/payment/vnpay_logo.svg';
import { getAllDrinkService } from '~/services/DrinkService';
import { CLOUD_NAME } from '~/config/cloudinaryConfig';

const cx = classNames.bind(styles);

type PaymentMethod = 'vnpay' | 'payos';

const BookingCheckout: React.FC = () => {
    const token = localStorage.getItem('token');
    const isLoggedIn = token && isToken() && !isTokenExpired(token);

    const { bookingData, clearBookingData } = useBooking();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    
    // --- State cho Phương Thức Thanh Toán ---
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('vnpay'); // Mặc định là VNPAY
    
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
    const [promotion, setPromotion] = useState<Promotions>();
    const [promotionLoading, setPromotionLoading] = useState<boolean>(true);

    // --- State cho Dịch vụ đồ uống (API) ---
    const [drinks, setDrinks] = useState<Drink[]>([]);
    const [selectedServices, setSelectedServices] = useState<{[key: number]: number}>({}); // Lưu dạng { id: số_lượng }
    const [loadingDrinks, setLoadingDrinks] = useState(true);

    useEffect(() => {
    const fetchDrinks = async () => {
        if (bookingData?.room?.id) {
            try {
                setLoadingDrinks(true);
                const data = await getAllDrinkService(bookingData.room.id);
                setDrinks(data);
            } catch (error) {
                console.error("Lỗi lấy danh sách đồ uống:", error);
            } finally {
                setLoadingDrinks(false);
            }
        }
    };
    fetchDrinks();
}, [bookingData?.room?.id]);
// --- Hàm xử lý thay đổi số lượng đồ uống ---
const handleServiceQuantityChange = (drinkId: number, delta: number) => {
    setSelectedServices(prev => {
        const currentQty = prev[drinkId] || 0;
        const newQty = Math.max(0, currentQty + delta); // Không cho phép nhỏ hơn 0
        
        // Nếu số lượng mới là 0, có thể xóa key đó khỏi object để sạch data
        if (newQty === 0) {
            const { [drinkId]: _, ...rest } = prev;
            return rest;
        }
        
        return {
            ...prev,
            [drinkId]: newQty
        };
    });
};

    // --- KIỂM TRA DỮ LIỆU ĐẶT PHÒNG ---
    useEffect(() => {
        if (!bookingData) {
            alert("Không tìm thấy thông tin đặt phòng. Vui lòng chọn phòng trước khi thanh toán.");
            navigate('/'); 
        }
        if(isLoggedIn) {
          const loggedInEmail = getEmailByToken();
            if (loggedInEmail) {
                setEmail(loggedInEmail);
            }  
        }
    }, [bookingData, navigate, isLoggedIn]);

    if (!bookingData) {
        return null;
    }

    const { room, totalAmount, totalHours, startTimeUtc, endTimeUtc, numberOfParticipants, workspaceName, workspaceAddressLine } = bookingData;
    // const taxAmount = totalAmount * 0.1;
    // const finalAmount = (totalAmount + taxAmount) - discountAmount;
    // const serviceFee = finalAmount * 0.1; 

    // 1. Tính tổng tiền đồ uống
const servicesTotal = drinks.reduce((sum, drink) => {
    const qty = selectedServices[drink.id] || 0;
    return sum + (drink.price * qty);
}, 0);

// 2. Tổng tiền trước thuế (Phòng + Nước)
const subTotal = totalAmount + servicesTotal; 

// 3. Tính toán các chi phí phát sinh dựa trên subTotal
const calculatedTax = subTotal * 0.1;
const calculatedFinal = (subTotal + calculatedTax) - discountAmount;
const calculatedServiceFee = calculatedFinal * 0.1;

    //============================ Logic xử lý Mã Khuyến Mãi ============================

    const calculateDiscount = (
        discountType: string, 
        discountValue: number, 
        baseAmount: number 
    ): number => { 
        
        const validatedBaseAmount = Math.max(0, baseAmount);
        const validatedDiscountValue = Math.max(0, discountValue);

        let calculatedDiscount = 0;

        if (discountType === 'AMOUNT') {
            calculatedDiscount = validatedDiscountValue;

            return Math.min(calculatedDiscount, validatedBaseAmount); 

        } else if (discountType === 'PERCENT') {
            
            calculatedDiscount = validatedBaseAmount * (validatedDiscountValue / 100);
            

            return Math.round(calculatedDiscount); 
        }
        
        return 0;
    } 
    
    
    const handleApplyPromotion = async () => {
        if (isProcessing) return;
        if(!isLoggedIn) {
            toast.dark('Bạn phải đăng nhập để sử dụng khuyến mãi')
        }else {
            const codeToUse = promotionCode.toUpperCase().trim();
            if (codeToUse === '') {
                setPromoError("Vui lòng nhập mã khuyến mãi.");
                setDiscountAmount(0);
                setIsCodeApplied(false);
                return;
            }
            setPromotionLoading(true);
            setPromoError('');

            try {
                const apiResponse = await GetPromotionByCode(codeToUse);
                if (apiResponse && apiResponse.id) {
                    setPromotion(apiResponse);
                    setIsCodeApplied(true);
                    setPromoError('');
                    toast.success(`Mã khuyến mãi "${codeToUse}" đã được áp dụng!`);

                    const discount = calculateDiscount(
                        apiResponse.discountType,     
                        apiResponse.discountValue,     
                        totalAmount                    
                    ); 
                    setDiscountAmount(discount);
                } else {
                    setPromotion(undefined);
                    setPromoError("Mã khuyến mãi không hợp lệ hoặc không áp dụng được.");
                    setIsCodeApplied(false);
                    setDiscountAmount(0);
                }
            } catch (error) {
                console.error('Lỗi khi kiểm tra khuyến mãi:', error);
                const errorMessage =  "Mã khuyến mãi không hợp lệ hoặc đã hết hạn.";
                setPromoError(errorMessage);
                setPromotion(undefined);
                setIsCodeApplied(false);
                setDiscountAmount(0);
                toast.error(errorMessage);             
            } finally {
                setPromotionLoading(false);
            }
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
                totalPrice: subTotal, // Tổng giá cơ bản
                taxAmount: calculatedTax,
                serviceFee: calculatedServiceFee,
                finalAmount: calculatedFinal, // Tổng cuối cùng sau giảm giá
                services: Object.entries(selectedServices).map(([id, qty]) => ({
        serviceId: Number(id),
        quantity: qty
    }))
            };

            let bookingResponse: CreateBookingResponse;

            if(!isLoggedIn) {
                // Đặt chỗ với tư cách khách
                const guestDetails: GuestDetails = {
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    email: email.trim(),
                    phoneNumber: phoneNumber.trim(),
                };
                const requestData: CreateBookingRequestForGuest = {
                    guestDetails,
                    bookingDetails,
                };
                bookingResponse = await createBookingGuest(requestData);
            } else {
                // Đặt chỗ với tư cách khách hàng đã đăng nhập
                const customerDetails: CustomerDetails = {
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    phoneNumber: phoneNumber.trim(),
                };
                const requestData: CreateBookingRequestForCustomer = {
                    customerDetails,
                    bookingDetails,
                };
                bookingResponse = await createBookingCustomer(requestData);
            }

            const bookingId = bookingResponse.bookingId;
            toast.success(`Đặt chỗ thành công (ID: ${bookingId}). Đang chuyển hướng đến trang thanh toán ${selectedPaymentMethod.toUpperCase()}...`);
            
            // 2. Tạo URL thanh toán dựa trên phương thức đã chọn
            let paymentUrl: string;
            if (selectedPaymentMethod === 'vnpay') {
                paymentUrl = await createVnpayPaymentUrl(bookingId);
            } else if (selectedPaymentMethod === 'payos') {
                paymentUrl = await createPayOsPaymentUrl(bookingId); // Gọi hàm tạo URL PayOS
            } else {
                throw new Error('Phương thức thanh toán không hợp lệ.');
            }

            // 3. Chuyển hướng
            window.location.href = paymentUrl; 

        } catch (error: any) {
            console.error('Lỗi quy trình đặt chỗ:', error);
            // Hiển thị thông báo lỗi chi tiết hơn nếu có
            const errorMessage = error?.response?.data?.message || error.message || "Đã xảy ra lỗi trong quá trình đặt chỗ. Vui lòng thử lại.";
            toast.error(errorMessage);

        } finally {
            setIsProcessing(false);
        }
    };
// 1. Tính tổng tiền đồ uống trước


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
                                                value={email}
                                                required
                                                disabled={true} // Email của user đăng nhập không thay đổi
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
                    {/* ============================ DỊCH VỤ ĐI KÈM (Đồ uống) ============================ */}
                    <div className={cx('section-card', 'services-section')}>
                        <h2 className={cx('card-title')}>
                            <Clock size={20} />
                            Dịch vụ đồ uống đi kèm
                        </h2>
                        
                        {loadingDrinks ? (
                            <div className={cx('loading-placeholder')}>Đang tải danh sách đồ uống...</div>
                        ) : (
                            <div className={cx('drinks-list')}>
                                {drinks.map((drink) => (
                                    <div key={drink.id} className={cx('drink-item')}>
                                        <div className={cx('drink-info')}>
                                            <img src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${drink.imageUrl}`} alt=""/>
                                            <div>
                                                <span className={cx('drink-name')}>{drink.name}</span>
                                                <span className={cx('drink-price')}>{drink.price.toLocaleString()} VNĐ</span>
                                            </div>
                                        </div>
                                        <div className={cx('quantity-controls')}>
                                            <button 
                                                type="button"
                                                onClick={() => handleServiceQuantityChange(drink.id, -1)}
                                                className={cx('qty-btn')}
                                            >-</button>
                                            <span className={cx('qty-value')}>{selectedServices[drink.id] || 0}</span>
                                            <button 
                                                type="button"
                                                onClick={() => handleServiceQuantityChange(drink.id, 1)}
                                                className={cx('qty-btn')}
                                            >+</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>


                    {/* =========================================PHƯƠNG THỨC THANH TOÁN (Cập nhật)=================================== */}
                    <div className={cx('section-card', 'payment-method-section')}>
                        <h2 className={cx('card-title')}>
                            <Lock size={20} />
                            Chọn phương thức thanh toán
                        </h2>
                        <div className={cx('payment-options-grid')}>
                            <label 
                                className={cx('payment-option-card', { selected: selectedPaymentMethod === 'vnpay' })}
                            >
                                <input 
                                    type="radio" 
                                    name="paymentMethod" 
                                    value="vnpay" 
                                    checked={selectedPaymentMethod === 'vnpay'}
                                    onChange={() => setSelectedPaymentMethod('vnpay')}
                                    disabled={isProcessing} 
                                />
                                <div className={cx('option-content')}>
                                    <img src={vnpay_logo} alt="VNPAY Logo" className={cx('payment-logo')}/>
                                    <span className={cx('option-title')}>Thanh toán VNPAY</span>
                                    <span className={cx('option-description')}>
                                        VietQR, Mobile Banking, Ví VNPAY
                                    </span>
                                </div>
                            </label>

                            <label 
                                className={cx('payment-option-card', { selected: selectedPaymentMethod === 'payos' })}
                            >
                                <input 
                                    type="radio" 
                                    name="paymentMethod" 
                                    value="payos" 
                                    checked={selectedPaymentMethod === 'payos'}
                                    onChange={() => setSelectedPaymentMethod('payos')}
                                    disabled={isProcessing} 
                                />
                                <div className={cx('option-content')}>
                                    <img src={payos_logo} alt="PayOS Logo" className={cx('payment-logo')}/>
                                    <span className={cx('option-title')}>Thanh toán PayOS</span>
                                    <span className={cx('option-description')}>
                                        Chuyển khoản nhanh qua PayOS, nhận diện tự động
                                    </span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className={cx('right-panel')}>
                    {/* TÓM TẮT ĐƠN HÀNG */}
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

                    {/* MÃ KHUYẾN MÃI */}
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

                    {/* TỔNG THANH TOÁN */}
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
                            {servicesTotal > 0 && (
                                
                        <div className={cx('price-item')}>
                            <span className={cx('label')}>Dịch vụ đồ uống</span>
                            <span className={cx('value')}>{servicesTotal.toLocaleString()} VNĐ</span>
                        </div>
                    )}
                            <div className={cx('price-item')}>
                                <span className={cx('label')}>VAT</span>
                                <span className={cx('value')}>{calculatedTax.toLocaleString()} VNĐ</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className={cx('price-item', 'discount-line')}>
                                    <span className={cx('label')}>Giảm giá khuyến mãi</span>
                                    <span className={cx('value')}>- {discountAmount.toLocaleString()} VNĐ</span>
                                </div>
                            )}
                            <div className={cx('price-item', 'total-line')}>
                                <span className={cx('label')}>Tổng cộng</span>
                                <span className={cx('value', 'final-price')}>{calculatedFinal.toLocaleString()} VNĐ</span>
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
                Bằng việc xác nhận, bạn đồng ý với **Điều khoản dịch vụ** và **Chính sách bảo mật** của chúng tôi.
            </div>
        </div>
    );
};

export default BookingCheckout;
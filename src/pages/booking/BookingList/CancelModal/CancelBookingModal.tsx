import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './CancelBookingModal.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation, faUserShield, faChevronRight, faXmark, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { cancelBooking } from '~/services/BookingService';
import { toast } from 'react-toastify';

const cx = classNames.bind(styles);

const CancelBookingModal: React.FC<any> = ({ bookingId, bookingCode, onClose, onSuccess }) => {
    const [reason, setReason] = useState('');
    const [step, setStep] = useState(1);
    const [isAnimating, setIsAnimating] = useState(false);
    const [loading, setLoading] = useState(false);

    // Hiệu ứng chuyển step mượt mà
    const nextStep = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setStep(2);
            setIsAnimating(false);
        }, 300);
    };

    const handleConfirmCancel = async () => {
        setLoading(true);
        try {
            await cancelBooking(bookingId.toString(), { reason });
            toast.success(`Hủy đơn hàng ${bookingCode} thành công`);
            onSuccess();
            onClose();
        } catch (error) {
            toast.error("Hệ thống bận, vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cx('modal-overlay')} onClick={onClose}>
            <div className={cx('modal-card')} onClick={(e) => e.stopPropagation()}>
                {/* Nút đóng nhanh */}
                <button className={cx('close-icon')} onClick={onClose}><FontAwesomeIcon icon={faXmark} /></button>

                {/* Thanh tiến trình (Progress Line) */}
                <div className={cx('progress-bar')}>
                    <div className={cx('line', { active: step >= 1 })}></div>
                    <div className={cx('line', { active: step >= 2 })}></div>
                </div>

                <div className={cx('content-wrapper', { slideOut: isAnimating })}>
                    {step === 1 ? (
                        <div className={cx('step-box')}>
                            <div className={cx('icon-circle', 'warning')}>
                                <FontAwesomeIcon icon={faCircleExclamation} />
                            </div>
                            <h2>Lý do hủy đặt chỗ</h2>
                            <p className={cx('subtitle')}>Chia sẻ lý do để chúng tôi cải thiện dịch vụ tốt hơn cho bạn.</p>
                            
                            <div className={cx('input-group')}>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Ví dụ: Tôi có việc đột xuất không thể tham gia..."
                                    className={cx('modern-textarea')}
                                />
                                <span className={cx('char-count')}>{reason.length}/200</span>
                            </div>

                            <button 
                                disabled={reason.length < 5} 
                                className={cx('primary-btn')} 
                                onClick={nextStep}
                            >
                                Tiếp tục <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                        </div>
                    ) : (
// Thay thế đoạn nội dung Step 2 trong file .tsx
<div className={cx('step-box')}>
    <div className={cx('icon-circle', 'policy')}>
        <FontAwesomeIcon icon={faUserShield} />
    </div>
    <h2>Xác nhận hủy dịch vụ</h2>
    <p className={cx('subtitle')}>Vui lòng lưu ý các điều khoản khi thực hiện hủy đặt chỗ.</p>
    
    <div className={cx('policy-card')}>
        <div className={cx('policy-item')}>
            <div className={cx('dot', 'danger')}></div>
            <span>Dịch vụ này <strong>không hỗ trợ hoàn tiền</strong> sau khi đã thanh toán thành công.</span>
        </div>
        <div className={cx('policy-item')}>
            <div className={cx('dot', 'warning')}></div>
            <span>Mã đặt chỗ này sẽ bị thu hồi và <strong>không thể khôi phục</strong> lại.</span>
        </div>
        <div className={cx('policy-item')}>
            <div className={cx('dot', 'info')}></div>
            <span>Vị trí của bạn sẽ được mở công khai cho các khách hàng khác đặt chỗ.</span>
        </div>
    </div>

    <div className={cx('info-note')}>
        <FontAwesomeIcon icon={faInfoCircle} />
        <span>Bằng việc nhấn "Xác nhận", bạn đồng ý với các quy định trên.</span>
    </div>

    <div className={cx('action-grid')}>
        <button className={cx('outline-btn')} onClick={() => setStep(1)}>Quay lại</button>
        <button className={cx('danger-btn')} onClick={handleConfirmCancel} disabled={loading}>
            {loading ? <span className={cx('loader')}></span> : 'Tôi hiểu và xác nhận hủy'}
        </button>
    </div>
</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CancelBookingModal;
// src/components/BookingList/ReviewModal.tsx

import React, { useState } from 'react';
// 💥 SỬA ĐỔI: IMPORT HÀM SERVICE VÀ INTERFACE CẦN THIẾT
import { postReview } from '~/services/BookingService'; 
import { ReviewData } from '~/types/Booking';
import { BookingListType } from '~/types/Booking';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faTimes } from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames/bind";
import styles from './ReviewModal.module.scss'; 

const cx = classNames.bind(styles);

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: BookingListType;
    // Thêm prop này để kích hoạt refresh danh sách sau khi review thành công
    onReviewSuccess: () => void; 
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, booking, onReviewSuccess }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);
        setIsSubmitting(true);

        if (rating === 0) {
            setSubmitError('Vui lòng chọn số sao đánh giá.');
            setIsSubmitting(false);
            return;
        }

        try {
            const reviewData: ReviewData = { 
                rating, 
                comment 
            };
            
            // 💥 BƯỚC SỬ DỤNG SERVICE THẬT
            // Giả định booking.id có thể truy cập được từ booking object
            await postReview(booking.id, reviewData); 
            
            alert('Đánh giá của bạn đã được gửi thành công!');
            
            // Kích hoạt hàm callback để component cha (BookingList) refresh dữ liệu
            onReviewSuccess(); 
            onClose(); 
            
        } catch (error) {
            // Xử lý lỗi chi tiết hơn nếu cần, ở đây sử dụng thông báo lỗi chung
            setSubmitError('Lỗi gửi đánh giá. Vui lòng thử lại sau.');
            console.error('Submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Hộp rating (5 sao)
    const renderStars = () => {
        return [1, 2, 3, 4, 5].map((starValue) => (
            <FontAwesomeIcon
                key={starValue}
                icon={faStar}
                className={cx('star', { active: starValue <= rating, hover: starValue > rating })}
                onClick={() => setRating(starValue)}
            />
        ));
    };

    return (
        <div className={cx('modal-overlay')} onClick={onClose}>
            <div className={cx('modal-content')} onClick={(e) => e.stopPropagation()}>
                
                <div className={cx('modal-header')}>
                    <h2>Gửi đánh giá dịch vụ</h2>
                    <button className={cx('close-button')} onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <div className={cx('modal-body')}>
                    <p className={cx('room-title')}>Đánh giá cho: **{booking.workSpaceRoom.title}**</p>
                    <p className={cx('booking-code')}>Mã đặt chỗ: {booking.bookingCode}</p>

                    <form onSubmit={handleSubmit}>
                        <div className={cx('form-group')}>
                            <label>Chất lượng dịch vụ:</label>
                            <div className={cx('star-rating')}>
                                {renderStars()}
                            </div>
                        </div>

                        <div className={cx('form-group')}>
                            <label htmlFor="comment">Nhận xét của bạn (Không bắt buộc):</label>
                            <textarea
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={4}
                                placeholder="Hãy chia sẻ trải nghiệm của bạn..."
                            />
                        </div>

                        {submitError && <p className={cx('error-message')}>{submitError}</p>}
                        
                        <button type="submit" className={cx('submit-button')} disabled={isSubmitting || rating === 0}>
                            {isSubmitting ? 'Đang gửi...' : 'Gửi Đánh Giá'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
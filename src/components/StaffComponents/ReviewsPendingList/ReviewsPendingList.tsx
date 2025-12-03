// ReviewsPendingList.tsx (Đã sửa đổi)
import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faEye, faEyeSlash, faSpinner, faStar, faBan, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { getAllReviews, handleApproveReview, handleToggleVisibilityReview } from '~/services/StaffService'; 
import { ReviewsStaffView } from '~/types/Staff'; // Đảm bảo ReviewsStaffView được import đúng
import styles from './ReviewsPendingList.module.scss';
import { toast } from 'react-toastify';

const cx = classNames.bind(styles);

const MAX_REVIEWS_DISPLAY = 10; // Giới hạn hiển thị

const ReviewsPendingList: React.FC = () => {
    const [allReviews, setAllReviews] = useState<ReviewsStaffView[]>([]); // Lưu trữ tất cả reviews
    const [reviewsToDisplay, setReviewsToDisplay] = useState<ReviewsStaffView[]>([]); // Reviews hiển thị
    const [isLoading, setIsLoading] = useState(true);
    const [showAll, setShowAll] = useState(false); // Trạng thái xem tất cả

    // --- LOGIC FETCH DỮ LIỆU ---
    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            // Lấy tất cả reviews (bao gồm cả đã duyệt và chưa duyệt)
            const data: ReviewsStaffView[] = await getAllReviews();
            
            // Lọc ra các reviews cần quản lý (Ví dụ: Tất cả reviews)
            // Thay vì lọc pending, ta lấy TẤT CẢ để quản lý cả việc ẩn/hiện reviews đã duyệt.
            // Nếu bạn chỉ muốn quản lý những reviews CHƯA XÁC MINH, hãy sử dụng:
            // const reviewsToManage = data.filter(r => !r.isVerified);
            
            // Ở đây tôi chọn hiển thị tất cả reviews (đã/chưa duyệt) để Staff có thể toggle visibility
            setAllReviews(data);
            
            // Thiết lập reviews hiển thị ban đầu (<= MAX_REVIEWS_DISPLAY)
            setReviewsToDisplay(data.slice(0, MAX_REVIEWS_DISPLAY));
            
        } catch (error) {
            toast.error("Lỗi khi tải danh sách đánh giá.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchReviews();
    }, []);

    // Cập nhật reviews hiển thị khi allReviews hoặc showAll thay đổi
    useEffect(() => {
        if (showAll) {
            setReviewsToDisplay(allReviews);
        } else {
            setReviewsToDisplay(allReviews.slice(0, MAX_REVIEWS_DISPLAY));
        }
    }, [allReviews, showAll]);

    // --- LOGIC HÀNH ĐỘNG ---

    const handleApprove = async (id: number) => {
        if (window.confirm('Bạn có chắc muốn XÁC MINH (Approve) đánh giá này? Đánh giá sẽ được hiển thị công khai.')) {
            try {
                await handleApproveReview(id);
                toast.success('Đã xác minh và công khai đánh giá thành công!');
                fetchReviews(); // Tải lại danh sách
            } catch (error) {
                toast.error('Lỗi khi xác minh đánh giá.');
            }
        }
    };

    const handleToggleVisibility = async (id: number, isPublic: boolean) => {
        const action = isPublic ? 'Ẩn' : 'Hiện lại';
        if (window.confirm(`Bạn có chắc muốn ${action} đánh giá này?`)) {
            try {
                await handleToggleVisibilityReview(id);
                toast.success(`Đã ${action} đánh giá thành công!`);
                fetchReviews(); // Tải lại danh sách
            } catch (error) {
                toast.error(`Lỗi khi ${action} đánh giá.`);
            }
        }
    };

    // --- LOGIC RENDER ---

    if (isLoading) {
        return <div className={cx('loading')}><FontAwesomeIcon icon={faSpinner} spin /> Đang tải đánh giá...</div>;
    }

    if (allReviews.length === 0) {
        return <div className={cx('no-data')}>🎉 Không có đánh giá nào để quản lý.</div>;
    }

    return (
        <div className={cx('data-table-wrapper')}>
            <table className={cx('review-table')}>
                <thead>
                    <tr>
                        <th>Khách hàng</th>
                        <th>Workspace / Phòng</th>
                        <th>Đánh giá</th>
                        <th>Nội dung</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {reviewsToDisplay.map((review) => (
                        <tr key={review.id} className={cx({ 'is-public': review.isPublic, 'not-verified': !review.isVerified })}>
                            <td>{review.userName}</td>
                            <td>{review.workSpaceName} - {review.workSpaceRoomTitle}</td>
                            <td>
                                <span className={cx('rating-display', `rating-${Math.round(review.rating)}`)}>
                                    {Array.from({ length: review.rating }).map((_, i) => (
                                        <FontAwesomeIcon key={i} icon={faStar} />
                                    ))}
                                    ({review.rating})
                                </span>
                            </td>
                            <td className={cx('comment-cell')}>{review.comment}</td>
                            <td>
                                {/* Trạng thái chi tiết */}
                                {!review.isVerified && <span className={cx('status', 'pending')}>Chờ duyệt</span>}
                                {review.isVerified && review.isPublic && <span className={cx('status', 'public')}>Đã công khai</span>}
                                {review.isVerified && !review.isPublic && <span className={cx('status', 'hidden')}>Đã ẩn</span>}
                            </td>
                            <td>
                                {/* 1. Nút Duyệt (Chỉ hiện khi chưa được xác minh) */}
                                {!review.isVerified && (
                                    <button 
                                        className={cx('action-btn', 'approve')} 
                                        onClick={() => handleApprove(review.id)}
                                        title="Xác minh và công khai (Approve)"
                                    >
                                        <FontAwesomeIcon icon={faCheckCircle} /> Duyệt
                                    </button>
                                )}
                                
                                {/* 2. Nút Ẩn/Hiện (Luôn hiện sau khi được xác minh hoặc để Staff ẩn/hiện) */}
                                {review.isVerified && (
                                    <button 
                                        className={cx('action-btn', review.isPublic ? 'hide' : 'show')} 
                                        onClick={() => handleToggleVisibility(review.id, review.isPublic)}
                                        title={review.isPublic ? "Ẩn khỏi trang công khai" : "Hiển thị lại"}
                                    >
                                        <FontAwesomeIcon icon={review.isPublic ? faEyeSlash : faEye} /> {review.isPublic ? 'Ẩn' : 'Hiện'}
                                    </button>
                                )}
                                
                                {/* 3. Nút Xóa (Luôn hiện) */}
                                <button className={cx('action-btn', 'delete')} title="Xóa vĩnh viễn"><FontAwesomeIcon icon={faBan} /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {/* Nút Xem Thêm */}
            {allReviews.length > MAX_REVIEWS_DISPLAY && !showAll && (
                <div className={cx('view-more-container')}>
                    <button 
                        className={cx('view-more-btn')} 
                        onClick={() => setShowAll(true)}
                    >
                        Xem Thêm {allReviews.length - MAX_REVIEWS_DISPLAY} Đánh Giá Khác <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReviewsPendingList;
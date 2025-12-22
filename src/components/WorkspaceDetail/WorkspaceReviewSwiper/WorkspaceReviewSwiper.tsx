import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Navigation } from 'swiper/modules';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

import avar from '~/assets/img/avatar/user_avar.svg'
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import styles from './WorkspaceReviewSwiper.module.scss';
import { WorkspaceReview } from '~/types/WorkSpaces';
import { getWorkspaceReviews } from '~/services/WorkSpaceService';

const cx = classNames.bind(styles);

interface Props {
    workspaceId: number;
}

const WorkspaceReviewSwiper: React.FC<Props> = ({ workspaceId }) => {
    const [reviews, setReviews] = useState<WorkspaceReview[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const data = await getWorkspaceReviews(workspaceId);
                setReviews(data);
            } catch (error) {
                console.error("Error fetching reviews:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReviews();
    }, [workspaceId]);

    if (isLoading) return <div className={cx('loading')}>Đang tải đánh giá...</div>;
    if (reviews.length === 0) return null;

    return (
        <section className={cx('review-section')}>
            <div className={cx('header')}>
                <h3 className={cx('title')}>Khách hàng nói gì?</h3>
                <div className={cx('rating-summary')}>
                    <Star size={16} fill="#fbbf24" color="#fbbf24" />
                    <span>{reviews.length} đánh giá</span>
                </div>
            </div>

            <Swiper
                modules={[Pagination, Autoplay, Navigation]}
                spaceBetween={15}
                slidesPerView={1}
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                pagination={{ clickable: true, dynamicBullets: true }}
                className={cx('mySwiper')}
            >
                {reviews.map((review) => (
                    <SwiperSlide key={review.id}>
                        <div className={cx('review-card')}>
                            <Quote className={cx('quote-icon')} size={40} />
                            
                            <div className={cx('rating-stars')}>
                                {[...Array(5)].map((_, i) => (
                                    <Star 
                                        key={i} 
                                        size={14} 
                                        fill={i < review.rating ? "#fbbf24" : "none"} 
                                        color={i < review.rating ? "#fbbf24" : "#475569"} 
                                    />
                                ))}
                            </div>

                            <p className={cx('comment')}>"{review.comment}"</p>

                            <div className={cx('user-info')}>
                                <img 
                                    src={avar} 
                                    alt={review.reviewerName} 
                                    className={cx('avatar')}
                                />
                                <div className={cx('user-meta')}>
                                    <span className={cx('name')}>{review.reviewerName}</span>
                                    <span className={cx('room')}>Phòng: {review.roomName}</span>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
};

export default WorkspaceReviewSwiper;
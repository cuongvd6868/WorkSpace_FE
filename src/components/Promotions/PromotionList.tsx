import React, { useEffect, useState, useRef } from "react";
import classNames from "classnames/bind";
import styles from './PromotionList.module.scss';
import { Promotions } from "~/types/Promotions";
import { GetAllPromotions } from "~/services/PromotionService";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper'; 
import 'swiper/css';
import PromotionItem from '~/components/Promotions/PromotionItem/PromotionItem';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGift } from "@fortawesome/free-solid-svg-icons";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const cx = classNames.bind(styles);

const ChevronLeftIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z" fill="currentColor"/>
    </svg>
);
const ChevronRightIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.59 16.59L10 18L16 12L10 6L8.59 7.41L13.17 12L8.59 16.59Z" fill="currentColor"/>
    </svg>
);

const PromotionSkeleton: React.FC = () => (
    <div className={cx('promotion-slide-skeleton', 'shimmer-enabled')}>
        <SkeletonTheme baseColor="#EBEBEB" highlightColor="#F5F5F5">
            <div className={cx('skeleton-image')}>
                <Skeleton height={40} /> 
            </div>
            <div style={{ padding: '10px 0' }}>
                <Skeleton count={2} height={23} width="80%"/>
            </div>
        </SkeletonTheme>
    </div>
);

const LoadingSlider: React.FC = () => (
    <div className={cx('slider-container_loading')}>
        <div className={cx('promotion-slider-skeleton')}>
            <PromotionSkeleton />
            <PromotionSkeleton />
            <PromotionSkeleton />
        </div>
    </div>
);

const PromotionList: React.FC = () => {
    // Refs cho Navigation (Sửa lỗi querySelector)
    const prevRef = useRef<HTMLButtonElement>(null);
    const nextRef = useRef<HTMLButtonElement>(null);

    const [promotions, setPromotions] = useState<Promotions[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                setLoading(true);
                setError(null);
                // Giả định thời gian tải
                await new Promise(resolve => setTimeout(resolve, 800)); 
                const apiResponse = await GetAllPromotions();
                setPromotions(apiResponse);
            } catch (error) {
                console.log('lỗi khi lấy dữ liệu:', error);
                setError('Không tải được dữ liệu, vui lòng thử lại sau');
            } finally {
                setLoading(false);
            }
        };
        fetchPromotions();
    }, []);

    return (
        <div className={cx('wrapper')}>
            <div className={cx('promotion_header')}>
                <FontAwesomeIcon icon={faGift} className={cx('icon')}/>
                <h2 className={cx('title')}>Mã Ưu Đãi Tặng Khách Hàng</h2>
            </div>

            {loading ? (
                <LoadingSlider />
            ) : error ? (
                <div className={cx('status-message', 'error')}>{error}</div>
            ) : promotions.length === 0 ? (
                <div className={cx('status-message')}>Không có khuyến mãi nào.</div>
            ) : (
                <div className={cx('slider-container')}>
                    <Swiper
                        modules={[Navigation]}
                        spaceBetween={24} 
                        slidesPerView={3}
                        navigation={{
                            prevEl: prevRef.current,
                            nextEl: nextRef.current,
                        }}
                        onBeforeInit={(swiper: SwiperType) => {
                            if (swiper.params.navigation && typeof swiper.params.navigation !== 'boolean') {
                                swiper.params.navigation.prevEl = prevRef.current;
                                swiper.params.navigation.nextEl = nextRef.current;
                            }
                        }}
                        className={cx('promotion-slider')}
                        breakpoints={{
                            320: { slidesPerView: 1, spaceBetween: 16 },
                            768: { slidesPerView: 2, spaceBetween: 20 },
                            1024: { slidesPerView: 3, spaceBetween: 24 },
                        }}
                    >
                        {promotions.map((promo) => (
                            <SwiperSlide key={promo.id} className={cx('promotion-slide')}>
                                <PromotionItem promotion={promo} />
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    <button ref={prevRef} className={cx('nav-btn', 'prev-btn')}>
                        <ChevronLeftIcon />
                    </button>
                    <button ref={nextRef} className={cx('nav-btn', 'next-btn')}>
                        <ChevronRightIcon />
                    </button>
                </div>
            )}
        </div>
    );
}

export default PromotionList;
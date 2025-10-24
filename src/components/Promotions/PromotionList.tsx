import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from './PromotionList.module.scss';
import { Promotions } from "~/types/Promotions";
import { GetAllPromotions } from "~/services/PromotionService";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import PromotionItem from '~/components/Promotions/PromotionItem/PromotionItem';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGift } from "@fortawesome/free-solid-svg-icons";

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

const PromotionList: React.FC = () => {
    const [promotions, setPromotions] = useState<Promotions[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                setLoading(true);
                setError(null);
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

    if (loading) {
        return <div className={cx('wrapper', 'status-message')}>Đang tải khuyến mãi...</div>;
    }
    if (error) {
        return <div className={cx('wrapper', 'status-message', 'error')}>{error}</div>;
    }
    if (promotions.length === 0) {
        return <div className={cx('wrapper', 'status-message')}>Không có khuyến mãi nào.</div>;
    }

    return(
        <div className={cx('wrapper')}>
            <div className={cx('promotion_header')}>
                <FontAwesomeIcon icon={faGift} className={cx('icon')}/>
                <h2 className={cx('title')}>Mã Ưu Đãi Tặng Khách Hàng</h2>
            </div>
            <div className={cx('slider-container')}>
                <Swiper
                    modules={[Navigation]}
                    spaceBetween={24} 
                    slidesPerView={3}
                    navigation={{
                        nextEl: `.${cx('nav-btn')}.${cx('next-btn')}`,
                        prevEl: `.${cx('nav-btn')}.${cx('prev-btn')}`,
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

                <button className={cx('nav-btn', 'prev-btn')}>
                    <ChevronLeftIcon />
                </button>
                <button className={cx('nav-btn', 'next-btn')}>
                    <ChevronRightIcon />
                </button>
            </div>
        </div>
    );
}

export default PromotionList;
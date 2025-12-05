import React from "react";
import classNames from "classnames/bind";
import styles from './RecommendationCard.module.scss';
import { Recommendation } from '~/types/Chat';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarker, faUsers } from "@fortawesome/free-solid-svg-icons";
import { CLOUD_NAME } from "~/config/cloudinaryConfig";

interface RecommendationCardProps {
  recommendation: Recommendation;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const cx = classNames.bind(styles);

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  const {
    title,
    street,
    averagePricePerDay,
    minCapacity,
    maxCapacity,
    imageUrls,
    thumbnailUrl
  } = recommendation;

  return (
    <div className={cx('wrapper')}>
      
      {/* 1. Phần Ảnh (Trên cùng) */}
      <div className={cx('image-wrapper')}>
        {imageUrls && imageUrls.length > 0 ? (
          <img 
            src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${thumbnailUrl}`} 
            alt={title} 
            className={cx('image')} 
          />
        ) : (
          <div className={cx('image-placeholder')}>
            

[Image of Placeholder]

          </div>
        )}
      </div>

      {/* 2. Phần Nội dung (Dưới cùng) */}
      <div className={cx('content')}>
        
        {/* Tiêu đề */}
        <h3 className={cx('title')}>{title}</h3>
        
        {/* Giá */}
        <div className={cx('price-info')}>
            <span className={cx('price')}>{formatPrice(averagePricePerDay)}</span>
            <span className={cx('price-label')}>/ ngày</span>
        </div>
        
        {/* Chi tiết (Địa điểm & Sức chứa) */}
        <div className={cx('details')}>
          <div className={cx('detail-item')}>
            <span className={cx('icon')}><FontAwesomeIcon icon={faMapMarker}/></span> 
            <span className={cx('text')}>{street}</span>
          </div>
          <div className={cx('detail-item')}>
            <span className={cx('icon')}><FontAwesomeIcon icon={faUsers}/></span> 
            <span className={cx('text')}>{minCapacity} - {maxCapacity} người</span>
          </div>
        </div>
        
        {/* Nút hành động */}
        <button className={cx('action-button')}>
          Xem chi tiết 
          <span className={cx('arrow-icon')}>→</span>
        </button>
      </div>
    </div>
  );
};

export default RecommendationCard;
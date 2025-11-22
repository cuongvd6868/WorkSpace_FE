import React from "react";
import classNames from "classnames/bind";
import styles from './RecommendationCard.module.scss';
import { Recommendation } from '~/types/Chat'; 

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
    availableAmenities,
    imageUrls 
  } = recommendation;
  
  const displayAmenities = availableAmenities.slice(0, 4); // Hiển thị ít tiện nghi hơn
  const remainingAmenities = availableAmenities.length - displayAmenities.length;

  return (
    <div className={cx('wrapper')}>
      {/* 1. Hình ảnh */}
      <div className={cx('image-wrapper')}>
        {imageUrls && imageUrls.length > 0 ? (
          <img 
            src={imageUrls[0]} 
            alt={title} 
            className={cx('image')} 
          />
        ) : (
          <div className={cx('image-placeholder')}>
            



          </div>
        )}
        <div className={cx('image-overlay')}></div>
      </div>

      <div className={cx('content')}>
        {/* 2. Tiêu đề */}
        <h3 className={cx('title')}>{title}</h3>
        
        {/* 3. Chi tiết */}
        <div className={cx('details')}>
          <div className={cx('detail-item')}>
            <span className={cx('icon')}>📍</span> 
            <span className={cx('text')}>{street}</span>
          </div>
          <div className={cx('detail-item')}>
            <span className={cx('icon')}>👥</span> 
            <span className={cx('text')}>{minCapacity} - {maxCapacity} người</span>
          </div>
        </div>

        {/* 4. Giá */}
        <div className={cx('price-info')}>
            <span className={cx('price-label')}>Giá TB/ngày</span>
            <span className={cx('price')}>{formatPrice(averagePricePerDay)}</span>
        </div>

        {/* 5. Tiện nghi */}
        <div className={cx('amenities')}>
          <ul className={cx('amenities-list')}>
            {displayAmenities.map((amenity, index) => (
              <li key={index} className={cx('amenity-item')}>
                {amenity.name}
              </li>
            ))}
            {remainingAmenities > 0 && (
              <li className={cx('amenity-more')}>
                +{remainingAmenities}
              </li>
            )}
          </ul>
        </div>

        {/* 6. Nút hành động */}
        <button className={cx('action-button')}>
          Xem chi tiết 
          <span className={cx('arrow-icon')}>→</span>
        </button>
      </div>
    </div>
  );
};

export default RecommendationCard;
import React from "react";
import classNames from "classnames/bind";
import styles from './RecommendationCard.module.scss';
import { Recommendation } from '~/types/Chat';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMap, faMapMarker, faUser, faUsers } from "@fortawesome/free-solid-svg-icons";
import { CLOUD_NAME } from "~/config/cloudinaryConfig";
import { Link, useNavigate } from "react-router-dom";

interface RecommendationCardProps {
  recommendation: Recommendation;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const cx = classNames.bind(styles);

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  const {
    workSpaceId,
    title,
    street,
    description,
    minPricePerHour,
    minCapacity,
    maxCapacity,
    imageUrls,
    thumbnailUrl,
    hostName
  } = recommendation;

  const navigate = useNavigate();

const handleViewOnMap = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Chuyển sang trang map và truyền dữ liệu workspace hiện tại
    navigate('/map-view', {
        state: {
            // Chuyển đổi recommendation sang format mà trang Map yêu cầu (nếu cần)
            results: [{
                ...recommendation,
                id: workSpaceId, // Đảm bảo ID đồng nhất để Map dễ xử lý
            }],
            focusId: workSpaceId
        }
    });
};

  return (
    <div className={cx('wrapper')}>
      <div className={cx('card-container')}>
        <div className={cx('thumbnail')}>
          {imageUrls && imageUrls.length > 0 ? (
            <img 
              src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${thumbnailUrl}`} 
              alt={title} 
              className={cx('image')} 
            />
          ) : (
            <img src="" alt="" className={cx('image-placeholder')}/>
          )}
        </div>
        <div className={cx("desc")}>
<div 
    className={cx('map-container')} 
    onClick={handleViewOnMap} 
    style={{ cursor: 'pointer' }} // Thêm con trỏ tay để người dùng biết click được
>
    <FontAwesomeIcon icon={faMap} className={cx('map-icon')}/>
    <p className={cx('map-title')}>Xem trên bản đồ</p>
</div>
          <p className={cx('title')}>{title}</p>
          <p className={cx('sub-title')}>{description}</p>
          <div className={cx('price-container')}>
            <p className={cx('price-label')}>Giá chỉ từ :</p>
            <p className={cx('price')}>{formatPrice(minPricePerHour)}/giờ</p>
          </div>
          <div className={cx('card-bottom')}>
            <div className={cx('host-name_container')}>
              <FontAwesomeIcon icon={faUser}  className={cx('host-icon')}/>
              <p className={cx('host-name')}>{hostName}</p>
            </div>
            <Link to={`/workspace/${workSpaceId}`}>
              <button className={cx('see-more')}>Xem chi tiết</button>
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default RecommendationCard;
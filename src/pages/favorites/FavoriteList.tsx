import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from './FavoriteList.module.scss';
import { getFavoriteWorkSpaces, removeFromFavorites } from "~/services/WorkSpaceFavoriteService";
import { WorkSpaceSearch } from '~/types/Favorite'; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faHeart as solidHeart, 
    faTrashCan, 
    faLocationDot, 
    faBuilding, 
    faMoneyBillWave 
} from "@fortawesome/free-solid-svg-icons"; 
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons"; 
import { toast } from "react-toastify";
import { CLOUD_NAME } from "~/config/cloudinaryConfig";

const cx = classNames.bind(styles);

// Khôi phục interface và loại bỏ các trường giả định để phù hợp với logic ban đầu của bạn
interface FavoriteWorkSpaceItem extends WorkSpaceSearch {} 

// Hàm định dạng tiền tệ (Giữ lại để phục vụ giao diện)
const formatCurrency = (amount: number | undefined) => {
    // Giả định workSpace có trường minPrice (number) nếu bạn muốn hiển thị giá
    if (amount === undefined || amount === null) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
    }).format(amount);
};


const FavoriteList: React.FC = () => {
    // -----------------------------------------------------
    // LOGIC GỐC: KHÔNG THAY ĐỔI
    // -----------------------------------------------------
    const [favorites, setFavorites] = useState<FavoriteWorkSpaceItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFavorites = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // KHÔI PHỤC ĐOẠN CODE GỐC CỦA BẠN (với WorkSpaceSearch[]):
            const data = await getFavoriteWorkSpaces();
            setFavorites(data as unknown as FavoriteWorkSpaceItem[]);
            // Nếu muốn loại bỏ cảnh báo của IDE (mặc dù nó không sai logic):
            // const data = await getFavoriteWorkSpaces();
            // setFavorites(data as unknown as FavoriteWorkSpaceItem[]); 

        } catch (err: any) {
            setError(err.message || "Không thể tải danh sách yêu thích.");
            toast.error(err.message || "Lỗi khi tải danh sách yêu thích.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    const handleRemoveFavorite = async (workSpaceId: number, title: string) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa "${title}" khỏi danh sách yêu thích không?`)) {
            try {
                const message = await removeFromFavorites(workSpaceId);
                toast.success(message);
                setFavorites(prev => prev.filter(ws => ws.id !== workSpaceId));
            } catch (err: any) {
                toast.error(err.message || "Xóa khỏi danh sách yêu thích thất bại.");
            }
        }
    };
    // -----------------------------------------------------
    
    // -----------------------------------------------------
    // GIAO DIỆN MỚI (List View - 1 item/hàng)
    // -----------------------------------------------------
    
    if (isLoading) {
        return (
            <div className={cx('loading-wrapper')}>
                <div className={cx('spinner')}></div>
                <p>Đang tải danh sách không gian yêu thích...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={cx('error-message')}>
                <FontAwesomeIcon icon={faBuilding} className={cx('error-icon')} />
                <h2>Oops! Có lỗi xảy ra</h2>
                <p>Không thể tải danh sách yêu thích. Vui lòng thử lại sau.</p>
                <p className={cx('error-detail')}>Chi tiết: {error}</p>
            </div>
        );
    }

    if (favorites.length === 0) {
        return (
            <div className={cx('empty-state')}>
                <FontAwesomeIcon icon={regularHeart} size="5x" className={cx('empty-icon')} />
                <h2>Danh sách yêu thích đang trống</h2>
                <p>Hãy khám phá các không gian làm việc lý tưởng và nhấn nút <FontAwesomeIcon icon={solidHeart} className={cx('empty-state-heart')} /> để thêm vào đây!</p>
                <a href="/" className={cx('explore-link')}>Khám phá ngay</a>
            </div>
        );
    }

    return (
        <div className={cx('wrapper')}>
            <header className={cx('page-header')}>
                <FontAwesomeIcon icon={solidHeart} className={cx('header-icon')} /> 
                <h1 className={cx('header-title')}>Không Gian Yêu Thích Của Bạn</h1>
                <p className={cx('header-subtitle')}>Quản lý **{favorites.length}** địa điểm bạn đã lưu.</p>
            </header>
            
            <div className={cx('list-container')}>
                {favorites.map((workspace) => {
                    // Xử lý Cloudinary URL (Sử dụng lại logic xử lý ảnh từ code gốc của bạn)
                    const imageUrl = workspace.workSpaceImages?.[0]?.imageUrl || 'default-placeholder.jpg';
                    const fullImageUrl = imageUrl.includes('default-placeholder') 
                        ? '/images/default-placeholder.jpg' 
                        : `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_200,h_150,c_fill,q_auto:best,f_auto/${imageUrl}`;
                    
                    return (
                        <div key={workspace.id} className={cx('favorite-row')}>
                            
                            {/* 1. Image */}
                            <a href={`/workspace/${workspace.id}`} className={cx('row-image-link')}>
                                <div className={cx('row-image-wrap')}>
                                    <img 
                                        src={fullImageUrl} 
                                        alt={workspace.title} 
                                        className={cx('row-image')} 
                                        loading="lazy" 
                                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { 
                                            e.currentTarget.src = '/images/default-placeholder.jpg'; 
                                            e.currentTarget.onerror = null;
                                        }}
                                    />
                                </div>
                            </a>

                            {/* 2. Content */}
                            <div className={cx('row-content')}>
                                <h3 className={cx('row-title')}>
                                    <a href={`/workspace/${workspace.id}`}>{workspace.title}</a>
                                </h3>
                                
                                <p className={cx('row-description')}>{
                                    workspace.description 
                                    ? `${workspace.description.substring(0, 150)}...` 
                                    : 'Không có mô tả chi tiết.'
                                }</p>
                            </div>

                            {/* 3. Actions */}
                            <div className={cx('row-actions')}>
                                <a href={`/workspace/${workspace.id}`} className={cx('detail-btn')}>
                                    <FontAwesomeIcon icon={faBuilding} /> Xem Chi Tiết
                                </a>
                                <button 
                                    className={cx('remove-btn')}
                                    onClick={() => handleRemoveFavorite(workspace.id, workspace.title)}
                                    title="Bỏ yêu thích"
                                >
                                    <FontAwesomeIcon icon={faTrashCan} /> Xóa
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default FavoriteList;
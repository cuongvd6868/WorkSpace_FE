import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from './WorkSpaceSearchItem.module.scss';
import { WorkSpaceSearch } from "~/types/WorkSpaces";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faHeart, faMap } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { 
    getFavoriteWorkSpaceIds, 
    addToFavorites, 
    removeFromFavorites 
} from "~/services/WorkSpaceFavoriteService"; 
import { isToken } from "~/services/JwtService";
import { toast } from "react-toastify";
import { CLOUD_NAME } from "~/config/cloudinaryConfig";

interface WorkSpaceProp {
    workspace: WorkSpaceSearch;
}

const cx = classNames.bind(styles);

const WorkSpaceSearchItem: React.FC<WorkSpaceProp> = ({ workspace }) => {
    // State để theo dõi trạng thái yêu thích của item hiện tại
    const [isItemFavorite, setIsItemFavorite] = useState(false);
    const navigate = useNavigate();

    const handleDetailClick = (workspaceId: number) => {
        navigate(`/workspace/${workspaceId}`);
    };

    const handleViewOnMap = (e: React.MouseEvent) => {
        e.stopPropagation(); // Ngăn sự kiện lan ra các phần tử cha
        
        // Chuyển hướng đến trang map và truyền item hiện tại vào state để trang Map biết cần focus vào đâu
        navigate('/map-view', { 
            state: { 
                results: [workspace], // Truyền danh sách chỉ có 1 item hoặc toàn bộ tùy logic trang Map của bạn
                focusId: workspace.id 
            } 
        });
    };

    useEffect(() => {
        const fetchIdFavorite = async () => {
            if (!isToken()) {
                setIsItemFavorite(false);
                return;
            }

            try {
                const apiResponse = await getFavoriteWorkSpaceIds();
                if (apiResponse.includes(workspace.id)) {
                    setIsItemFavorite(true);
                } else {
                    setIsItemFavorite(false);
                }
            } catch (error) {
                console.log('Error fetching favorite status:', error);
                setIsItemFavorite(false); 
            }
        };
        fetchIdFavorite();
    }, [workspace.id]); // Chạy lại khi workSpace.id thay đổi

    const handleFavorite = async (e: React.MouseEvent) => {
        // Ngăn chặn sự kiện click lan truyền lên phần tử cha (nếu có)
        e.stopPropagation();
        e.preventDefault(); 

        if (!isToken()) {
            toast.info("Vui lòng đăng nhập để thêm vào danh sách yêu thích.");
            return;
        }

        try {
            if (isItemFavorite) {
                // Xóa khỏi yêu thích
                const message = await removeFromFavorites(workspace.id);
                setIsItemFavorite(false);
                toast.success(message);
            } else {
                // Thêm vào yêu thích
                const message = await addToFavorites(workspace.id);
                setIsItemFavorite(true);
                toast.success(message);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Đã xảy ra lỗi không mong muốn.";
            toast.error(errorMessage);
            console.error("Favorite operation failed:", error);
        }
    }



    return (
        <div className={cx('wrapper')}>
            <div className={cx('item')}>
                <div className={cx('thumb')}>
                    <img 
                        src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${workspace.thumbnailUrl}`} 
                        alt="" 
                        className={cx('thumb-img')}
                    />
                    <div className={cx('heart', { 'favorited': isItemFavorite })} onClick={handleFavorite}>
                        <FontAwesomeIcon icon={faHeart} className={cx('heart-icon')}/>
                    </div>
                </div>
                <div className={cx('description')}>
                    <div className={cx('description-top')}>
                        <div className={cx('left')}>
                            <h3 className={cx('title')}>{workspace.title}</h3>
                            <p className={cx('sub-title')}>
                                {workspace.street} <span style={{ margin: '0 1px', color: '#018294' }}>•</span> 
                                {workspace.ward} <span style={{ margin: '0 1px', color: '#018294' }}>•</span> 
                                Đà Nẵng
                            </p>
                            <p className={cx('desc')}>{workspace.description}</p>
                            <div className={cx('promotion-container')}>
                                <p className={cx('promotion')}>Ưu Đãi Trong Thời Gian Có Hạn</p>
                            </div>
                        </div>
                        <div className={cx('right')}>
                            <div className={cx('container')}>
                                <div>
                                    <p className={cx('review')}>Tuyệt hảo</p>
                                    <p className={cx('comment')}>168 đánh giá</p>
                                </div>
                                <div>
                                    <p className={cx('rate')}>10</p>
                                </div>
                            </div>
                            <p className={cx('review')}>Địa điểm 10</p>
                        </div>
                    </div>
                    <div className={cx('description-bottom')}>
                        <div className={cx('container')}>
                            <div className={cx('desc')}>
                                <FontAwesomeIcon icon={faCheck} className={cx('icon')}/>
                                <p>Miễn phí hủy</p>
                            </div>
<div className={cx('map')} onClick={handleViewOnMap} style={{ cursor: 'pointer' }}>
    <FontAwesomeIcon icon={faMap} className={cx('icon')}/>
    <p>Xem trên bản đồ</p>
</div>
                        </div>
                        <button className={cx('more-btn')} onClick={() => handleDetailClick(workspace.id)}>Xem chỗ trống</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkSpaceSearchItem;
import React, { useEffect, useState } from "react";
import styles from './WorkSpaceItem.module.scss';
import classNames from "classnames/bind";
import { WorkSpace } from "~/types/WorkSpaces";
import { Link } from "react-router-dom";
import { CLOUD_NAME } from "~/config/cloudinaryConfig";
import { addToFavorites, getFavoriteWorkSpaceIds, removeFromFavorites } from "~/services/WorkSpaceFavoriteService";
import { isToken } from "~/services/JwtService";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";

const cx = classNames.bind(styles);

type WorkSpaceItemProps = {
    workSpace: WorkSpace;
}

const WorkSpaceItem: React.FC<WorkSpaceItemProps> = ({ workSpace }) => {
    const [isItemFavorite, setIsItemFavorite] = useState(false);
    useEffect(() => {
        const fetchIdFavorite = async () => {
            if (!isToken()) {
                setIsItemFavorite(false);
                return;
            }

            try {
                const apiResponse = await getFavoriteWorkSpaceIds();
                if (apiResponse.includes(workSpace.id)) {
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
    }, [workSpace.id]);

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
                    const message = await removeFromFavorites(workSpace.id);
                    setIsItemFavorite(false);
                    toast.success(message);
                } else {
                    // Thêm vào yêu thích
                    const message = await addToFavorites(workSpace.id);
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
                <div className={cx('workspace_item')}>
                    {/* Image Section */}
                    <div className={cx('image_section')}>
                        <img 
                            src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${workSpace.thumbnailUrl}`}
                            alt={workSpace.title}
                            className={cx('workspace_image')}
                        />
                        <div className={cx('heart', { 'favorited': isItemFavorite })} onClick={handleFavorite}>
                            <FontAwesomeIcon icon={faHeart} className={cx('heart-icon')}/>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className={cx('content_section')}>
                        {/* Header */}
                        <Link to={`workspace/${workSpace.id}`}>
                            <div className={cx('header')}>
                                <h3 className={cx('title')}>{workSpace.title}</h3>
                            </div>
                        </Link>

                        {/* Description */}
                        <div className={cx('description_section')}>
                            <p className={cx('description')}>
                                {workSpace.description}
                            </p>
                            <p className={cx('promo')}>Ưu đãi có hạn</p>
                            
                        </div>
                    </div>
                </div>
        </div>
    )
}

export default WorkSpaceItem;
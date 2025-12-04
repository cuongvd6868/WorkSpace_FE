import React, { useState } from "react";
import styles from './WorkSpaceItem.module.scss';
import classNames from "classnames/bind";
import { WorkSpace } from "~/types/WorkSpaces";
import { Link } from "react-router-dom";
import { CLOUD_NAME } from "~/config/cloudinaryConfig";

const cx = classNames.bind(styles);

type WorkSpaceItemProps = {
    workSpace: WorkSpace;
}

const WorkSpaceItem: React.FC<WorkSpaceItemProps> = ({ workSpace }) => {


    return (
        <div className={cx('wrapper')}>
            <Link to={'/'}>
                <div className={cx('workspace_item')}>
                    {/* Image Section */}
                    <div className={cx('image_section')}>
                        <img 
                            src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${workSpace.thumbnailUrl}`}
                            alt={workSpace.title}
                            className={cx('workspace_image')}
                        />
                    </div>

                    {/* Content Section */}
                    <div className={cx('content_section')}>
                        {/* Header */}
                        <div className={cx('header')}>
                            <h3 className={cx('title')}>{workSpace.title}</h3>
                        </div>

                        {/* Description */}
                        <div className={cx('description_section')}>
                            <p className={cx('description')}>
                                {workSpace.description}
                            </p>
                            <p className={cx('promo')}>Ưu đãi có hạn</p>
                            
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    )
}

export default WorkSpaceItem;
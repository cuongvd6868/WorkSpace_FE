import React from "react";
import classNames from "classnames/bind";
import styles from './WorkSpaceSearchItem.module.scss';
import { WorkSpaceSearch } from "~/types/WorkSpaces";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faMap } from "@fortawesome/free-solid-svg-icons";

interface WorkSpaceProp {
    workspace: WorkSpaceSearch;
}

const cx = classNames.bind(styles);

const WorkSpaceSearchItem: React.FC<WorkSpaceProp> = ({ workspace }) => {
    return (
        <div className={cx('wrapper')}>
            <div className={cx('item')}>
                <div className={cx('thumb')}>
                    <img src="https://plus.unsplash.com/premium_photo-1684769161054-2fa9a998dcb6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1504" alt=""  className={cx('thumb-img')}/>
                </div>
                <div className={cx('description')}>
                    <div className={cx('description-top')}>
                        <div className={cx('left')}>
                            <h3 className={cx('title')}>{workspace.title}</h3>
                            <p className={cx('sub-title')}>{workspace.street} <span style={{ margin: '0 1px', color: '#018294' }}>•</span> {workspace.ward} <span style={{ margin: '0 1px', color: '#018294' }}>•</span> Đà Nẵng</p>
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
                                    <p className={cx('rate')}>9.2</p>
                                </div>
                            </div>
                            <p className={cx('review')}>Địa điểm 9.2</p>
                        </div>
                    </div>
                    <div className={cx('description-bottom')}>
                        <div className={cx('container')}>
                            <div className={cx('desc')}>
                                <FontAwesomeIcon icon={faCheck} className={cx('icon')}/>
                                <p>Miễn phí hủy</p>
                            </div>
                            <div className={cx('map')}>
                                <FontAwesomeIcon icon={faMap} className={cx('icon')}/>
                                <p>Xem trên bản đồ</p>
                            </div>
                        </div>
                        <button className={cx('more-btn')}>Xem chỗ trống</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkSpaceSearchItem;
    // id: number,
    // title: string,
    // description: string,
    // ward: string,
    // street: string,
    // hostName: string,
    // amenities?: string[],
    // latitude: number,
    // longitude: number
import React from "react";
import styles from './Banner.module.scss';
import classNames from "classnames/bind";
import banner_left from '~/assets/img/banner/banner_left.svg';
import banner_right from '~/assets/img/banner/banner_right.svg';
import vector from '~/assets/img/banner/rectangle.svg';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBriefcase } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";


const cx = classNames.bind(styles);

const Banner: React.FC = () => {
    return (
        <div className={cx('wrapper')}>
            <div className={cx('banner_container')}>
                <div className={cx('title_container')}>
                    <FontAwesomeIcon icon={faBriefcase} className={cx('icon')}/>
                    <h2>Không gian làm việc trong tầm tay</h2>
                </div>
                <p className={cx('desc')}>Tìm không gian, chọn giờ, xác nhận ngay. CSB lo mọi thứ để bạn tập trung vào công việc của mình.</p>
                <div className={cx('banner_list')}>
                    {/* item 1 */}
                    <div className={cx('banner_item')}>
                        <div className={cx('thumb_left')}>
                            <img src={banner_left} alt="thumbnail"/>
                        </div>
                        <h3 className={cx('benefit')}>Bạn chọn không gian, chúng tôi lo phần còn lại</h3>
                        <p className={cx('benefit_detail')}>Dù bạn đặt chỗ ở bất kỳ đâu, chúng tôi giúp bạn quản lý và sắp xếp không gian làm việc một cách tiện lợi nhất. Chỉ cần chọn địa điểm, gửi yêu cầu – phần còn lại để chúng tôi xử lý.</p>
                        <Link to={'/posts/20'}>
                            <div className={cx('more_info')}>
                                <a href="">Khám phá ngay</a>
                                <img src={vector} alt="vector" />
                            </div>
                        </Link>
                    </div>

                    <div className={cx('banner_item')}>
                        <div className={cx('thumb_right')}>
                            <img src={banner_right} alt="thumbnail"/>
                        </div>
                        <h3 className={cx('benefit')}>Đa dạng không gian cho mọi nhu cầu làm việc</h3>
                        <p className={cx('benefit_detail')}>Từ chỗ ngồi cá nhân yên tĩnh, phòng họp đầy đủ tiện nghi, bạn dễ dàng lựa chọn workspace phù hợp với quy mô đội nhóm, tính chất công việc và mục đích sử dụng.</p>
                        <Link to={'/posts/21'}>
                            <div className={cx('more_info')}>
                                <a href="">Khám phá ngay</a>
                                <img src={vector} alt="vector" />
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Banner
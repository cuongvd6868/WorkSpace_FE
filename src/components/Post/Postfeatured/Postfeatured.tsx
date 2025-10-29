import React from "react";
import classNames from "classnames/bind";
import styles from './Postfeatured.module.scss';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faNewspaper } from "@fortawesome/free-solid-svg-icons";

const cx = classNames.bind(styles);


const Postfeatured: React.FC = () => {
    return (
        <div className={cx('wrapper')}>
            <div className={cx('title_container')}>
                <FontAwesomeIcon icon={faNewspaper} className={cx('icon')}/>
                <h2>Bài viết nổi bật</h2>
            </div>
            <div className={cx('post_container')}>
                <h3>Hiện chưa có bài viết nổi bật nào</h3>
            </div>
        </div>
    )
}

export default Postfeatured;
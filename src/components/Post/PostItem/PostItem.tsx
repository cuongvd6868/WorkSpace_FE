import React from "react";
import classNames from "classnames/bind";
import styles from './PostItem.module.scss';
import { FeaturePost } from "~/types/Posts";
import checkImg from '~/assets/img/check/checkv1.svg';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDotCircle } from "@fortawesome/free-solid-svg-icons";


const cx = classNames.bind(styles);

interface postProp {
    post: FeaturePost;
}

const PostItem: React.FC<postProp> = ({post}) => {
    return (
        <div className={cx('wrapper')}>
            <div className={cx('thumb')}>
                <img src={post.imageData} alt="" className={cx('thumb-img')}/>
            </div>
            <div className={cx('sub-container')}>
                <h3 className={cx('title')}>{post.title}</h3>
                <div className={cx('info')}>
                    <img src={post.avatar} alt="" className={cx('avatar')}/>
                    <p className={cx('username')}>{post.userName}</p>
                    <img src={checkImg} alt="" className={cx('check')}/>
                </div>
            </div>
        </div>
    )
}

export default PostItem;
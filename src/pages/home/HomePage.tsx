import React from "react";
import classNames from "classnames/bind";
import styles from './HomePage.module.scss';
import LoadingSpinner from "~/components/LoadingSpinner/LoadingSpinner";
import PromotionList from "~/components/Promotions/PromotionList";


const cx = classNames.bind(styles);

const HomePage : React.FC = () => {
    return(
        <div className={cx('wrapper')}>
            <div className={cx('home')}>
                <PromotionList/>
            </div>
        </div>
    )
}

export default HomePage;
import React from "react";
import classNames from "classnames/bind";
import styles from './HomePage.module.scss';
import PromotionList from "~/components/Promotions/PromotionList";
import Banner from "~/components/Banner/Banner";
import WorkSpaceByType from "~/components/WorkSpaceType/WorkSpaceByType";


const cx = classNames.bind(styles);

const HomePage : React.FC = () => {
    return(
        <div className={cx('wrapper')}>
            <div className={cx('home')}>
                <PromotionList/>
                <Banner/>
                <WorkSpaceByType/>
            </div>
        </div>
    )
}

export default HomePage;
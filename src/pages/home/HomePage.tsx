import React from "react";
import classNames from "classnames/bind";
import styles from './HomePage.module.scss';
import PromotionList from "~/components/Promotions/PromotionList";
import Banner from "~/components/Banner/Banner";
import WorkSpaceByType from "~/components/WorkSpaceType/WorkSpaceByType";
import Reason from "~/components/Reason/Reason";
import Postfeatured from "~/components/Post/Postfeatured/Postfeatured";


const cx = classNames.bind(styles);

const HomePage : React.FC = () => {
    return(
        <div className={cx('wrapper')}>
            <div className={cx('home')}>
                <PromotionList/>
                <Banner/>
                <WorkSpaceByType/>
                <Reason/>
                <Postfeatured/>
            </div>
        </div>
    )
}

export default HomePage;
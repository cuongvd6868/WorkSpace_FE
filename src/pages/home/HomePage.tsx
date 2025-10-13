import React from "react";
import classNames from "classnames/bind";
import styles from './HomePage.module.scss';
import LoadingSpinner from "~/components/LoadingSpinner/LoadingSpinner";


const cx = classNames.bind(styles);

const HomePage : React.FC = () => {
    return(
        <div className={cx('wrapper')}>
            <div className={cx('home')}>
                {/* <LocationList/> */}
                <LoadingSpinner/>
            </div>
        </div>
    )
}

export default HomePage;
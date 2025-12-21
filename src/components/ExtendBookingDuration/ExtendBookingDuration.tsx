import React from "react";
import classNames from "classnames/bind";
import styles from './ExtendBookingDuration.module.scss';

const cx = classNames.bind(styles);

const ExtendBookingDuration: React.FC = () => {
    return (
        <div className={cx('container')}>
            <h1>Extend Booking Duration</h1>
        </div>
    )
}

export default ExtendBookingDuration;
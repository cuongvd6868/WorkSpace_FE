import React from "react";
import styles from './Popper.module.scss';
import classNames from "classnames/bind";

const cx = classNames.bind(styles);

interface PopperProps {
    children?: any;
    className?: string;
}

const Popper: React.FC<PopperProps> = ({children, className}) => {
    return (
        <div className={cx('wrapper', className)}> 
            {children}
        </div>
    )
}

export default Popper;
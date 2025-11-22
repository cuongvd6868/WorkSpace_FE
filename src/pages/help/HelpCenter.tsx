import React from "react";
import classNames from "classnames/bind";
import styles from './HelpCenter.module.scss';
import ChatComponent from "~/components/ChatComponent/ChatComponent";


const cx = classNames.bind(styles);

const HelpCenter: React.FC = () => {
    return (
        <div className={cx('wrapper')}>
            <ChatComponent/>
        </div>
    )
}
export default HelpCenter;
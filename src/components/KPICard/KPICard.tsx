import React from 'react';
import classNames from "classnames/bind";
import styles from './KPICard.module.scss';
// Font Awesome Imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

interface KPICardProps {
    title: string;
    value: string;
    change: string; // Ví dụ: "+12.5%" hoặc "-1.1%"
    icon: IconDefinition; // Sử dụng IconDefinition
    color: 'green' | 'blue' | 'purple' | 'red';
}

const KPICard: React.FC<KPICardProps> = ({ title, value, change, icon: faIcon, color }) => {
    // Xác định xem chỉ số tăng hay giảm để chọn màu cho phần trăm thay đổi
    const isPositive = change.startsWith('+');

    return (
        <div className={cx('kpi-card')}>
            <div className={cx('icon-container', color)}>
                {/* Sử dụng FontAwesomeIcon */}
                <FontAwesomeIcon icon={faIcon} /> 
            </div>
            <div className={cx('content')}>
                <div className={cx('title')}>{title}</div>
                <div className={cx('value')}>{value}</div>
                <div className={cx('change', { positive: isPositive, negative: !isPositive })}>
                    {change} so với tháng trước
                </div>
            </div>
        </div>
    );
};

export default KPICard;
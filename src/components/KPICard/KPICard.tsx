import React from 'react';
import classNames from "classnames/bind";
import styles from './KPICard.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

interface KPICardProps {
    title: string;
    value: string;
    change: string; 
    icon: IconDefinition; 
    color: 'green' | 'blue' | 'purple' | 'red';
}

const KPICard: React.FC<KPICardProps> = ({ title, value, change, icon: faIcon, color }) => {
    const isPositive = change.startsWith('+');

    return (
        <div className={cx('kpi-card')}>
            <div className={cx('icon-container', color)}>
                <FontAwesomeIcon icon={faIcon} /> 
            </div>
            <div className={cx('content')}>
                <div className={cx('title')}>{title}</div>
                <div className={cx('value')}>{value}</div>
                <div className={cx('change', { positive: isPositive, negative: !isPositive })}>
                    {change} 
                </div>
            </div>
        </div>
    );
};

export default KPICard;
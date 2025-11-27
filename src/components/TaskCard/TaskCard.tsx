import React from 'react';
import classNames from "classnames/bind";
import styles from './TaskCard.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

interface TaskCardProps {
    title: string;
    count: number;
    description: string; 
    icon: IconDefinition; 
    color: 'orange' | 'purple' | 'green' | 'blue';
}

const TaskCard: React.FC<TaskCardProps> = ({ title, count, description, icon: faIcon, color }) => {
    return (
        <div className={cx('task-card')}>
            <div className={cx('header-row')}>
                <div className={cx('icon-container', color)}>
                    <FontAwesomeIcon icon={faIcon} /> 
                </div>
                <div className={cx('count-display', color)}>{count}</div>
            </div>
            
            <div className={cx('content')}>
                <div className={cx('title')}>{title}</div>
                <div className={cx('description')}>{description}</div>
            </div>
        </div>
    );
};

export default TaskCard;
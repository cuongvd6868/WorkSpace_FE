import React from 'react';
import classNames from 'classnames/bind';
import styles from './LoadingSpinner.module.scss';

const cx = classNames.bind(styles);

interface LoadingSpinnerProps {
  fullPage?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullPage = false,
  size = 'medium',
  className,
}) => {
  return (
    <div className={cx('container', { 'full-page': fullPage }, className)}>
      <div className={cx('spinner', size)}>
        <div className={cx('dot', 'dot1')}></div>
        <div className={cx('dot', 'dot2')}></div>
        <div className={cx('dot', 'dot3')}></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
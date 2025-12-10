import React from 'react';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import styles from './Counter.module.scss';

const cx = classNames.bind(styles);

interface CounterProps {
    value: number; 
    min: number;   
    max?: number;  
    onChange: (newValue: number) => void; 
}

const Counter: React.FC<CounterProps> = ({ value, min, max, onChange }) => {

    const handleDecrement = () => {
        const newValue = value - 1;
        if (newValue >= min) {
            onChange(newValue);
        }
    };

    const handleIncrement = () => {
        const newValue = value + 1;
        if (max === undefined || newValue <= max) {
            onChange(newValue);
        }
    };
    
    const isMinusDisabled = value <= min;
    const isPlusDisabled = max !== undefined && value >= max;

    return (
        <div className={cx('counter-wrapper')}>
            <button 
                className={cx('control-button', { disabled: isMinusDisabled })}
                onClick={handleDecrement}
                disabled={isMinusDisabled}
            >
                <FontAwesomeIcon icon={faMinus} />
            </button>
            
            <span className={cx('value')}>{value}</span>
            
            <button
                className={cx('control-button', { disabled: isPlusDisabled })}
                onClick={handleIncrement}
                disabled={isPlusDisabled}
            >
                <FontAwesomeIcon icon={faPlus} />
            </button>
        </div>
    );
};

export default Counter;
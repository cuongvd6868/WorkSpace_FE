import React from "react";
import classNames from "classnames/bind";
import styles from './ComparisonBar.module.scss';
import { XCircle } from "lucide-react";


const cx = classNames.bind(styles)

interface ComparisonBarProps {
    roomsCount: number;
    onOpenModal: () => void;
    onClear: () => void;
}

const ComparisonBar: React.FC<ComparisonBarProps> = ({ roomsCount, onOpenModal, onClear }) => {
    if (roomsCount === 0) return null;

    return (
        <div className={cx('comparison-bar')}>
            <div className={cx('bar-content')}>
                <p>Đã chọn **{roomsCount}** phòng để so sánh.</p>
                <div className={cx('actions')}>
                    <button onClick={onOpenModal} className={cx('compare-now-button')}>
                        So Sánh Ngay ({roomsCount})
                    </button>
                    <button onClick={onClear} className={cx('clear-comparison-button')}>
                        Xóa <XCircle size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};
export default ComparisonBar;
import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import Counter from './Counter'; 
import styles from './MeetingParticipantPicker.module.scss';

const cx = classNames.bind(styles);

interface MeetingParticipantPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (participants: number) => void; 
    initialParticipants?: number;
}

const MeetingParticipantPicker: React.FC<MeetingParticipantPickerProps> = ({ 
    isOpen, 
    onClose, 
    onSelect,
    initialParticipants = 1
}) => {
    const [participants, setParticipants] = useState(initialParticipants);

    useEffect(() => {
        if (isOpen) {
            setParticipants(initialParticipants);
        }
    }, [isOpen, initialParticipants]);

    const MAX_PARTICIPANTS = 30;

    const handleDone = () => {
        onSelect(participants);
        onClose();
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className={cx('modal-overlay')} onClick={handleOverlayClick}>
            <div className={cx('wrapper')}>
                {/* Header */}
                <div className={cx('header')}>
                    <div className={cx('header-content')}>
                        <h2 className={cx('title')}>Số người tham gia</h2>
                        <p className={cx('subtitle')}>Chọn số lượng người tham gia cuộc họp</p>
                    </div>
                    <button className={cx('close-button')} onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>

                <div className={cx('content')}>
                    {/* Người tham gia */}
                    <div className={cx('section')}>
                        <div className={cx('section-header')}>
                            <div className={cx('section-info')}>
                                <span className={cx('label')}>Số người tham gia</span>
                                <span className={cx('description')}>Tổng số người sẽ tham gia cuộc họp</span>
                            </div>
                            <Counter 
                                min={1} 
                                max={MAX_PARTICIPANTS}
                                value={participants} 
                                onChange={setParticipants} 
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={cx('footer')}>
                    <div className={cx('summary')}>
                        <span className={cx('summary-text')}>
                            {participants} người tham gia
                        </span>
                    </div>
                    <button className={cx('done-button')} onClick={handleDone}>
                        <span>Xác nhận</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MeetingParticipantPicker;
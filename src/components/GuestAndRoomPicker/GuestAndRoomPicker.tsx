import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import Counter from './Counter'; 
import styles from './GuestAndRoomPicker.module.scss';

const cx = classNames.bind(styles);

interface GuestAndRoomPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (adults: number, children: number, rooms: number) => void; 
    initialAdults?: number;
    initialChildren?: number;
    initialRooms?: number;
}

const GuestAndRoomPicker: React.FC<GuestAndRoomPickerProps> = ({ 
    isOpen, 
    onClose, 
    onSelect,
    initialAdults = 1,
    initialChildren = 0,
    initialRooms = 1
}) => {
    const [adults, setAdults] = useState(initialAdults);
    const [children, setChildren] = useState(initialChildren);
    const [rooms, setRooms] = useState(initialRooms);
    const [pets, setPets] = useState(false);
    const [childAges, setChildAges] = useState<number[]>([]);

    // Cập nhật tuổi trẻ em khi số lượng trẻ em thay đổi
    useEffect(() => {
        if (isOpen) {
            setAdults(initialAdults);
            setChildren(initialChildren);
            setRooms(initialRooms);
            
            // Khởi tạo tuổi mặc định cho trẻ em
            const newChildAges = Array(initialChildren).fill(0);
            setChildAges(newChildAges);
        }
    }, [isOpen, initialAdults, initialChildren, initialRooms]);

    // Cập nhật mảng tuổi khi số trẻ em thay đổi
    useEffect(() => {
        if (children > childAges.length) {
            // Thêm tuổi mặc định cho trẻ em mới
            setChildAges(prev => [...prev, ...Array(children - prev.length).fill(0)]);
        } else if (children < childAges.length) {
            // Xóa tuổi của trẻ em bị bớt đi
            setChildAges(prev => prev.slice(0, children));
        }
    }, [children]);

    const handleAgeChange = (index: number, age: number) => {
        const newAges = [...childAges];
        newAges[index] = age;
        setChildAges(newAges);
    };

    const MAX_GUESTS = 30; 
    const MAX_ROOMS = 10;
    const totalGuests = adults + children;

    const handleDone = () => {
        onSelect(adults, children, rooms);
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
                        <h2 className={cx('title')}>Khách và Phòng</h2>
                        <p className={cx('subtitle')}>Chọn số lượng khách và phòng phù hợp</p>
                    </div>
                    <button className={cx('close-button')} onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>

                <div className={cx('content')}>
                    {/* Người lớn */}
                    <div className={cx('section')}>
                        <div className={cx('section-header')}>
                            <div className={cx('section-info')}>
                                <span className={cx('label')}>Người lớn</span>
                                <span className={cx('description')}>Từ 18 tuổi trở lên</span>
                            </div>
                            <Counter 
                                min={1} 
                                max={MAX_GUESTS - children}
                                value={adults} 
                                onChange={setAdults} 
                            />
                        </div>
                    </div>

                    {/* Trẻ em */}
                    <div className={cx('section')}>
                        <div className={cx('section-header')}>
                            <div className={cx('section-info')}>
                                <span className={cx('label')}>Trẻ em</span>
                                <span className={cx('description')}>Từ 0 - 17 tuổi</span>
                            </div>
                            <Counter 
                                min={0} 
                                max={MAX_GUESTS - adults}
                                value={children} 
                                onChange={setChildren} 
                            />
                        </div>
                        
                        {/* Selector tuổi trẻ em */}
                        {children > 0 && (
                            <div className={cx('age-selectors')}>
                                <div className={cx('age-selectors-grid')}>
                                    {Array.from({ length: children }).map((_, index) => (
                                        <div key={index} className={cx('age-selector')}>
                                            <label className={cx('age-label')}>Tuổi trẻ {index + 1}</label>
                                            <select 
                                                value={childAges[index] || 0}
                                                onChange={(e) => handleAgeChange(index, parseInt(e.target.value))}
                                                className={cx('age-select')}
                                            >
                                                {Array.from({ length: 18 }).map((_, age) => (
                                                    <option key={age} value={age}>
                                                        {age === 0 ? 'Dưới 1 tuổi' : `${age} tuổi`}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Phòng */}
                    <div className={cx('section')}>
                        <div className={cx('section-header')}>
                            <div className={cx('section-info')}>
                                <span className={cx('label')}>Phòng</span>
                                <span className={cx('description')}>Số phòng bạn cần</span>
                            </div>
                            <Counter 
                                min={1} 
                                max={MAX_ROOMS} 
                                value={rooms} 
                                onChange={setRooms} 
                            />
                        </div>
                    </div>

                    {/* Thú cưng */}
                    <div className={cx('section', 'pets-section')}>
                        <div className={cx('section-header')}>
                            <div className={cx('section-info')}>
                                <span className={cx('label')}>Mang theo thú cưng</span>
                                <span className={cx('description')}>
                                    Động vật hỗ trợ không được tính là thú cưng
                                </span>
                            </div>
                            <label className={cx('toggle')}>
                                <input 
                                    type="checkbox" 
                                    checked={pets} 
                                    onChange={() => setPets(!pets)} 
                                />
                                <span className={cx('toggle-slider')}></span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={cx('footer')}>
                    <div className={cx('summary')}>
                        <span className={cx('summary-text')}>
                            {totalGuests} khách • {rooms} phòng
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

export default GuestAndRoomPicker;
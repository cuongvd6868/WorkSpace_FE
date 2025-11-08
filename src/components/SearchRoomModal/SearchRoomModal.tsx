import React, { useState } from 'react';
import styles from './SearchRoomModal.module.scss';
import classNames from 'classnames/bind';
import { X, Search, CalendarCheck, Clock, Users, Loader2, RefreshCcw } from 'lucide-react'; 
import DatePicker from 'react-datepicker'; 
import 'react-datepicker/dist/react-datepicker.css'; 
import { format } from 'date-fns'; 

// Vẫn giữ import này (cần nếu có)
import { RoomSearchParams } from '~/services/WorkSpaceRoomService'; 
import { toast } from 'react-toastify';

const cx = classNames.bind(styles);

// --- Interface KHÔNG ĐỔI ---
interface SearchParamsOutput {
    startTime: string; 
    endTime: string;    
    capacity: number;
}

interface SearchRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (params: SearchParamsOutput) => void;
    onClear: () => void;
    isLoading: boolean;
}
// --------------------------------------------------------

/**
 * Hàm helper để lấy thời điểm cuối ngày (23:59:59)
 * Dùng để giới hạn maxTime cho DatePicker khi chọn cùng ngày.
 */
const getEndOfDay = (date: Date): Date => {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return end;
};


const SearchRoomModal: React.FC<SearchRoomModalProps> = ({
    isOpen,
    onClose,
    onSearch,
    onClear,
    isLoading
}) => {
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [capacity, setCapacity] = useState(1);

    const formatDateTime = (date: Date | null): string => {
        if (!date) return '';
        return format(date, "yyyy-MM-dd'T'HH:mm");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!startDate || !endDate) {
            alert("Vui lòng chọn ngày giờ bắt đầu và kết thúc.");
            return;
        }
        if (startDate >= endDate) { 
            toast.info('Thời gian kết thúc phải sau thời gian bắt đầu.');
            return;
        }

        onSearch({
            startTime: formatDateTime(startDate),
            endTime: formatDateTime(endDate),
            capacity: Number(capacity) || 1
        });
    };

    const handleClear = () => {
        setStartDate(null);
        setEndDate(null);
        setCapacity(1);
        onClear(); 
        onClose(); 
    };

    if (!isOpen) return null; 

    return (
        <div className={cx('modalOverlay')} onClick={onClose}>
            <div className={cx('modalContent')} onClick={(e) => e.stopPropagation()}>
                
                {/* Header */}
                <div className={cx('modalHeader')}>
                    <h2 className={cx('modalTitle')}>
                        <Search size={24} className={cx('titleIcon')} />
                        Tìm Kiếm Phòng Trống 
                    </h2>
                    <button className={cx('modalCloseButton')} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className={cx('modalBody')}>
                    <form className={cx('searchForm')} onSubmit={handleSubmit}>
                        <div className={cx('formGrid')}>
                            
                            {/* START TIME */}
                            <div className={cx('formGroup', 'startTimeGroup')}>
                                <label htmlFor="start-time" className={cx('inputLabel')}>
                                    <CalendarCheck size={16} /> Thời gian bắt đầu
                                </label>
                                <DatePicker
                                    selected={startDate}
                                    onChange={(date: Date | null) => setStartDate(date)} 
                                    showTimeSelect
                                    dateFormat="dd/MM/yyyy HH:mm"
                                    minDate={new Date()}
                                    className={cx('inputField')} 
                                    placeholderText="Chọn ngày giờ bắt đầu"
                                    required
                                    popperClassName={cx('customDatePopper')}
                                />
                            </div>

                            {/* END TIME */}
                            <div className={cx('formGroup', 'endTimeGroup')}>
                                <label htmlFor="end-time" className={cx('inputLabel')}>
                                    <Clock size={16} /> Thời gian kết thúc
                                </label>
                                <DatePicker
                                    selected={endDate}
                                    onChange={(date: Date | null) => setEndDate(date)} 
                                    showTimeSelect
                                    dateFormat="dd/MM/yyyy HH:mm"
                                    // Không cho chọn ngày trước ngày bắt đầu
                                    minDate={startDate || new Date()} 
                                    
                                    // LOGIC SỬA LỖI minTime/maxTime: Yêu cầu cả hai prop khi giới hạn giờ
                                    minTime={
                                        (startDate && endDate && startDate.toDateString() === endDate.toDateString())
                                        ? startDate 
                                        : undefined 
                                    }
                                    maxTime={
                                        (startDate && endDate && startDate.toDateString() === endDate.toDateString())
                                        ? getEndOfDay(endDate) 
                                        : undefined 
                                    }
                                    // END LOGIC SỬA LỖI

                                    className={cx('inputField')}
                                    placeholderText="Chọn ngày giờ kết thúc"
                                    required
                                    popperClassName={cx('customDatePopper')}
                                />
                            </div>
                            
                            {/* Số người */}
                            <div className={cx('formGroup', 'capacityGroup')}>
                                <label htmlFor="capacity" className={cx('inputLabel')}>
                                    <Users size={16} /> Số lượng người
                                </label>
                                <input
                                    id="capacity"
                                    type="number"
                                    min="1"
                                    value={capacity}
                                    onChange={(e) => setCapacity(Number(e.target.value))}
                                    required
                                    className={cx('inputField', 'capacityInput')}
                                />
                            </div>

                            {/* Nút bấm */}
                            <div className={cx('formActions')}>
                                <button 
                                    type="submit" 
                                    className={cx('actionButton', 'searchButton')} 
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <Loader2 size={18} className={cx('buttonLoader')} />
                                    ) : (
                                        <Search size={18} />
                                    )}
                                    Tìm Phòng
                                </button>
                                <button 
                                    type="button" 
                                    className={cx('actionButton', 'clearButton')} 
                                    onClick={handleClear}
                                    disabled={isLoading}
                                >
                                    <RefreshCcw size={18} /> 
                                    Đặt Lại
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SearchRoomModal;
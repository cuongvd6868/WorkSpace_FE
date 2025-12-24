import React, { useState, useEffect } from 'react';
import styles from './SearchRoomModal.module.scss';
import classNames from 'classnames/bind';
import { X, Search, Clock, Users, Loader2, RefreshCcw } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { CalendarCheck } from 'lucide-react'; 

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

// --- HẰNG SỐ CỐ ĐỊNH (Chỉ cần cho logic lịch) ---
const WEEK_DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'CN', 'T7']; // Sửa lại T7/CN
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

// Kiểm tra ngày có thể chọn được (không cho chọn ngày đã qua)
const isDateSelectable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate >= today;
};

const generateCalendar = (month: Date) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; 
    
    const startDay = new Date(firstDay);
    startDay.setDate(firstDay.getDate() - firstDayOfWeek);
    
    const calendar = [];
    const currentDate = new Date(startDay);
    
    while (calendar.length < 42) {
        calendar.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return calendar;
};

const SearchRoomModal: React.FC<SearchRoomModalProps> = ({
    isOpen,
    onClose,
    onSearch,
    onClear,
    isLoading
}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null); // Chỉ cần 1 ngày
    const [capacity, setCapacity] = useState(1);
    const [startTime, setStartTime] = useState({ hour: 9, minute: 0 });
    const [endTime, setEndTime] = useState({ hour: 17, minute: 0 });

    useEffect(() => {
        if (isOpen) {
            if (!selectedDate) {
                setSelectedDate(new Date());
            }
            setCurrentMonth(new Date());
            setCapacity(1);
            setStartTime({ hour: 9, minute: 0 });
            setEndTime({ hour: 17, minute: 0 });
        }
    }, [isOpen]);

    const formatDateTime = (date: Date | null): string => {
        if (!date) return '';
        return format(date, "yyyy-MM-dd'T'HH:mm"); 
    };

    const handleDateClick = (date: Date) => {
        if (!isDateSelectable(date)) return;
        setSelectedDate(date);
    };
    
    const handleQuickTimeSelect = (startHour: number, endHour: number) => {
        setStartTime({ hour: startHour, minute: 0 });
        setEndTime({ hour: endHour, minute: 0 });
    };

    const navigateMonth = (direction: number) => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(currentMonth.getMonth() + direction);
        
        const today = new Date();
        today.setDate(1);
        today.setHours(0, 0, 0, 0);
        
        if (direction === -1) {
            if (newMonth.getFullYear() < today.getFullYear() || (newMonth.getFullYear() === today.getFullYear() && newMonth.getMonth() < today.getMonth())) {
                return;
            }
        }
        setCurrentMonth(newMonth);
    };

    const isDateSelected = (date: Date) => {
        return selectedDate?.toDateString() === date.toDateString();
    };

    const handleCapacityChange = (delta: number) => {
        setCapacity(prev => {
            const newValue = prev + delta;
            return newValue < 1 ? 1 : newValue; // Không cho phép nhỏ hơn 1
        });
    };

    const formatTimeDisplay = () => {
        if (!selectedDate) return "Chọn ngày trước";
        
        const startStr = `${startTime.hour.toString().padStart(2, '0')}:${startTime.minute.toString().padStart(2, '0')}`;
        const endStr = `${endTime.hour.toString().padStart(2, '0')}:${endTime.minute.toString().padStart(2, '0')}`;
        
        return `${startStr} - ${endStr}`;
    };

    const currentMonthCalendar = generateCalendar(currentMonth);
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(currentMonth.getMonth() + 1);
    const nextMonthCalendar = generateCalendar(nextMonth);

    const canSearch = selectedDate !== null && 
        capacity >= 1 && 
        (endTime.hour > startTime.hour || 
        (endTime.hour === startTime.hour && endTime.minute > startTime.minute));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!canSearch) {
            toast.error("Vui lòng chọn ngày, thời gian hợp lệ và số người > 0.");
            return;
        }

        let startDateTime: Date;
        let endDateTime: Date;
        
        const selectedDateFinal = selectedDate!;
        
        startDateTime = new Date(selectedDateFinal);
        startDateTime.setHours(startTime.hour, startTime.minute, 0, 0);
        
        endDateTime = new Date(selectedDateFinal);
        endDateTime.setHours(endTime.hour, endTime.minute, 0, 0);

        if (startDateTime < new Date()) {
            toast.error("Thời gian bắt đầu không thể là thời điểm đã qua.");
            return;
        }

        onSearch({
            startTime: formatDateTime(startDateTime),
            endTime: formatDateTime(endDateTime),
            capacity: Number(capacity) || 1
        });
    };

    const handleClear = () => {
        setSelectedDate(null);
        setCurrentMonth(new Date());
        setCapacity(1);
        setStartTime({ hour: 9, minute: 0 });
        setEndTime({ hour: 17, minute: 0 });
        onClear(); 
        onClose(); 
    };

    if (!isOpen) return null; 

    return (
        <div className={cx('modalOverlay')} onClick={onClose}>
            {/* Sử dụng :global(.is-open) để điều khiển transition CSS */}
            <div className={cx('modalContent')} onClick={(e) => e.stopPropagation()}>
                <form className={cx('searchForm')} onSubmit={handleSubmit}>
                    
                    {/* Header */}
                    <div className={cx('modalHeader')}>
                        <h2 className={cx('modalTitle')}>
                            <Search size={24} className={cx('titleIcon')} />
                            Tìm Kiếm Phòng Trống (Theo Giờ) 
                        </h2>
                        <button type="button" className={cx('modalCloseButton')} onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className={cx('modalBody')}>
                        
                        {/* Selected Date & Time Display & Capacity */}
                        <div className={cx('info-grid')}>
                            <div className={cx('selection-display')}>
                                <div className={cx('selected-info')}>
                                    <span className={cx('label')}>Ngày & giờ:</span>
                                    <span className={cx('value', { placeholder: selectedDate === null })}>
                                        {selectedDate ? (
                                            <>
                                                {selectedDate.toLocaleDateString('vi-VN', { 
                                                     weekday: 'long', day: '2-digit', month: '2-digit' 
                                                 })} • **{formatTimeDisplay()}**
                                            </>
                                        ) : (
                                            `Chưa chọn ngày`
                                        )}
                                    </span>
                                </div>
                            </div>

{/* Số người */}
<div className={cx('formGroup', 'capacityGroup')}>
    <label htmlFor="capacity" className={cx('inputLabel')}>
        <Users size={16} /> Số lượng người
    </label>
    <div className={cx('capacity-control')}>
        <button 
            type="button" 
            className={cx('capacity-btn')}
            onClick={() => handleCapacityChange(-1)}
            disabled={capacity <= 1}
        >
            −
        </button>
        <input
            id="capacity"
            type="number"
            min="1"
            value={capacity}
            onChange={(e) => {
                const val = parseInt(e.target.value);
                setCapacity(isNaN(val) || val < 1 ? 1 : val);
            }}
            required
            className={cx('inputField', 'capacityInput')}
        />
        <button 
            type="button" 
            className={cx('capacity-btn')}
            onClick={() => handleCapacityChange(1)}
        >
            +
        </button>
    </div>
</div>
                        </div>

                        {/* Quick Selection */}
                        <div className={cx('quick-selection')}>
                            <h3 className={cx('section-title')}>Chọn nhanh khoảng giờ</h3>
                            <div className={cx('quick-options')}>
                                {/* Các nút chọn nhanh theo giờ được giữ nguyên */}
                                <button type="button" className={cx('quick-option')} onClick={() => handleQuickTimeSelect(8, 12)} disabled={selectedDate === null}>
                                    Sáng (8:00-12:00)
                                </button>
                                <button type="button" className={cx('quick-option')} onClick={() => handleQuickTimeSelect(13, 18)} disabled={selectedDate === null}>
                                    Chiều (13:00-18:00)
                                </button>
                            </div>
                        </div>

                        {/* Time Picker (Đã loại bỏ điều kiện hiển thị vì đây là mode mặc định) */}
                        <div className={cx('time-picker-section')}>
                            <h3 className={cx('section-title')}>Chọn giờ chi tiết</h3>
                            <div className={cx('time-picker')}>
                                {/* Start Time */}
                                <div className={cx('time-input-group')}>
                                    <label className={cx('time-label')}>Bắt đầu</label>
                                    <div className={cx('time-selectors')}>
                                        <select 
                                            value={startTime.hour}
                                            onChange={(e) => setStartTime(prev => ({ ...prev, hour: parseInt(e.target.value) }))}
                                            className={cx('time-select')}
                                            disabled={selectedDate === null}
                                        >
                                            {HOURS.map(hour => (
                                                <option key={`start-hour-${hour}`} value={hour}>
                                                    {hour.toString().padStart(2, '0')}
                                                </option>
                                            ))}
                                        </select>
                                        <span className={cx('time-separator')}>:</span>
                                        <select 
                                            value={startTime.minute}
                                            onChange={(e) => setStartTime(prev => ({ ...prev, minute: parseInt(e.target.value) }))}
                                            className={cx('time-select')}
                                            disabled={selectedDate === null}
                                        >
                                            {MINUTES.map(minute => (
                                                <option key={`start-minute-${minute}`} value={minute}>
                                                    {minute.toString().padStart(2, '0')}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* <div className={cx('time-to')}>đến</div> */}

                                {/* End Time */}
                                <div className={cx('time-input-group')}>
                                    <label className={cx('time-label')}>Kết thúc</label>
                                    <div className={cx('time-selectors')}>
                                        <select 
                                            value={endTime.hour}
                                            onChange={(e) => setEndTime(prev => ({ ...prev, hour: parseInt(e.target.value) }))}
                                            className={cx('time-select')}
                                            disabled={selectedDate === null}
                                        >
                                            {HOURS.map(hour => (
                                                <option key={`end-hour-${hour}`} value={hour}>
                                                    {hour.toString().padStart(2, '0')}
                                                </option>
                                            ))}
                                        </select>
                                        <span className={cx('time-separator')}>:</span>
                                        <select 
                                            value={endTime.minute}
                                            onChange={(e) => setEndTime(prev => ({ ...prev, minute: parseInt(e.target.value) }))}
                                            className={cx('time-select')}
                                            disabled={selectedDate === null}
                                        >
                                            {MINUTES.map(minute => (
                                                <option key={`end-minute-${minute}`} value={minute}>
                                                    {minute.toString().padStart(2, '0')}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Calendar Section */}
                        <div className={cx('calendar-section')}>
                            <h3 className={cx('section-title')}>Chọn ngày</h3>
                            <div className={cx('calendar-nav')}>
                                <button type="button" className={cx('nav-button')} onClick={() => navigateMonth(-1)}>
                                    ‹
                                </button>
                                <div className={cx('month-display')}>
                                    <span>{currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}</span>
                                    <span>{nextMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}</span>
                                </div>
                                <button type="button" className={cx('nav-button')} onClick={() => navigateMonth(1)}>
                                    ›
                                </button>
                            </div>
                        </div>
                            
                        <div className={cx('calendars-grid')}>
                            {/* Calendar Views */}
                            {[currentMonthCalendar, nextMonthCalendar].map((calendar, calIndex) => (
                                <div key={calIndex} className={cx('calendar-view')}>
                                    <div className={cx('week-days')}>
                                        {WEEK_DAYS.map(day => (
                                            <div key={day} className={cx('week-day-cell')}>{day}</div>
                                        ))}
                                    </div>
                                    <div className={cx('days-grid')}>
                                        {calendar.map((date, index) => {
                                            const monthToCheck = calIndex === 0 ? currentMonth : nextMonth;
                                            const isCurrentDisplayMonth = date.getMonth() === monthToCheck.getMonth() && date.getFullYear() === monthToCheck.getFullYear();
                                            const isToday = new Date().toDateString() === date.toDateString();
                                            const selected = isDateSelected(date);
                                            const selectable = isDateSelectable(date) && isCurrentDisplayMonth; 

                                            return (
                                                <div
                                                    key={index}
                                                    className={cx(
                                                        'day-cell',
                                                        {
                                                            'other-month': !isCurrentDisplayMonth,
                                                            'today': isToday && isCurrentDisplayMonth, 
                                                            'selected': selected,
                                                            'selectable': selectable,
                                                            'disabled': !selectable,
                                                        }
                                                    )}
                                                    onClick={() => selectable && handleDateClick(date)}
                                                >
                                                    {date.getDate()}
                                                    {isToday && isCurrentDisplayMonth && <div className={cx('today-indicator')}></div>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer với nút Tìm kiếm */}
                    <div className={cx('modalFooter')}>
                        <div className={cx('action-buttons')}>
                            <button 
                                type="button" 
                                className={cx('actionButton', 'clearButton')} 
                                onClick={handleClear}
                                disabled={isLoading}
                            >
                                <RefreshCcw size={18} /> 
                                Đặt Lại
                            </button>
                            <button 
                                type="submit" 
                                className={cx('actionButton', 'searchButton')} 
                                disabled={isLoading || !canSearch}
                            >
                                {isLoading ? (
                                    <Loader2 size={18} className={cx('buttonLoader')} />
                                ) : (
                                    <Search size={18} />
                                )}
                                Tìm Phòng
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SearchRoomModal;
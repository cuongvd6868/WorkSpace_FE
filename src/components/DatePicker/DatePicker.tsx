import React, { useState } from "react";
import classNames from "classnames/bind";
import styles from './DatePicker.module.scss';

const cx = classNames.bind(styles);

interface DatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onDateSelect: (checkIn: Date | null, checkOut: Date | null) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ isOpen, onClose, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCheckIn, setSelectedCheckIn] = useState<Date | null>(null);
  const [selectedCheckOut, setSelectedCheckOut] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  if (!isOpen) return null;

  // Hàm tạo lịch cho một tháng cụ thể
  const generateCalendar = (month: Date) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    
    // Ngày đầu tiên của tháng
    const firstDay = new Date(year, monthIndex, 1);
    // Ngày cuối cùng của tháng
    const lastDay = new Date(year, monthIndex + 1, 0);
    
    // Ngày đầu tuần của tháng (có thể thuộc tháng trước)
    const startDay = new Date(firstDay);
    startDay.setDate(firstDay.getDate() - (firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1)); // Adjust for Monday start
    
    // Ngày cuối tuần của tháng (có thể thuộc tháng sau)
    const endDay = new Date(lastDay);
    endDay.setDate(lastDay.getDate() + (6 - (lastDay.getDay() === 0 ? 6 : lastDay.getDay() - 1))); // Adjust for Monday start
    
    const calendar = [];
    const currentDate = new Date(startDay);
    
    while (currentDate <= endDay) {
      calendar.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return calendar;
  };

  // Xử lý khi click vào ngày
  const handleDateClick = (date: Date) => {
    // Nếu chưa chọn check-in hoặc đã chọn cả check-in và check-out
    if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
      setSelectedCheckIn(date);
      setSelectedCheckOut(null);
    } else {
      // Nếu đã chọn check-in và đang chọn check-out
      if (date > selectedCheckIn) {
        setSelectedCheckOut(date);
      } else {
        // Nếu chọn ngày trước ngày check-in đã chọn
        setSelectedCheckIn(date);
        setSelectedCheckOut(null);
      }
    }
  };

  // Kiểm tra xem ngày có nằm trong khoảng được chọn không
  const isInSelectedRange = (date: Date) => {
    if (selectedCheckIn && selectedCheckOut) {
      return date > selectedCheckIn && date < selectedCheckOut;
    }
    
    // Kiểm tra khi đang hover để hiển thị preview range
    if (selectedCheckIn && hoverDate) {
      if (selectedCheckIn < hoverDate) {
        return date > selectedCheckIn && date < hoverDate;
      } else {
        // Trường hợp hover ngược từ sau ra trước (chọn check-in sau check-out)
        return date > hoverDate && date < selectedCheckIn;
      }
    }
    
    return false;
  };

  // Kiểm tra xem ngày có phải là ngày bắt đầu hoặc kết thúc không
  const isRangeEndpoint = (date: Date) => {
    const isSameDay = (d1: Date | null, d2: Date) => 
      d1 && d1.getDate() === d2.getDate() && 
      d1.getMonth() === d2.getMonth() && 
      d1.getFullYear() === d2.getFullYear();

    if (isSameDay(selectedCheckIn, date)) {
      return 'start';
    }
    
    if (isSameDay(selectedCheckOut, date)) {
      return 'end';
    }
    
    return null;
  };

  // Chuyển tháng
  const navigateMonth = (direction: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  // Lịch cho tháng hiện tại và tháng sau
  const currentMonthCalendar = generateCalendar(currentMonth);
  const nextMonth = new Date(currentMonth);
  nextMonth.setMonth(currentMonth.getMonth() + 1);
  const nextMonthCalendar = generateCalendar(nextMonth);

  // Các ngày trong tuần (viết tắt)
  // Đảm bảo thứ 2 là ngày đầu tuần
  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <div className={cx('date-picker-overlay')} onClick={onClose}>
      <div className={cx('date-picker-modal')} onClick={(e) => e.stopPropagation()}>
        <div className={cx('header')}>
          <h2 className={cx('header-title')}>Chọn ngày</h2>
          <button className={cx('close-button')} onClick={onClose}>
            <span className={cx('icon')}>&times;</span>
          </button>
        </div>
        
        <div className={cx('selection-summary')}>
          <div className={cx('summary-item')}>
            <span className={cx('label')}>Nhận phòng</span>
            <span className={cx('value')}>
              {selectedCheckIn ? selectedCheckIn.toLocaleDateString('vi-VI') : 'Chọn ngày'}
            </span>
          </div>
          <div className={cx('summary-separator')}><span>&ndash;</span></div>
          <div className={cx('summary-item')}>
            <span className={cx('label')}>Trả phòng</span>
            <span className={cx('value')}>
              {selectedCheckOut ? selectedCheckOut.toLocaleDateString('vi-VI') : 'Chọn ngày'}
            </span>
          </div>
        </div>
        
        <div className={cx('calendar-body')}>
          <div className={cx('calendar-nav')}>
            <button className={cx('nav-button', 'prev')} onClick={() => navigateMonth(-1)}>
              <span className={cx('icon')}>&lsaquo;</span>
            </button>
            <div className={cx('month-display')}>
              <span className={cx('month-title')}>
                {currentMonth.toLocaleDateString('vi-VI', { month: 'long', year: 'numeric' })}
              </span>
              <span className={cx('month-title')}>
                {nextMonth.toLocaleDateString('vi-VI', { month: 'long', year: 'numeric' })}
              </span>
            </div>
            <button className={cx('nav-button', 'next')} onClick={() => navigateMonth(1)}>
              <span className={cx('icon')}>&rsaquo;</span>
            </button>
          </div>
          
          <div className={cx('calendars-grid')}>
            {/* Lịch tháng đầu tiên */}
            <div className={cx('calendar-view')}>
              <div className={cx('week-days')}>
                {weekDays.map(day => (
                  <div key={day} className={cx('week-day')}>{day}</div>
                ))}
              </div>
              <div className={cx('days-grid')}>
                {currentMonthCalendar.map((date, index) => {
                  const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                  const isToday = new Date().toDateString() === date.toDateString();
                  const endpointType = isRangeEndpoint(date);
                  const inRange = isInSelectedRange(date);
                  
                  return (
                    <div
                      key={index}
                      className={cx(
                        'day-cell',
                        {
                          'other-month': !isCurrentMonth,
                          'today': isToday,
                          'selected-start': endpointType === 'start',
                          'selected-end': endpointType === 'end',
                          'in-range': inRange,
                          'selectable': isCurrentMonth // Chỉ cho phép chọn ngày trong tháng hiện tại
                        }
                      )}
                      onClick={() => isCurrentMonth && handleDateClick(date)}
                      onMouseEnter={() => isCurrentMonth && setHoverDate(date)}
                      onMouseLeave={() => setHoverDate(null)}
                    >
                      {date.getDate()}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Lịch tháng thứ hai */}
            <div className={cx('calendar-view')}>
              <div className={cx('week-days')}>
                {weekDays.map(day => (
                  <div key={day} className={cx('week-day')}>{day}</div>
                ))}
              </div>
              <div className={cx('days-grid')}>
                {nextMonthCalendar.map((date, index) => {
                  const isCurrentMonth = date.getMonth() === nextMonth.getMonth();
                  const isToday = new Date().toDateString() === date.toDateString();
                  const endpointType = isRangeEndpoint(date);
                  const inRange = isInSelectedRange(date);
                  
                  return (
                    <div
                      key={index}
                      className={cx(
                        'day-cell',
                        {
                          'other-month': !isCurrentMonth,
                          'today': isToday,
                          'selected-start': endpointType === 'start',
                          'selected-end': endpointType === 'end',
                          'in-range': inRange,
                          'selectable': isCurrentMonth // Chỉ cho phép chọn ngày trong tháng hiện tại
                        }
                      )}
                      onClick={() => isCurrentMonth && handleDateClick(date)}
                      onMouseEnter={() => isCurrentMonth && setHoverDate(date)}
                      onMouseLeave={() => setHoverDate(null)}
                    >
                      {date.getDate()}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        
        <div className={cx('quick-selection')}>
          <h3 className={cx('quick-selection-title')}>Chọn nhanh</h3>
          <div className={cx('quick-options')}>
            <button 
              className={cx('quick-option-button')}
              onClick={() => {
                const today = new Date();
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                setSelectedCheckIn(today);
                setSelectedCheckOut(tomorrow);
              }}
            >
              1 đêm
            </button>
            <button 
              className={cx('quick-option-button')}
              onClick={() => {
                const today = new Date();
                const in2Days = new Date(today);
                in2Days.setDate(in2Days.getDate() + 2);
                setSelectedCheckIn(today);
                setSelectedCheckOut(in2Days);
              }}
            >
              2 đêm
            </button>
            <button 
              className={cx('quick-option-button')}
              onClick={() => {
                const today = new Date();
                const in3Days = new Date(today);
                in3Days.setDate(in3Days.getDate() + 3);
                setSelectedCheckIn(today);
                setSelectedCheckOut(in3Days);
              }}
            >
              3 đêm
            </button>
            <button 
              className={cx('quick-option-button')}
              onClick={() => {
                const today = new Date();
                const in7Days = new Date(today);
                in7Days.setDate(in7Days.getDate() + 7);
                setSelectedCheckIn(today);
                setSelectedCheckOut(in7Days);
              }}
            >
              7 đêm
            </button>
          </div>
        </div>
        
        <div className={cx('footer')}>
          <button 
            className={cx('apply-button')}
            onClick={() => {
              if (selectedCheckIn && selectedCheckOut) {
                onDateSelect(selectedCheckIn, selectedCheckOut);
                onClose();
              }
            }}
            disabled={!selectedCheckIn || !selectedCheckOut}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatePicker;
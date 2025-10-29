// File: src/components/DatePicker/WorkspaceDatePicker.tsx

import React, { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from './WorkspaceDatePicker.module.scss';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faClock } from "@fortawesome/free-solid-svg-icons";

// === IMPORT useSearch HOOK VÀ TYPES TỪ CONTEXT ===
import { useSearch, BookingType, SelectedTimeState } from '~/context/SearchContext'; 

const cx = classNames.bind(styles);

interface WorkspaceDatePickerProps {
  isOpen: boolean;
  onClose: () => void;
}

const WEEK_DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

const WorkspaceDatePicker: React.FC<WorkspaceDatePickerProps> = ({ 
  isOpen, 
  onClose
}) => {
  // === SỬ DỤNG useSearch HOOK ===
  const { searchState, setSelectedTime, setBookingType: setGlobalBookingType } = useSearch();

  // State nội bộ
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [bookingType, setLocalBookingType] = useState<BookingType>(searchState.bookingType);

  // State cho giờ bắt đầu và kết thúc (dùng cho hourly)
  const [startTime, setStartTime] = useState({ hour: 9, minute: 0 });
  const [endTime, setEndTime] = useState({ hour: 17, minute: 0 });
  
  // === ĐỒNG BỘ STATE KHI MODAL MỞ ===
  useEffect(() => {
    if (isOpen) {
      setLocalBookingType(searchState.bookingType);
      
      const { date, startTime: contextStartTime, endTime: contextEndTime } = searchState.selectedTime;
      
      // Khôi phục SelectedDates
      if (date) {
        // Tạm thời chỉ khôi phục ngày đầu tiên. (Cần logic phức tạp hơn cho daily multi-date)
        setSelectedDates([date]); 
      } else {
        setSelectedDates([]);
      }
      
      // Khôi phục Giờ
      if (contextStartTime && contextEndTime) {
          setStartTime({ 
              hour: contextStartTime.getHours(), 
              minute: contextStartTime.getMinutes() 
          });
          setEndTime({ 
              hour: contextEndTime.getHours(), 
              minute: contextEndTime.getMinutes() 
          });
      } else {
        // Mặc định nếu chưa chọn
        setStartTime({ hour: 9, minute: 0 });
        setEndTime({ hour: 17, minute: 0 });
      }
    }
  }, [isOpen, searchState.bookingType, searchState.selectedTime]);

  if (!isOpen) return null;

  // Kiểm tra ngày có thể chọn được (không cho chọn ngày đã qua)
  const isDateSelectable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate >= today;
  };

  // Hàm xử lý chọn ngày
  const handleDateClick = (date: Date) => {
    if (!isDateSelectable(date)) return;

    if (bookingType === 'hourly') {
      // Chỉ chọn 1 ngày cho booking theo giờ
      setSelectedDates([date]);
    } else {
      // Chọn nhiều ngày cho booking theo ngày
      const dateString = date.toDateString();
      const existingIndex = selectedDates.findIndex(d => d.toDateString() === dateString);
      
      if (existingIndex >= 0) {
        setSelectedDates(prev => prev.filter((_, index) => index !== existingIndex));
      } else {
        setSelectedDates(prev => [...prev, date].sort((a, b) => a.getTime() - b.getTime()));
      }
    }
  };
  
  // Hàm chuyển đổi loại hình
  const handleChangeBookingType = (newType: BookingType) => {
      setLocalBookingType(newType);
      // Giới hạn selectedDates nếu chuyển sang hourly
      if (newType === 'hourly') {
          setSelectedDates(selectedDates.slice(0, 1));
      }
  }

  // === HÀM XÁC NHẬN VÀ LƯU THÔNG TIN VÀO CONTEXT ===
  const handleConfirm = () => {
    if (selectedDates.length === 0) {
      alert("Vui lòng chọn ngày làm việc");
      return;
    }

    let startDateTime: Date;
    let endDateTime: Date;
    let displayText: string;

    if (bookingType === 'hourly') {
      const selectedDate = selectedDates[0];
      
      // TẠO DATE OBJECT CHÍNH XÁC (bao gồm cả giờ, phút)
      startDateTime = new Date(selectedDate);
      startDateTime.setHours(startTime.hour, startTime.minute, 0, 0);
      
      endDateTime = new Date(selectedDate);
      endDateTime.setHours(endTime.hour, endTime.minute, 0, 0);

      if (endDateTime <= startDateTime) {
        alert("Thời gian kết thúc phải sau thời gian bắt đầu");
        return;
      }
      
      const startStr = `${startTime.hour.toString().padStart(2, '0')}:${startTime.minute.toString().padStart(2, '0')}`;
      const endStr = `${endTime.hour.toString().padStart(2, '0')}:${endTime.minute.toString().padStart(2, '0')}`;
      displayText = `${selectedDate.toLocaleDateString('vi-VN')} (${startStr} - ${endStr})`;

      setGlobalBookingType('hourly');
      const timeState: SelectedTimeState = {
        date: selectedDate,
        startTime: startDateTime, // LƯU DATE OBJECT
        endTime: endDateTime,     // LƯU DATE OBJECT
        displayText: displayText,
      }
      setSelectedTime(timeState);

    } else { // bookingType === 'daily'
      const sortedDates = selectedDates.sort((a, b) => a.getTime() - b.getTime());
      const firstDate = sortedDates[0];
      const lastDate = sortedDates[sortedDates.length - 1];

      // TẠO DATE OBJECT CHO DAILY (Đầu ngày và Cuối ngày)
      startDateTime = new Date(firstDate);
      startDateTime.setHours(0, 0, 0, 0); 
      
      endDateTime = new Date(lastDate);
      endDateTime.setHours(23, 59, 59, 999); 
      
      const numDays = sortedDates.length;
      
      if (numDays === 1) {
        displayText = `1 ngày (${firstDate.toLocaleDateString('vi-VN')})`;
      } else {
        displayText = `${firstDate.getDate()}/${firstDate.getMonth() + 1} - ${lastDate.getDate()}/${lastDate.getMonth() + 1} (${numDays} ngày)`;
      }

      setGlobalBookingType('daily');
      const timeState: SelectedTimeState = {
        date: firstDate, 
        startTime: startDateTime, // LƯU DATE OBJECT
        endTime: endDateTime,     // LƯU DATE OBJECT
        displayText: displayText,
      }
      setSelectedTime(timeState);
    }
    
    onClose();
  };

  // Hàm chọn nhanh khoảng thời gian (cho hourly)
  const handleQuickTimeSelect = (startHour: number, endHour: number) => {
    setStartTime({ hour: startHour, minute: 0 });
    setEndTime({ hour: endHour, minute: 0 });
  };

  // Hàm chọn nhanh số ngày (cho daily)
  const handleQuickDaySelect = (days: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dates = Array.from({ length: days }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return date;
    });
    setSelectedDates(dates);
  };

  // Hàm tạo lịch (Giữ nguyên)
  const generateCalendar = (month: Date) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const firstDayOfWeek = firstDay.getDay() === 0 ? 7 : firstDay.getDay(); 
    const startDay = new Date(firstDay);
    startDay.setDate(firstDay.getDate() - (firstDayOfWeek === 1 ? 0 : firstDayOfWeek - 1));
    
    const calendar = [];
    const currentDate = new Date(startDay);
    
    while (calendar.length < 42) {
      calendar.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return calendar;
  };

  // Các hàm tiện ích khác
  const navigateMonth = (direction: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    
    const today = new Date();
    today.setDate(1);
    today.setHours(0, 0, 0, 0);
    
    if (direction === -1) {
      if (newMonth.getFullYear() >= today.getFullYear() && newMonth.getMonth() >= today.getMonth()) {
        setCurrentMonth(newMonth);
      }
    } else {
      setCurrentMonth(newMonth);
    }
  };

  const currentMonthCalendar = generateCalendar(currentMonth);
  const nextMonth = new Date(currentMonth);
  nextMonth.setMonth(currentMonth.getMonth() + 1);
  const nextMonthCalendar = generateCalendar(nextMonth);

  const isDateSelected = (date: Date) => {
    return selectedDates.some(d => d.toDateString() === date.toDateString());
  };

  // Format hiển thị thời gian
  const formatTimeDisplay = () => {
    if (bookingType === 'hourly') {
      if (selectedDates.length === 0) return "Chọn ngày trước";
      
      const startStr = `${startTime.hour.toString().padStart(2, '0')}:${startTime.minute.toString().padStart(2, '0')}`;
      const endStr = `${endTime.hour.toString().padStart(2, '0')}:${endTime.minute.toString().padStart(2, '0')}`;
      
      return `${startStr} - ${endStr}`;
    } else {
      if (selectedDates.length === 0) return "Chọn ngày";
      
      const sortedDates = selectedDates.sort((a, b) => a.getTime() - b.getTime());

      if (sortedDates.length === 1) {
        return `${sortedDates[0].getDate()}/${sortedDates[0].getMonth() + 1} (1 ngày)`;
      } else {
        const start = sortedDates[0];
        const end = sortedDates[sortedDates.length - 1];
        return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1} (${sortedDates.length} ngày)`;
      }
    }
  };

  // Kiểm tra xem có thể confirm không
  const canConfirm = selectedDates.length > 0 && 
    (bookingType === 'daily' || 
      (endTime.hour > startTime.hour || 
      (endTime.hour === startTime.hour && endTime.minute > startTime.minute)));

  return (
    <div className={cx('date-picker-overlay')} onClick={onClose}>
      <div className={cx('date-picker-modal')} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={cx('header')}>
          <h2 className={cx('header-title')}>Chọn thời gian làm việc</h2>
          <button className={cx('close-button')} onClick={onClose}>
            <span>&times;</span>
          </button>
        </div>

        {/* Booking Type Selector */}
        <div className={cx('main-content')}>
        <div className={cx('booking-type-selector')}>
          <button 
            className={cx('type-button', { active: bookingType === 'hourly' })}
            onClick={() => handleChangeBookingType('hourly')}
          >
            <FontAwesomeIcon icon={faClock} style={{ marginRight: "5px" }} />
            Theo giờ
          </button>
          <button 
            className={cx('type-button', { active: bookingType === 'daily' })}
            onClick={() => handleChangeBookingType('daily')}
          >
            <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: "5px" }} />
            Theo ngày
          </button>
        </div>
        

        {/* Selected Date & Time Display */}
        <div className={cx('selection-display')}>
          <div className={cx('selected-info')}>
            <span className={cx('label')}>
              {bookingType === 'hourly' ? 'Ngày & giờ đã chọn:' : 'Ngày đã chọn:'}
            </span>
            <span className={cx('value')}>
              {selectedDates.length > 0 ? (
                bookingType === 'hourly' ? (
                  <>
                    {selectedDates[0].toLocaleDateString('vi-VN', { 
                      weekday: 'long',
                      day: '2-digit',
                      month: '2-digit' 
                    })} • {formatTimeDisplay()}
                  </>
                ) : (
                  formatTimeDisplay()
                )
              ) : (
                `Chưa chọn ${bookingType === 'hourly' ? 'ngày' : 'ngày'}`
              )}
            </span>
          </div>
        </div>

        {/* Quick Selection */}
        <div className={cx('quick-selection')}>
          <h3 className={cx('section-title')}>Chọn nhanh</h3>
          <div className={cx('quick-options')}>
            {bookingType === 'hourly' ? (
              <>
                <button 
                  className={cx('quick-option')}
                  onClick={() => handleQuickTimeSelect(8, 12)}
                >
                  Sáng (8:00-12:00)
                </button>
                <button 
                  className={cx('quick-option')}
                  onClick={() => handleQuickTimeSelect(13, 18)}
                >
                  Chiều (13:00-18:00)
                </button>
                <button 
                  className={cx('quick-option')}
                  onClick={() => handleQuickTimeSelect(9, 17)}
                >
                  Cả ngày (9:00-17:00)
                </button>
              </>
            ) : (
              <>
                <button 
                  className={cx('quick-option')}
                  onClick={() => handleQuickDaySelect(1)}
                >
                  1 ngày
                </button>
                <button 
                  className={cx('quick-option')}
                  onClick={() => handleQuickDaySelect(3)}
                >
                  3 ngày
                </button>
                <button 
                  className={cx('quick-option')}
                  onClick={() => handleQuickDaySelect(7)}
                >
                  1 tuần
                </button>
              </>
            )}
          </div>
        </div>

        {/* Time Picker (chỉ hiển thị khi chọn theo giờ) */}
        {bookingType === 'hourly' && (
          <div className={cx('time-picker-section')}>
            <h3 className={cx('section-title')}>Chọn giờ chi tiết</h3>
            <div className={cx('time-picker')}>
              <div className={cx('time-input-group')}>
                <label className={cx('time-label')}>Bắt đầu</label>
                <div className={cx('time-selectors')}>
                  <select 
                    value={startTime.hour}
                    onChange={(e) => setStartTime(prev => ({ ...prev, hour: parseInt(e.target.value) }))}
                    className={cx('time-select')}
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
                  >
                    {MINUTES.map(minute => (
                      <option key={`start-minute-${minute}`} value={minute}>
                        {minute.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={cx('time-to')}>đến</div>

              <div className={cx('time-input-group')}>
                <label className={cx('time-label')}>Kết thúc</label>
                <div className={cx('time-selectors')}>
                  <select 
                    value={endTime.hour}
                    onChange={(e) => setEndTime(prev => ({ ...prev, hour: parseInt(e.target.value) }))}
                    className={cx('time-select')}
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
        )}

        {/* Calendar Section */}
        <div className={cx('calendar-section')}>
          <h3 className={cx('section-title')}>
            {bookingType === 'hourly' ? 'Chọn ngày làm việc' : 'Chọn nhiều ngày'}
          </h3>
          <div className={cx('calendar-nav')}>
            <button 
              className={cx('nav-button')} 
              onClick={() => navigateMonth(-1)}
            >
              ‹
            </button>
            <div className={cx('month-display')}>
              <span>{currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}</span>
              <span>{nextMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}</span>
            </div>
            <button 
              className={cx('nav-button')} 
              onClick={() => navigateMonth(1)}
            >
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
                            'multi-day': bookingType === 'daily' && selected
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

        {/* Footer với nút Xác nhận */}
        <div className={cx('footer')}>
          <div className={cx('selection-summary')}>
            {selectedDates.length > 0 && (
              <span>
                {bookingType === 'hourly' ? (
                  `${selectedDates[0].getDate()}/${selectedDates[0].getMonth() + 1} • ${formatTimeDisplay()}`
                ) : (
                  `${selectedDates.length} ngày đã chọn`
                )}
              </span>
            )}
          </div>
          <div className={cx('action-buttons')}>
            <button 
              className={cx('cancel-button')}
              onClick={onClose}
            >
              Hủy
            </button>
            <button 
              className={cx('confirm-button')}
              onClick={handleConfirm}
              disabled={!canConfirm}
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceDatePicker;
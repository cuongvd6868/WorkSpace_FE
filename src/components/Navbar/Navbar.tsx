import React, { useState } from "react";
import classNames from "classnames/bind";
import styles from './Navbar.module.scss';
import WorkspaceDatePicker from "../DatePicker/WorkspaceDatePicker";
import { Link } from "react-router-dom";
import GuestAndRoomPicker from "../GuestAndRoomPicker/GuestAndRoomPicker";

const cx = classNames.bind(styles);

const Navbar: React.FC = () => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState({
    date: null as Date | null,
    startTime: null as Date | null,
    endTime: null as Date | null,
    displayText: "Chọn thời gian làm việc"
  });

  // --- State cho Guest/Room Picker ---
  const [isGuestsPickerOpen, setIsGuestsPickerOpen] = useState(false);
  const [guestDetails, setGuestDetails] = useState({
    adults: 1,
    children: 0,
    rooms: 1
  });

  // Helper để tạo chuỗi hiển thị Guest/Room
  const getGuestDisplayText = (): string => {
    const { adults, children, rooms } = guestDetails;
    let text = `${adults} người`;
    if (children > 0) text += `, ${children} trẻ em`;
    return text;
  };

  // Hàm xử lý chọn Guest/Room từ Modal
  const handleGuestSelect = (adults: number, children: number, rooms: number) => {
    setGuestDetails({ adults, children, rooms });
  };

  // 🎯 Hàm xử lý chọn thời gian mới cho Workspace
  const handleWorkspaceTimeSelect = (startTime: Date, endTime: Date) => {
    const formatTime = (date: Date) => {
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit'
      });
    };

    setSelectedTime({
      date: startTime,
      startTime,
      endTime,
      displayText: `${formatDate(startTime)} • ${formatTime(startTime)} - ${formatTime(endTime)}`
    });
  };

  return (
    <>
      <header className={cx('wrapper')}>
        {/* Top navigation bar */}
        <div className={cx('top-nav-bar')}>
          <div className={cx('top-nav-content')}>
            <div className={cx('left-section')}>
              <Link to={'/'}>
                <div className={cx('logo')}>CSB</div>
              </Link>
            </div>
            <div className={cx('right-section')}>
              <a href="#" className={cx('top-nav-item')}>Hoạt động</a>
              <Link to={'/login'} className={cx('top-nav-item')}>Đăng nhập</Link>
            </div>
          </div>
        </div>

        {/* Search section */}
        <div className={cx('search-section')}>
          <div className={cx('search-content')}>
            <h1 className={cx('search-title')}>ĐẶT CHỖ LÀM VIỆC NGAY</h1>
            <p className={cx('search-subtitle')}>
              Khám phá hàng nhiều phòng họp, bàn làm việc linh hoạt, văn phòng riêng cho mọi nhu cầu, 
              phù hợp với mọi quy mô đội nhóm của bạn...
            </p>

            {/* search box */}
            <div className={cx('search-box')}>
              {/* location pick*/}
              <div className={cx('search-input', 'location')}>
                <p className={cx('search-box_label')}>Địa điểm</p>
                <input 
                  type="text" 
                  placeholder="Nhập địa điểm, thành phố..." 
                  className={cx('search-box-input')} 
                />
              </div>
              
              {/* time pick - ĐÃ CẬP NHẬT */}
              <div className={cx('search-input', 'time')} onClick={() => setIsDatePickerOpen(true)}>
                <p className={cx('search-box_label')}>Thời gian làm việc</p>
                <input 
                  type="text" 
                  readOnly 
                  value={selectedTime.displayText} 
                  placeholder="Chọn ngày và giờ làm việc" 
                  className={cx('search-box-input')}
                />
              </div>
              
              {/* guest pick - CẬP NHẬT LABEL */}
              <div className={cx('search-input', 'guests')} onClick={() => setIsGuestsPickerOpen(true)}>
                <p className={cx('search-box_label')}>Số người</p>
                <input 
                  type="text" 
                  readOnly 
                  value={getGuestDisplayText()} 
                  className={cx('search-box-input')}
                  placeholder="Chọn số lượng người"
                />
              </div>

              <button className={cx('search-button')}>
                 Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 🎯 WORKSPACE DATE PICKER MỚI */}
      <WorkspaceDatePicker 
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onTimeSelect={handleWorkspaceTimeSelect}
      />

      {/* Guest & Room Picker Modal */}
      <GuestAndRoomPicker
        isOpen={isGuestsPickerOpen}
        onClose={() => setIsGuestsPickerOpen(false)}
        onSelect={handleGuestSelect}
        initialAdults={guestDetails.adults}
        initialChildren={guestDetails.children}
        initialRooms={guestDetails.rooms}
      />
    </>
  );
};

export default Navbar;
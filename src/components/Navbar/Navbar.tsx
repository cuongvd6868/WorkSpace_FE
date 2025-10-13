import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from './Navbar.module.scss';
import DatePicker from '../DatePicker/DatePicker';
import { Link } from "react-router-dom";
import HeadlessTippy from '@tippyjs/react/headless';
import Popper from "../Popper/Popper";
// import { LocationTV } from "~/types/Location";
// import { getLocationsByName } from "~/services/LocationService";
import GuestAndRoomPicker from "../GuestAndRoomPicker/GuestAndRoomPicker";

const cx = classNames.bind(styles);

// Helper function to format the date
const getInitialDateRange = () => {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const formatDate = (date: Date) => {  
    return `${date.getDate()}, ${date.getMonth() + 1} tháng ${date.getFullYear()}`;
  };

  return `${formatDate(today)} — ${formatDate(tomorrow)}`;
};

const Navbar: React.FC = () => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState({
    checkIn: null as Date | null,
    checkOut: null as Date | null,
    displayText: getInitialDateRange()
  });

    // --- 3. State cho Guest/Room Picker ---
  const [isGuestsPickerOpen, setIsGuestsPickerOpen] = useState(false);
  const [guestDetails, setGuestDetails] = useState({
    adults: 2,
    children: 0,
    rooms: 1
  });

    // Helper để tạo chuỗi hiển thị Guest/Room
    const getGuestDisplayText = (): string => {
        const { adults, children, rooms } = guestDetails;
        return `${adults} người lớn - ${children} trẻ em - ${rooms} phòng`;
    };

    // Hàm xử lý chọn Guest/Room từ Modal
    const handleGuestSelect = (adults: number, children: number, rooms: number) => {
        setGuestDetails({ adults, children, rooms });
    };


  const handleDateSelect = (checkIn: Date | null, checkOut: Date | null) => {
    if (checkIn && checkOut) {
      const formatDate = (date: Date) => {
        return `${date.getDate()}, ${date.getMonth() + 1} tháng ${date.getFullYear()}`;
      };
      
      setSelectedDates({
        checkIn,
        checkOut,
        displayText: `${formatDate(checkIn)} — ${formatDate(checkOut)}`
      });
    }
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
            <p className={cx('search-subtitle')}>Khám phá hàng nhiều phòng họp, bàn làm việc linh hoạt, văn phòng riêng cho mọi nhu cầu, phù hợp với mọi quy mô đội nhóm của bạn...</p>
            



              {/* search box */}
              <div className={cx('search-box')}>
                {/* location pick*/}
                <div className={cx('search-input', 'location')}>
                  <label className={cx('search-box_lable')}>Địa điểm</label>
                  <input type="text" placeholder="Nhập điểm đến của bạn..." className={cx('search-box-input')} />
                  
                </div>
                {/* date pick*/}
                <div className={cx('search-input', 'date')} onClick={() => setIsDatePickerOpen(true)}>
                  <label className={cx('search-box_lable')}>Ngày</label>
                  <input  type="text"  readOnly  value={selectedDates.displayText} placeholder="Chọn ngày"  className={cx('search-box-input')}/>
                </div>
                
                {/* guest & room pick*/}
                <div className={cx('search-input', 'guests')} onClick={() => setIsGuestsPickerOpen(true)}>
{/*                 <label className={cx('search-box_lable')}>Khách & Phòng</label> */}
                    <input 
                        type="text" 
                        readOnly 
                        value={getGuestDisplayText()} 
                        className={cx('search-box-input')}
                    />
                </div>

                <button className={cx('search-button')}>Tìm kiếm</button>
              </div>
            
          </div>
        </div>
      </header>

      {/* Date Picker */}
      <DatePicker 
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onDateSelect={handleDateSelect}
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
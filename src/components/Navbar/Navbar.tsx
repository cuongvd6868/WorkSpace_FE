import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from './Navbar.module.scss';
import WorkspaceDatePicker from "../DatePicker/WorkspaceDatePicker";
import { Link } from "react-router-dom";
import MeetingParticipantPicker from "../MeetingParticipantPicker/MeetingParticipantPicker";
import { isToken, isTokenExpired, getUsernameByToken, logout } from "~/services/JwtService";
import flagImg from '~/assets/img/logo_img/vietnamFlagSvg.svg';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { getLocationsByName } from "~/services/AddressService";
import HeadlessTippy from '@tippyjs/react/headless';
import Popper from "../Popper/Popper";
import coverImg from '~/assets/img/bg_img/cover.avif';

const cx = classNames.bind(styles);

const Navbar: React.FC = () => {

  const [searchWardResult, setSearchWardResult] = useState<string[]>([]);
  const [showWardResult, setShowWardResult] = useState(false);
  const [inputWardValue, setInputWardValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const handleHideResult = () => {
    setShowWardResult(false);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputWardValue(value);
    
    if (value.trim() !== '') {
      setShowWardResult(true);
    } else {
      setShowWardResult(false);
      setSearchWardResult([]);
    }
  }

  const handleLocationSelect = (selectedName: string) => {
    setInputWardValue(selectedName)
    setShowWardResult(false)
  }

  useEffect(() => {
    const fetchLocations = async () => {
      if (!inputWardValue.trim()) {
        setSearchWardResult([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const apiResponse = await getLocationsByName(inputWardValue);
        const safeResult = apiResponse ?? [];
        console.log('API Response:', apiResponse);
        setSearchWardResult(safeResult);
      } catch (error) {
        console.log('Lỗi không lấy được dữ liệu:', error);
        setError('Lỗi không lấy được dữ liệu, vui lòng thử lại sau');
        setSearchWardResult([]);
      } finally {
        setLoading(false);
      }
    }

    const timeoutId = setTimeout(fetchLocations, 300);
    return () => clearTimeout(timeoutId);
  }, [inputWardValue])

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState({
    date: null as Date | null,
    startTime: null as Date | null,
    endTime: null as Date | null,
    displayText: "Chọn thời gian làm việc"
  });

  const token = localStorage.getItem('token');
  const isLoggedIn = token && isToken() && !isTokenExpired(token);

  const [isParticipantsPickerOpen, setIsParticipantsPickerOpen] = useState(false);
  const [participants, setParticipants] = useState(3);

  const handleParticipantsSelect = (participantsCount: number) => {
    setParticipants(participantsCount);
  };

  const getParticipantsDisplayText = (): string => {
    return `${participants} người`;
  };

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
            {isLoggedIn ? (
               <div className={cx('right-section')}>
                <img src={flagImg} alt="" className={cx('flag')}/>
                <a href="#" className={cx('top-nav-item')}>Hoạt động</a>
                <Link to={'/login'} className={cx('username')}>{getUsernameByToken()}</Link>
              </div>
            ): 
              <div className={cx('right-section')}>
                <p className={cx('flag_payment')}>VND</p>
                <img src={flagImg} alt="" className={cx('flag')}/>
                <Link to={'/'} className={cx('top-nav-item_i')}><FontAwesomeIcon icon={faQuestionCircle} className={cx('help-icon')} /></Link>
                <Link to={'/'} className={cx('top-nav-item')}>Đăng không gian của Quý vị</Link>
                <Link to={'/login'} className={cx('nav_btn')}>Đăng Ký</Link>
                <Link to={'/login'} className={cx('nav_btn')}>Đăng nhập</Link>
              </div>
            }
          </div>
        </div>

        {/* Cover image với overlay và text */}
        <div className={cx('cover_container')}>
          <img src={coverImg} alt="Cover" className={cx('cover_img')}/>
          <div className={cx('cover_overlay')}></div>
          <div className={cx('cover_content')}>
            <div className={cx('promo_badge')}>Giảm đến 15% khi đặt chỗ</div>
            <h1 className={cx('cover_title')}>Đặt chỗ làm việc ngay</h1>
            <p className={cx('cover_subtitle')}>
              Khám phá nhiều phòng họp, bàn làm việc linh hoạt, văn phòng riêng cho mọi nhu cầu, 
              phù hợp với mọi quy mô đội nhóm của bạn...
            </p>
            <button className={cx('cover_button')}>Đặt chỗ ngay</button>
          </div>
        </div>

        {/* Search section */}
        <div className={cx('search-section')}>
          <div className={cx('search-content')}>
            <HeadlessTippy
              interactive
              visible={showWardResult && (searchWardResult.length > 0 || loading || !!error)}
              placement="bottom-start"
              offset={[0, 5]}
              render={attrs => (
                <div className={cx('search-result')} tabIndex={-1} {...attrs}>
                  <Popper>
                    {loading ? (
                      <div className={cx('loading')}>Đang tải...</div>
                    ) : error ? (
                      <div className={cx('error')}>{error}</div>
                    ) : searchWardResult.length > 0 ? (
                      searchWardResult.map((location, index) => (
                        <div 
                          key={index} 
                          className={cx('location-item')}
                          onClick={() => handleLocationSelect(location)}
                        >
                          <FontAwesomeIcon icon={faLocationDot} className={cx('location-icon')} />
                          <span className={cx('location-text')}>{location}</span>
                        </div>
                      ))
                    ) : (
                      <div className={cx('no-results')}>Không tìm thấy kết quả</div>
                    )}
                  </Popper>
                </div>
              )}
              onClickOutside={handleHideResult}
            >
              <div className={cx('search-box')}>
                {/* location pick */}
                <div className={cx('search-input', 'location')}>
                  <p className={cx('search-box_label')}>Địa điểm</p>
                  <input 
                    type="text" 
                    placeholder="Nhập tên phường..." 
                    className={cx('search-box-input')} 
                    value={inputWardValue}
                    onChange={handleInputChange}
                    onFocus={() => {
                      if (inputWardValue.trim() && searchWardResult.length > 0) {
                        setShowWardResult(true);
                      }
                    }}
                  />
                </div>
              
                {/* time pick */}
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
                
                {/* participants pick*/}
                <div className={cx('search-input', 'participants')} onClick={() => setIsParticipantsPickerOpen(true)}>
                  <p className={cx('search-box_label')}>Số người tham gia</p>
                  <input 
                    type="text" 
                    readOnly 
                    value={getParticipantsDisplayText()} 
                    className={cx('search-box-input')}
                    placeholder="Chọn số người tham gia"
                  />
                </div>

                <button className={cx('search-button')}>
                  Tìm kiếm
                </button>
              </div>
            </HeadlessTippy>
          </div>
        </div>
      </header>

      {/* WORKSPACE DATE PICKER */}
      <WorkspaceDatePicker 
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onTimeSelect={handleWorkspaceTimeSelect}
      />

      {/* Meeting Participant Picker Modal */}
      <MeetingParticipantPicker
        isOpen={isParticipantsPickerOpen}
        onClose={() => setIsParticipantsPickerOpen(false)}
        onSelect={handleParticipantsSelect}
        initialParticipants={participants}
      />
    </>
  );
};

export default Navbar;
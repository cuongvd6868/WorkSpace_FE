import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from './Navbar.module.scss';
import WorkspaceDatePicker from "../DatePicker/WorkspaceDatePicker";
import { Link, useLocation, useNavigate } from "react-router-dom";
import MeetingParticipantPicker from "../MeetingParticipantPicker/MeetingParticipantPicker";
import { isToken, isTokenExpired, getUsernameByToken, logout } from "~/services/JwtService";
import flagImg from '~/assets/img/logo_img/vietnamFlagSvg.svg';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { getLocationsByName } from "~/services/AddressService";
import HeadlessTippy from '@tippyjs/react/headless';
import Popper from "../Popper/Popper";
import coverImg from '~/assets/img/bg_img/cover.avif';

import { useSearch } from '~/context/SearchContext'; 
import { toast } from "react-toastify";

const cx = classNames.bind(styles);

const Navbar: React.FC = () => {

  // === DÙNG CONTEXT HOOK VÀ NAVIGATE ===
  const { 
    searchState, 
    setLocation, 
    setParticipants
  } = useSearch();
  const navigate = useNavigate();

  const [searchWardResult, setSearchWardResult] = useState<string[]>([]);
  const [showWardResult, setShowWardResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isParticipantsPickerOpen, setIsParticipantsPickerOpen] = useState(false);

  const locationRouter = useLocation();
  const isHomePage = locationRouter.pathname === '/';

  
  const handleHideResult = () => {
    setShowWardResult(false);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value); // Cập nhật location vào Context
    
    if (value.trim() !== '') {
      setShowWardResult(true);
    } else {
      setShowWardResult(false);
      setSearchWardResult([]);
    }
  }

  const handleLocationSelect = (selectedName: string) => {
    setLocation(selectedName) // Cập nhật location vào Context
    setShowWardResult(false)
  }

  // Effect gọi API tìm kiếm địa điểm với debounce
  useEffect(() => {
    const fetchLocations = async () => {
      if (!searchState.location.trim()) {
        setSearchWardResult([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const apiResponse = await getLocationsByName(searchState.location);
        const safeResult = apiResponse ?? [];
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
  }, [searchState.location])

  const token = localStorage.getItem('token');
  const isLoggedIn = token && isToken() && !isTokenExpired(token);

  const handleParticipantsSelect = (participantsCount: number) => {
    setParticipants(participantsCount); // Cập nhật participants vào Context
  };

  const getParticipantsDisplayText = (): string => {
    return `${searchState.participants} người`;
  };

  // === HÀM XỬ LÝ TÌM KIẾM CHÍNH (GỌI API HOẶC ĐIỀU HƯỚNG) ===
  const handleSearchClick = () => {
      const { location, selectedTime, participants } = searchState;

      // 1. Kiểm tra điều kiện

      if (!location || !selectedTime.startTime || !selectedTime.endTime) {
          toast.warn("Vui lòng chọn đầy đủ Địa điểm, Ngày và Giờ làm việc.");
          return;
      }

      const formatToISOStringForApi = (date: Date): string => {
          return date.toISOString().replace(/\.\d{3}Z$/, ''); 
      };
      
      const starttimeISO = formatToISOStringForApi(selectedTime.startTime);
      const endtimeISO = formatToISOStringForApi(selectedTime.endTime);

      const queryString = new URLSearchParams({
          ward: location,
          starttime: starttimeISO,
          endtime: endtimeISO,
          capacity: participants.toString(),
      }).toString();

      navigate(`/search-results?${queryString}`);
  }
  
  return (
    <>
      <header className={cx('wrapper')}>
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
                <Link to={'/'} className={cx('top-nav-item')}>Đăng không gian của quý vị</Link>
                <Link to={'/login'} className={cx('nav_btn')}>{getUsernameByToken()}</Link>
              </div>
            ): 
              <div className={cx('right-section')}>
                <p className={cx('flag_payment')}>VND</p>
                <img src={flagImg} alt="" className={cx('flag')}/>
                <Link to={'/'} className={cx('top-nav-item_i')}><FontAwesomeIcon icon={faQuestionCircle} className={cx('help-icon')} /></Link>
                <Link to={'/'} className={cx('top-nav-item')}>Đăng không gian của quý vị</Link>
                <Link to={'/login'} className={cx('nav_btn')}>Đăng Ký</Link>
                <Link to={'/login'} className={cx('nav_btn')}>Đăng nhập</Link>
              </div>
            }
          </div>
        </div>

        {isHomePage ? (
          <div className={cx('cover_container')}>
            <img src={coverImg} alt="Cover" className={cx('cover_img')} />
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
        ) : (
          <div className={cx('cover_container2')}>
            <div className={cx('cover_content')}>
              <h1 className={cx('cover_title')}>Không gian làm việc cho hiệu suất tối đa</h1>
              <p className={cx('cover_subtitle')}>
                Trải nghiệm đa dạng không gian làm việc – từ bàn cá nhân linh hoạt đến phòng họp chuyên nghiệp, đáp ứng mọi nhu cầu và quy mô đội nhóm của bạn.
              </p>
            </div>
          </div>
        )}


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
                    value={searchState.location}
                    onChange={handleInputChange}
                    onFocus={() => {
                      if (searchState.location.trim() && searchWardResult.length > 0) {
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
                    value={searchState.selectedTime.displayText} 
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

                <button 
                    className={cx('search-button')}
                    onClick={handleSearchClick} // GỌI HÀM XỬ LÝ TÌM KIẾM
                >
                  Tìm kiếm
                </button>
              </div>
            </HeadlessTippy>
          </div>
        </div>
      </header>

      <WorkspaceDatePicker 
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
      />

      <MeetingParticipantPicker
        isOpen={isParticipantsPickerOpen}
        onClose={() => setIsParticipantsPickerOpen(false)}
        onSelect={handleParticipantsSelect}
        initialParticipants={searchState.participants}
      />
    </>
  );
};

export default Navbar;
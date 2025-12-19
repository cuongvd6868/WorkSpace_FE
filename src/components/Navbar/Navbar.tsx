import React, {  useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from './Navbar.module.scss';
import WorkspaceDatePicker from "../DatePicker/WorkspaceDatePicker";
import { Link, useLocation, useNavigate } from "react-router-dom";
import MeetingParticipantPicker from "../MeetingParticipantPicker/MeetingParticipantPicker";
import flagImg from '~/assets/img/logo_img/vietnamFlagSvg.svg';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faBriefcase, faHeart, faLocationDot, faMessage, faPaperPlane, faQuestionCircle, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { getLocationsByName } from "~/services/AddressService";
import HeadlessTippy from '@tippyjs/react/headless';
import Popper from "../Popper/Popper";
import coverImg from '~/assets/img/bg_img/cover.avif';
import { useAuth } from "~/context/useAuth";
import { useSearch } from '~/context/SearchContext'; 
import { toast } from "react-toastify";
import { WorkSpaceQuickSearch } from "~/types/WorkSpaces";
import { GetWorkSpaceQuickSearch } from "~/services/WorkSpaceService";
import { chatService } from "~/services/ChatService";
import { Loader } from "lucide-react";
import ChatWidget from "../ChatComponent/ChatWidget";
import { NotificationView } from "~/types/Notification";
import { getAllNotification } from "~/services/NotificationService";

const cx = classNames.bind(styles);

const Navbar: React.FC = () => {

  const { 
    searchState, 
    setLocation, 
    setParticipants
  } = useSearch();
  const navigate = useNavigate();

  const {isLoggedIn, logout, user} = useAuth();

  const [searchWardResult, setSearchWardResult] = useState<string[]>([]);
  const [showWardResult, setShowWardResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isParticipantsPickerOpen, setIsParticipantsPickerOpen] = useState(false);

  // --- State cho Chat History trên Navbar ---
    const [chatSessions, setChatSessions] = useState<any[]>([]);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState<{sid: string, name: string} | null>(null);
    const [loadingSessions, setLoadingSessions] = useState(false);

    // Hàm lấy danh sách khi hover hoặc định kỳ
    const fetchChatHistory = async () => {
        if (!isLoggedIn()) return;
        try {
            setLoadingSessions(true);
            const data = await chatService.getMySessions();
            setChatSessions(data || []);
        } catch (error) {
            console.error("Lỗi tải lịch sử chat:", error);
        } finally {
            setLoadingSessions(false);
        }
    };

const handleOpenChatFromHistory = (sid: string, workspaceName: string) => {
    // Reset session cũ trước khi set session mới để ChatWidget nhận diện sự thay đổi SID
    setSelectedSession(null); 
    
    // Sử dụng setTimeout cực ngắn để đảm bảo React trigger lại việc render với SID mới
    setTimeout(() => {
        setSelectedSession({ sid, name: workspaceName });
        setIsChatOpen(true);
    }, 0);
};

  const locationRouter = useLocation();
  const isHomePage = locationRouter.pathname === '/';
  const isDashboardPage = 
        locationRouter.pathname.startsWith('/admin') ||
        locationRouter.pathname.startsWith('/staff') ||
        locationRouter.pathname.startsWith('/owner');

  
  const handleHideResult = () => {
    setShowWardResult(false);
  }

  useEffect(() => {
    if (!user) {
      setChatSessions([]); // Xóa sạch danh sách tin nhắn trong state khi không có user
      setSelectedSession(null);
      setIsChatOpen(false);
    }
  }, [user]);

  // search nhanh
  const [quickSearchValue, setQuickSearchValue] = useState('');
  const [quickSearchResult, setQuickSearchResult] = useState<WorkSpaceQuickSearch[]>([]);
  const [showQuickSearchResult, setShowQuickSearchResult] = useState(false);
  const [quickSearchLoading, setQuickSearchLoading] = useState(false);

  // --- State cho Thông báo hệ thống ---
const [notifications, setNotifications] = useState<NotificationView[]>([]);
const [loadingNoti, setLoadingNoti] = useState(false);

const fetchNotifications = async () => {
    try {
        setLoadingNoti(true);
        const data = await getAllNotification();
        setNotifications(data || []);
    } catch (error) {
        console.error("Lỗi tải thông báo:", error);
    } finally {
        setLoadingNoti(false);
    }
};

  const handleQuickSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuickSearchValue(value);
    if (value.trim() !== '') {
        setShowQuickSearchResult(true);
    } else {
        setShowQuickSearchResult(false);
        setQuickSearchResult([]);
    }
  };

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

  useEffect(() => {
    const fetchQuickWorkspaces = async () => {
        if (!quickSearchValue.trim()) return;

        try {
            setQuickSearchLoading(true);
            const data = await GetWorkSpaceQuickSearch(quickSearchValue);
            setQuickSearchResult(data || []);
        } catch (error) {
            console.error('Quick search error:', error);
            setQuickSearchResult([]);
        } finally {
            setQuickSearchLoading(false);
        }
    };

    const timeoutId = setTimeout(fetchQuickWorkspaces, 500); // Đợi 500ms sau khi dừng gõ
    return () => clearTimeout(timeoutId);
}, [quickSearchValue]);

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


  const handleBookingNow = () => {
    toast.info('Bạn vui lòng chọn địa điểm và thời gian!')
  }

  const handleParticipantsSelect = (participantsCount: number) => {
    setParticipants(participantsCount); // Cập nhật participants vào Context
  };

  const getParticipantsDisplayText = (): string => {
    return `${searchState.participants} người`;
  };

  const handleSingleSearchBarClick = () => {
    console.log('abc')
  }

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

  const handleLogout = () => {
    logout();
    window.location.href = '/';
    toast.dark('Bạn vừa đăng xuất khỏi hệ thống!')
  };

  const handleProtectedLinkClick = (e: React.MouseEvent, path: string, message: string) => {
    if (!isLoggedIn()) {
      e.preventDefault(); 
      toast.info(message);
    } else {
      navigate(path);
    }
  };
  
  return (
    <>
      <header className={cx('wrapper')}>
        <div className={cx('top-nav-bar')}>
          <div className={cx('top-nav-content')}>
            <Link to={'/'}>
              <div className={cx('left-section')}>
                  <FontAwesomeIcon icon={faBriefcase} className={cx('logo-icon')} />
                  <div className={cx('logo')}>CSB</div>
              </div>
            </Link>
              <div className={cx('right-section')}>
                <p className={cx('flag_payment')}>VND</p>
                <img src={flagImg} alt="" className={cx('flag')}/>
                <div onClick={(e) => handleProtectedLinkClick(e, '/support', 'Vui lòng đăng nhập để yêu cầu hỗ trợ')} className={cx('top-nav-item_i')}><FontAwesomeIcon icon={faQuestionCircle} className={cx('help-icon')} /></div>
                <HeadlessTippy
                key={user?.userName || 'guest'}
                                interactive
                                placement="bottom-end"
                                offset={[0, 10]}
                                delay={[200, 0]} // Hiện sau 200ms hover
                                onTrigger={fetchChatHistory} // Tự động load khi hover vào
                                render={attrs => (
                                    <div className={cx('chat-history-popover')} tabIndex={-1} {...attrs}>
                                        <Popper>
                                            <div className={cx('history-header')}>Tin nhắn gần đây</div>
                                            <div className={cx('history-list')}>
                                                {loadingSessions ? (
                                                    <div className={cx('history-loading')}><Loader size={16} className={cx('spin')} /> Đang tải...</div>
                                                ) : chatSessions.length > 0 ? (
                                                    chatSessions.map((session) => (
                                                        <div 
                                                            key={session.sessionId} 
                                                            className={cx('history-item')}
                                                            onClick={() => handleOpenChatFromHistory(session.sessionId, session.workspaceName)}
                                                        >
                                                            <div className={cx('item-avatar')}>
                                                                <FontAwesomeIcon icon={faMessage} />
                                                            </div>
                                                            <div className={cx('item-info')}>
                                                                <p className={cx('item-name')}>{session.workspaceName}</p>
                                                                <p className={cx('item-owner')}>Hỗ trợ: {session.assignedOwnerName || 'Chưa có'}</p>
                                                            </div>
                                                            {session.isActive && <span className={cx('dot')}></span>}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className={cx('history-empty')}>Chưa có cuộc hội thoại nào</div>
                                                )}
                                            </div>
                                        </Popper>
                                    </div>
                                )}
                            >
                                <div className={cx('top-nav-item_i')}>
                                    <FontAwesomeIcon icon={faPaperPlane} className={cx('logo-icon')} />
                                </div>
                            </HeadlessTippy>
                <HeadlessTippy
    interactive
    placement="bottom-end"
    offset={[0, 10]}
    delay={[200, 0]}
    onTrigger={fetchNotifications} // Gọi API khi hover
    render={attrs => (
        <div className={cx('notification-popover')} tabIndex={-1} {...attrs}>
            <Popper>
                <div className={cx('noti-header')}>Thông báo hệ thống</div>
                <div className={cx('noti-list')}>
                    {loadingNoti ? (
                        <div className={cx('noti-loading')}>
                            <Loader size={16} className={cx('spin')} /> Đang tải...
                        </div>
                    ) : notifications.length > 0 ? (
                        notifications.map((noti) => (
                            <div key={noti.id} className={cx('noti-item')}>
                                <div className={cx('noti-icon')}>
                                    <FontAwesomeIcon icon={faBell} />
                                </div>
                                <div className={cx('noti-info')}>
                                    <p className={cx('noti-title')}>{noti.title}</p>
                                    <p className={cx('noti-content')}>{noti.content}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={cx('noti-empty')}>Không có thông báo nào</div>
                    )}
                </div>
            </Popper>
        </div>
    )}
>
    <div className={cx('top-nav-item_i')}>
        <FontAwesomeIcon icon={faBell} className={cx('logo-icon')} />
    </div>
</HeadlessTippy>
                <div onClick={(e) => handleProtectedLinkClick(e, '/favorites', 'Vui lòng đăng nhập để truy cập danh sách yêu thích')} className={cx('top-nav-item_i')}><FontAwesomeIcon icon={faHeart} className={cx('logo-icon')} /> </div>   
                <div onClick={(e) => handleProtectedLinkClick(e, '/booking-list', 'Vui lòng đăng nhập để truy cập danh sách đặt chỗ')} className={cx('top-nav-item')}>Danh sách đặt chỗ</div>  
                <div className={cx('right-section_vector')}>|</div>
                <div onClick={(e) => handleProtectedLinkClick(e, '/host-register', 'Vui lòng đăng nhập để đăng không gian')} className={cx('top-nav-item')}>Đăng không gian của quý vị</div>           
                {isLoggedIn() ? (
                  <div className={cx('toggle_auth')}>
                    <div className={cx('nav_btn_login')}>{user?.userName}</div>
                    <FontAwesomeIcon icon={faRightFromBracket} className={cx('logo-icon')} onClick={handleLogout}/>
                  </div>
                ): 
                  <div className={cx('toggle_auth')}>
                    <Link to={'/login'} className={cx('nav_btn')}>Đăng Ký</Link>
                    <Link to={'/login'} className={cx('nav_btn')}>Đăng nhập</Link>
                  </div>
                }
            </div>
          </div>
        </div>

        {!isDashboardPage && (
          <>
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
<div className={cx('search-wrapper')}>
    <HeadlessTippy
        interactive
        visible={showQuickSearchResult && (quickSearchResult.length > 0 || quickSearchLoading)}
        placement="bottom-start"
        offset={[0, 8]}
        render={attrs => (
            <div className={cx('search-result')} tabIndex={-1} {...attrs}>
                <Popper>
                    {quickSearchLoading ? (
                        <div className={cx('loading')}>Đang tìm kiếm...</div>
                    ) : quickSearchResult.length > 0 ? (
                        quickSearchResult.map((item) => (
                            <div 
                                key={item.id} 
                                className={cx('location-item')}
                                onClick={() => {
                                    navigate(`/workspace/${item.id}`);
                                    setShowQuickSearchResult(false);
                                }}
                            >
                                <FontAwesomeIcon icon={faBriefcase} className={cx('location-icon')} />
                                <span className={cx('location-text')}>{item.title}</span>
                            </div>
                        ))
                    ) : (
                        <div className={cx('no-results')}>Không tìm thấy không gian nào</div>
                    )}
                </Popper>
            </div>
        )}
        onClickOutside={() => setShowQuickSearchResult(false)}
    >
        <div className={cx('search-box')}>
            <input
                type="text"
                value={quickSearchValue}
                onChange={handleQuickSearchChange}
                onFocus={() => quickSearchValue.trim() && setShowQuickSearchResult(true)}
                placeholder="Tìm nhanh Workspace của bạn..."
            />
            <button className={cx('search-btn')}>
                <FontAwesomeIcon icon={faLocationDot} />
            </button>
        </div>
    </HeadlessTippy>
</div>


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
        </>
        )}
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
<ChatWidget
    isOpen={isChatOpen}
    externalSessionId={selectedSession?.sid} 
    hostName={selectedSession?.name || "Hỗ trợ"} 
    workspaceId={0} 
    onClose={() => {
        setIsChatOpen(false);
        setSelectedSession(null); 
    }}
/>
    </>
  );
};

export default Navbar;
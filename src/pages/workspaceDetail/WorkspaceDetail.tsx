import React, { useState, useEffect } from "react";
import styles from './WorkspaceDetail.module.scss';
import classNames from "classnames/bind";
import { useParams, useNavigate } from "react-router-dom";
import { WorkSpaceDetail } from "~/types/WorkSpaces";
import { WorkSpaceRoom } from "~/types/WorkSpaceRoom";
import { GetWorkSpaceById } from "~/services/WorkSpaceService";
import { RoomSearchParams } from '~/services/WorkSpaceRoomService';
import { useSearchRooms } from "~/hooks/useSearchRooms";
import SearchRoomModal from "~/components/SearchRoomModal/SearchRoomModal";
import { useBooking, BookingData } from "~/context/BookingContext";
import {
    MapPin, Phone, Building, Users, Maximize, Clock, DollarSign, ChevronRight,
    Loader, Sun, Wifi, Coffee, ParkingSquare, Snowflake, Calendar, ExternalLink,
    Search, ListTodo, Map, XCircle, CheckCircle, Printer, AirVent, Monitor, Utensils, 
    Zap, Lock, Leaf, ShieldCheck, UserCheck, PhoneMissed,
    X
} from 'lucide-react';
import RoomTable from "~/components/WorkspaceDetail/RoomTable/RoomTable";
import ComparisonBar from "~/components/WorkspaceDetail/ComparisonBar/ComparisonBar";
import ComparisonModal from "~/components/WorkspaceDetail/ComparisonBar/ComparisonModal";
import HostInfo from "~/components/WorkspaceDetail/HostInfo/HostInfo";
import ChatWidget from "~/components/ChatComponent/ChatWidget";
import { CLOUD_NAME } from "~/config/cloudinaryConfig";
import WorkspaceNotifications from "~/components/WorkspaceDetail/WorkspaceNotifications/WorkspaceNotifications";
import WorkspacePromotions from "~/components/WorkspaceDetail/WorkspacePromotions/WorkspacePromotions";
import MapImg from '~/assets/img/map/mapImg.png';
import WorkspaceReviewSwiper from "~/components/WorkspaceDetail/WorkspaceReviewSwiper/WorkspaceReviewSwiper";
import LoadingSpinner from "~/components/LoadingSpinner/LoadingSpinner";

const cx = classNames.bind(styles);

export const DYNAMIC_AMENITIES = [
    { id: 1, label: 'Wi-Fi tốc độ cao', detail: 'Kết nối mạng không dây mạnh mẽ.', icon: Wifi, key: 'wifi' },
    { id: 2, label: 'Điều hòa không khí', detail: 'Hệ thống làm mát hiện đại.', icon: AirVent, key: 'ac' },
    { id: 3, label: 'Máy in & máy scan', detail: 'Tiện lợi cho tài liệu văn phòng.', icon: Printer, key: 'printer_scan' },
    { id: 4, label: 'Phòng họp riêng', detail: 'Không gian kín đáo cho các cuộc họp.', icon: PhoneMissed, key: 'private_room' }, // Dùng tạm PhoneMissed
    { id: 5, label: 'Coffee & Tea miễn phí', detail: 'Thưởng thức đồ uống không giới hạn.', icon: Coffee, key: 'coffee_tea' },
    { id: 6, label: 'Ghế công thái học', detail: 'Thiết kế giúp bảo vệ sức khỏe khi làm việc.', icon: Users, key: 'ergonomic_chair' },
    { id: 7, label: 'Khu vực nghỉ ngơi', detail: 'Nơi thư giãn, tái tạo năng lượng.', icon: Sun, key: 'rest_area' },
    { id: 8, label: 'Tủ locker cá nhân', detail: 'Giữ đồ đạc an toàn, riêng tư.', icon: Lock, key: 'locker' },
    { id: 9, label: 'Chỗ đỗ xe', detail: 'Bãi đỗ xe rộng rãi.', icon: ParkingSquare, key: 'parking' },
    { id: 10, label: 'Hỗ trợ kỹ thuật', detail: 'Nhân viên IT luôn sẵn sàng hỗ trợ.', icon: Zap, key: 'tech_support' },
    { id: 11, label: 'Máy chiếu & màn hình', detail: 'Hỗ trợ trình chiếu cho hội họp.', icon: Monitor, key: 'projector_screen' },
    { id: 12, label: 'Bảng trắng', detail: 'Tiện lợi cho việc lên ý tưởng và thảo luận.', icon: ListTodo, key: 'whiteboard' },
    { id: 13, label: 'Khu pantry', detail: 'Có tủ lạnh, lò vi sóng và bồn rửa.', icon: Utensils, key: 'pantry' },
    { id: 14, label: 'Dịch vụ lễ tân', detail: 'Hỗ trợ đón tiếp khách hàng.', icon: UserCheck, key: 'reception' },
    { id: 15, label: 'Bảo vệ 24/7', detail: 'An ninh tuyệt đối cả ngày lẫn đêm.', icon: ShieldCheck, key: 'security_24h' },
    { id: 16, label: 'Thang máy', detail: 'Tiện lợi di chuyển giữa các tầng.', icon: Maximize, key: 'elevator' },
    { id: 17, label: 'Không gian xanh', detail: 'Mang lại cảm giác thư thái, gần gũi thiên nhiên.', icon: Leaf, key: 'green_space' },
    { id: 18, label: 'Hệ thống camera an ninh', detail: 'Giám sát khu vực chung 24/7.', icon: ShieldCheck, key: 'camera' },
    { id: 19, label: 'Ổ cắm & sạc điện thoại', detail: 'Tích hợp ổ cắm tiện dụng.', icon: Zap, key: 'charging_port' },
    { id: 20, label: 'Không gian yên tĩnh', detail: 'Dành cho những ai cần sự tập trung cao độ.', icon: Clock, key: 'quiet_area' },
];

const MOCK_AMENITIES = DYNAMIC_AMENITIES; // Sử dụng biến MOCK_AMENITIES cũ để giảm thiểu thay đổi code

// MOCK_ROOM_AMENITIES: Lấy key từ DYNAMIC_AMENITIES
const MOCK_ROOM_AMENITIES: { [key: number]: string[] } = {
    1: ['wifi', 'ac', 'projector_screen', 'private_room', 'elevator'], 
    2: ['wifi', 'coffee_tea', 'rest_area', 'ergonomic_chair', 'green_space', 'pantry'],
    3: ['wifi', 'ac', 'coffee_tea', 'parking', 'reception', 'whiteboard', 'security_24h'],
};

const MOCK_POLICIES: string[] = [ 
    'Giờ làm việc linh hoạt từ 8h sáng đến 8h tối.',
    'Chính sách hủy/đổi phòng linh hoạt trong 24 giờ.',
    'Có dịch vụ bảo vệ 24/7 và hệ thống camera giám sát an ninh.',
    'Hỗ trợ kỹ thuật IT tại chỗ cho mọi vấn đề liên quan đến kết nối và thiết bị.',
];

const MOCK_DESCRIPTION: string = 'Nằm tại vị trí trung tâm thành phố Đà Nẵng, không gian làm việc này mang đến trải nghiệm làm việc hiện đại và linh hoạt, phù hợp cho cá nhân, nhóm nhỏ hoặc doanh nghiệp muốn tìm kiếm môi trường sáng tạo và chuyên nghiệp. Với thiết kế tinh tế, ánh sáng tự nhiên tràn ngập, cùng đầy đủ tiện ích như Wi-Fi tốc độ cao, máy lạnh, khu vực pantry, phòng họp và khu nghỉ ngơi, nơi đây giúp bạn tập trung tối đa cho công việc mà vẫn giữ được sự thoải mái.Chỉ vài phút di chuyển đến các khu vực hành chính, quán cà phê, nhà hàng và bãi biển, workspace này không chỉ là nơi làm việc mà còn là điểm đến lý tưởng để kết nối, sáng tạo và phát triển. Dù bạn đang tìm kiếm một chỗ ngồi yên tĩnh để làm việc cá nhân hay một không gian hợp tác năng động cho nhóm, đây chắc chắn là lựa chọn hoàn hảo để bạn bắt đầu ngày mới đầy cảm hứng tại Đà Nẵng.';


const calculateTotalHours = (start: string, end: string): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.max(0, diffHours);
};


interface ImageGalleryProps {
    images: string[];
    limit: number;
    onOpenModal: () => void;
}
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/`;
const ImageGallery: React.FC<ImageGalleryProps> = ({ images, limit, onOpenModal }) => {
    if (!images || images.length === 0) {
        return <div className={cx('no-image-placeholder')}> Không có ảnh để hiển thị.</div>;
    }

    const getImageUrl = (url: string) => {
        return url.startsWith('http') ? url : `${CLOUDINARY_BASE_URL}${url}`;
    };

    const mainImage = getImageUrl(images[0]);
    const sideImages = images.slice(1, limit);
    const remainingCount = images.length - limit;

    return (
        <div className={cx('image-gallery')}>
            <div
                className={cx('main-image')}
                style={{ backgroundImage: `url(${mainImage})` }}
                title="Ảnh chính không gian làm việc"
                onClick={onOpenModal} 
            />

            <div className={cx('side-images')}>
                {sideImages.map((url, index) => (
                    <div
                        key={index}
                        className={cx('side-image')}
                        style={{ backgroundImage: `url(${getImageUrl(url)})`, cursor: 'pointer' }}
                        onClick={onOpenModal} 
                        title={`Ảnh phụ ${index + 2}`}
                    />
                ))}

                {remainingCount > 0 && (
                    <div className={cx('remaining-cover')} onClick={onOpenModal}>
                        <span className={cx('remaining-count')}>+{remainingCount}</span>
                        <p>Xem toàn bộ ảnh</p>
                    </div>
                )}
            </div>
        </div>
    );
};





const WorkspaceDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { setBookingData } = useBooking();

    const [workspace, setWorkspace] = useState<WorkSpaceDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [roomsToCompare, setRoomsToCompare] = useState<number[]>([]);
    const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
    

    const [lastSearchTime, setLastSearchTime] = useState<{
        startTimeUtc: string;
        endTimeUtc: string;
        numberOfParticipants: number
    } | null>(null);

    const {
        rooms: searchedRooms,
        isLoading: isSearchLoading,
        error: searchError,
        executeSearch
    } = useSearchRooms();

    const [hasSearched, setHasSearched] = useState(false);

    // LOGIC FETCH DATA
    useEffect(() => {
        if (!id) {
            setError("ID Workspace không hợp lệ.");
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const workspaceId = parseInt(id as string);
                if (isNaN(workspaceId)) throw new Error("ID không phải là số.");

                const data: WorkSpaceDetail = await GetWorkSpaceById(workspaceId);
                setWorkspace(data);
            } catch (err) {
                setError("Rất tiếc! Không thể tải thông tin Workspace này.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // LOGIC SEARCH
    interface SearchParamsFromModal {
        startTime: string;
        endTime: string;
        capacity: number;
    }

    const handleSearch = async (params: SearchParamsFromModal) => {
        if (!id) return;

        const searchParams: RoomSearchParams = {
            startTime: params.startTime,
            endTime: params.endTime,
            capacity: params.capacity,
            workspaceId: parseInt(id)
        };

        setLastSearchTime({
            startTimeUtc: params.startTime,
            endTimeUtc: params.endTime,
            numberOfParticipants: params.capacity
        });

        setHasSearched(true);
        await executeSearch(searchParams);
        setIsSearchModalOpen(false);
    };

    const handleClearSearch = () => {
        setHasSearched(false);
        setLastSearchTime(null);
        setIsSearchModalOpen(false);
    };

    const handleOpenSearchModal = () => {
        setIsSearchModalOpen(true);
    };

    // LOGIC COMPARISON
    const toggleRoomComparison = (roomId: number) => {
        setRoomsToCompare(prevIds => {
            if (prevIds.includes(roomId)) {
                return prevIds.filter(id => id !== roomId);
            } else if (prevIds.length < 3) {
                return [...prevIds, roomId];
            }
            alert("Chỉ có thể so sánh tối đa 3 phòng cùng lúc.");
            return prevIds;
        });
    };

    const clearComparison = () => {
        setRoomsToCompare([]);
    };
    
    // ĐÃ SỬA LỖI REACT HOOKS: Hàm này gọi Hooks đã khai báo ở đầu component chính
    const handleBookRoomFromComparison = (room: WorkSpaceRoom) => {
        if (!lastSearchTime) {
            alert("Vui lòng chọn thời gian đặt phòng trước để tính giá!");
            return;
        }
    
        const totalHours = calculateTotalHours(
            lastSearchTime.startTimeUtc, 
            lastSearchTime.endTimeUtc
        );
    
        if (totalHours <= 0) {
            alert("Thời gian đặt phòng không hợp lệ.");
            return;
        }
    
        const totalAmount = totalHours * room.pricePerHour;
    
        const booking: BookingData = {
            room,
            totalAmount,
            totalHours,
            startTimeUtc: lastSearchTime.startTimeUtc,
            endTimeUtc: lastSearchTime.endTimeUtc,
            numberOfParticipants: lastSearchTime.numberOfParticipants,
            workspaceName: workspace?.title || "",
            workspaceAddressLine: workspace?.addressLine || "",
        };
        
        setBookingData(booking); 
        navigate('/booking/checkout'); 
    };

    // LOGIC RENDER
    if (loading) {
        return (
            <div className={cx('loading-state')}>
                <LoadingSpinner/>
            </div>
        );
    }

    if (error || !workspace || workspace.isActive === false) {
        return <div className={cx('error-message')}>❌ {error || "Không tìm thấy dữ liệu Workspace."}</div>;
    }
    
    const allRooms = workspace.rooms || [];
    const displayedRooms = hasSearched ? searchedRooms : allRooms;
    const roomsInComparison = allRooms.filter(room => roomsToCompare.includes(room.id));


    return (
        <div className={cx('wrapper')}>
            <header className={cx('header')}>
                <div className={cx('header-content')}>
                    <h1>{workspace.title}</h1>
                    <p className={cx('address')}><MapPin size={16} /> {workspace.addressLine}</p>
                    <div className={cx('contact-info')}>
                        <span><Phone size={14} /> {workspace.hostContactPhone}</span>
                        <span><ExternalLink size={14} /> <a href={workspace.hostCompanyName} target="_blank" rel="noopener noreferrer">Website</a></span>
                    </div>
                </div>
            </header>
            
            <section className={cx('gallery-section')}>
                <ImageGallery images={workspace.imageUrls} limit={4} onOpenModal={() => setIsGalleryModalOpen(true)}/>
            </section>
            
            <div className={cx('main-content-grid')}>
                
                <div className={cx('left-column')}>
                    
                    {/* GIỚI THIỆU CHUNG */}
                    <section className={cx('about-section')}>
                        <h2 className={cx('section-heading')}>Về {workspace.title}</h2>
                        <p className={cx('description')}>
                            {workspace.description}
                        </p>
                        <p className={cx('description')}>
                            {MOCK_DESCRIPTION}
                        </p>
                    </section>

                    {/* TIỆN ÍCH (SỬ DỤNG DYNAMIC_AMENITIES) */}
                    <section className={cx('amenities-section')}>
                        <h2 className={cx('section-heading')}>Tiện Ích Nổi Bật</h2>
                        <div className={cx('amenities-grid')}>
                            {MOCK_AMENITIES.map((amenity, index) => (
                                <div key={amenity.id || index} className={cx('amenity-item')}>
                                    <amenity.icon size={28} className={cx('amenity-icon')} />
                                    <div className={cx('amenity-details')}>
                                        <strong>{amenity.label}</strong>
                                        <p>{amenity.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                    
                    {/* CHÍNH SÁCH */}
                    <section className={cx('policies-section')}>
                        <h2 className={cx('section-heading')}>
                            <ListTodo size={24} />
                            Quy Tắc & Chính Sách
                        </h2>
                        <ul className={cx('policy-list')}>
                            {MOCK_POLICIES.map((policy, index) => (
                                <li key={index}><ChevronRight size={14} /> {policy}</li>
                            ))}
                        </ul>
                    </section>

                </div>

                {/* RIGHT COLUMN (SIDEBAR) */}
                <div className={cx('right-column')}>
                    <WorkspacePromotions workspaceId={workspace.id} />
                    {/* THÔNG TIN CHỦ HỘ/HOST */}
                    <HostInfo
                        hostId={workspace.hostId}
                        hostName={workspace.hostName}
                        hostPhone={workspace.hostContactPhone}
                        hostEmail={workspace.hostCompanyName}
                        hostAvatarUrl={workspace.hostAvatar}
                        workspaceTitle={workspace.title}
                        onOpenChat={() => setIsChatOpen(true)} 
                    />


                    <section className={cx('map-section')}>
                        <h2 className={cx('section-heading')}>
                            <Map size={24} />
                            Vị Trí
                        </h2>
                        <div className={cx('map-container')}>
                            {/* Thẻ img thay thế cho background-image */}
                            <img 
                                src={`${MapImg}` || "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1000"} 
                                alt="Bản đồ vị trí" 
                                className={cx('map-image')}
                            />
                            
                            {/* Lớp phủ để text dễ đọc hơn */}
                            <div className={cx('map-overlay')}>
                                <p className={cx('map-address')}>{workspace.addressLine}</p>
                                <a 
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(workspace.addressLine)}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className={cx('map-link')}
                                >
                                    Mở trên Google Maps <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>
                    </section>
                        <div className={cx('notification-sidebar-section')}>
                        <WorkspaceNotifications workspaceId={workspace.id} />
                    </div>
                    <WorkspaceReviewSwiper workspaceId={workspace.id} />
                </div>
            </div>

            {/* DANH SÁCH PHÒNG */}
            <section className={cx('room-section')}>
                
                <div className={cx('search-section-header')}>
                    <h2 className={cx('section-heading')}>Danh Sách Phòng</h2>
                    <button 
                        className={cx('open-search-modal-button')}
                        onClick={handleOpenSearchModal}
                    >
                        <Search size={16} />
                        Chọn thời gian đặt phòng
                    </button>
                </div>

                {searchError && (
                    <div className={cx('error-message', 'search-error')}>
                        Lỗi tìm kiếm: {searchError}
                    </div>
                )}
                
                {isSearchLoading && (
                    <div className={cx('loading-message')}>
                        <Loader className={cx('loader-icon')} size={24} /> Đang tìm phòng khả dụng...
                    </div>
                )}

                {/* BẢNG PHÒNG */}
                <RoomTable
                    rooms={displayedRooms} 
                    lastSearchTime={lastSearchTime}
                    workspaceName={workspace.title} 
                    workspaceAddressLine={workspace.addressLine}
                    roomsToCompare={roomsToCompare} 
                    toggleRoomComparison={toggleRoomComparison}
                />
            </section>

            {/* MODAL TÌM KIẾM */}
            <SearchRoomModal
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                onSearch={handleSearch as (params: Omit<RoomSearchParams, 'workspaceId'>) => void}
                onClear={handleClearSearch}
                isLoading={isSearchLoading}
            />
            
            {/* THANH NỔI SO SÁNH */}
            <ComparisonBar
                roomsCount={roomsToCompare.length}
                onOpenModal={() => setIsComparisonModalOpen(true)}
                onClear={clearComparison}
            />
            
            {/* MODAL SO SÁNH */}
            <ComparisonModal
                isOpen={isComparisonModalOpen}
                onClose={() => setIsComparisonModalOpen(false)}
                rooms={roomsInComparison}
                onBookRoom={handleBookRoomFromComparison}
                clearComparison={clearComparison}
            />
            {isChatOpen && (
                <ChatWidget
                    isOpen={isChatOpen}
                    workspaceId={workspace.id}
                    hostName={workspace.hostName}
                    onClose={() => setIsChatOpen(false)}
                />
                            )}

            {isGalleryModalOpen && (
                <div className={cx('gallery-modal-overlay')} onClick={() => setIsGalleryModalOpen(false)}>
                    <div className={cx('gallery-modal-content')} onClick={(e) => e.stopPropagation()}>
                        <button className={cx('close-modal-btn')} onClick={() => setIsGalleryModalOpen(false)}>
                            <X size={32} />
                        </button>
                        <h2 className={cx('modal-title')}>Tất cả hình ảnh ({workspace.imageUrls.length})</h2>
                        <div className={cx('full-gallery-grid')}>
                            {workspace.imageUrls.map((url, index) => (
                                <div key={index} className={cx('gallery-item')}>
                                    <img 
                                        src={url.startsWith('http') ? url : `${CLOUDINARY_BASE_URL}${url}`} 
                                        alt={`Workspace img ${index}`} 
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default WorkspaceDetail;
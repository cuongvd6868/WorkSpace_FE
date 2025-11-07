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
    Search
} from 'lucide-react';

const cx = classNames.bind(styles);

// --- MOCK DATA --- (Giữ nguyên)
const MOCK_IMAGES: string[] = [
    'https://plus.unsplash.com/premium_photo-1682608388956-11f98495e165?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
    'https://plus.unsplash.com/premium_photo-1684769161054-2fa9a998dcb6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1504',
    'https://plus.unsplash.com/premium_photo-1683880731792-39c07ceea617?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
    'https://plus.unsplash.com/premium_photo-1661767467261-4a4bed92a507?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
    'https://images.unsplash.com/photo-1524758870432-af57e54afa26?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687',
];

const MOCK_AMENITIES = [
    { icon: Wifi, label: 'Wi-Fi Tốc Độ Cao', detail: 'Đường truyền cáp quang độc lập, băng thông 500Mbps.' },
    { icon: Coffee, label: 'Khu Pha Chế Miễn Phí', detail: 'Trà, cà phê, nước lọc không giới hạn.' },
    { icon: ParkingSquare, label: 'Bãi Đỗ Xe Rộng', detail: 'Có chỗ đỗ xe máy miễn phí và ưu đãi vé xe ô tô.' },
    { icon: Snowflake, label: 'Điều Hòa Trung Tâm', detail: 'Hệ thống điều hòa hoạt động 24/7, luôn mát mẻ.' },
    { icon: Sun, label: 'Ánh Sáng Tự Nhiên', detail: 'Thiết kế cửa sổ lớn, tận dụng tối đa ánh sáng mặt trời.' },
];

const MOCK_POLICIES = [
    'Giờ làm việc linh hoạt từ 8h sáng đến 8h tối.',
    'Chính sách hủy/đổi phòng linh hoạt trong 24 giờ.',
    'Có dịch vụ bảo vệ 24/7 và hệ thống camera giám sát an ninh.',
    'Hỗ trợ kỹ thuật IT tại chỗ cho mọi vấn đề liên quan đến kết nối và thiết bị.',
];

// --- SUB-COMPONENT: GALLERY ẢNH --- 
interface ImageGalleryProps {
    images: string[];
    limit: number;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, limit }) => {
    if (!images || images.length === 0) {
        return <div className={cx('no-image-placeholder')}> Không có ảnh để hiển thị.</div>;
    }

    const mainImage = images[0];
    const sideImages = images.slice(1, limit);
    const remainingCount = images.length - limit;

    return (
        <div className={cx('image-gallery')}>
            <div
                className={cx('main-image')}
                style={{ backgroundImage: `url(${mainImage})` }}
                title="Ảnh chính không gian làm việc"
            />

            <div className={cx('side-images')}>
                {sideImages.map((url, index) => (
                    <div
                        key={index}
                        className={cx('side-image')}
                        style={{ backgroundImage: `url(${url})` }}
                        title={`Ảnh phụ ${index + 2}`}
                    />
                ))}

                {remainingCount > 0 && (
                    <div className={cx('remaining-cover')} onClick={() => alert(`Xem thêm ${remainingCount} ảnh!`)}>
                        <span className={cx('remaining-count')}>+{remainingCount}</span>
                        <p>Xem toàn bộ ảnh</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Hàm hỗ trợ tính tổng giờ từ 2 chuỗi ISO 8601 
const calculateTotalHours = (start: string, end: string): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime(); 
    const diffHours = diffMs / (1000 * 60 * 60); 
    return Math.max(0, diffHours); 
};


// --- SUB-COMPONENT: BẢNG PHÒNG (ĐÃ CẬP NHẬT PROPS VÀ LOGIC CONTEXT) ---
interface RoomTableProps {
    rooms: WorkSpaceRoom[];
    lastSearchTime: { startTimeUtc: string; endTimeUtc: string; numberOfParticipants: number } | null; 
    workspaceName: string;          // <--- THÊM PROP
    workspaceAddressLine: string;   // <--- THÊM PROP
}

const RoomTable: React.FC<RoomTableProps> = ({ 
    rooms, 
    lastSearchTime,
    workspaceName,          // <--- DESTRUCTURE
    workspaceAddressLine    // <--- DESTRUCTURE
}) => {
    const navigate = useNavigate(); 
    const { setBookingData } = useBooking(); 

    const handleBookRoom = (room: WorkSpaceRoom) => {
        if (!lastSearchTime) {
            alert("Vui lòng chọn thời gian đặt phòng trước để tính giá!");
            return;
        }

        const totalHours = calculateTotalHours(
            lastSearchTime.startTimeUtc, 
            lastSearchTime.endTimeUtc
        );

        if (totalHours <= 0) {
            alert("Thời gian đặt phòng không hợp lệ (thời gian kết thúc phải sau thời gian bắt đầu).");
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
            // GÁN CÁC TRƯỜNG MỚI ĐỂ TRUYỀN ĐI
            workspaceName: workspaceName,
            workspaceAddressLine: workspaceAddressLine,
        };
        setBookingData(booking);

        navigate('/booking/checkout'); 
    };
    
    const isBookingDisabled = !lastSearchTime;

    return (
        <div className={cx('room-table-container')}>
            {(!rooms || rooms.length === 0) ? (
                <div className={cx('no-rooms-message')}>
                    <Building size={48} />
                    <p>Không có phòng nào để hiển thị.</p>
                </div>
            ) : (
                <div className={cx('table-responsive')}>
                     {!lastSearchTime && (
                        <div className={cx('no-rooms-message', 'warning')}>
                            <Calendar size={20} />
                            <p>Vui lòng chọn **thời gian đặt phòng** để xem phòng khả dụng và đặt chỗ!</p>
                        </div>
                    )}
                    <table className={cx('room-table')}>
                        <thead>
                            <tr>
                                <th>Phòng</th>
                                <th>Sức chứa & Diện tích</th>
                                <th>Giá Thuê</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.map((room) => (
                                <tr key={room.id} className={cx('room-row')}>
                                    <td className={cx('room-title-cell')}>
                                        <strong className={cx('room-title')}>{room.title}</strong>
                                        <span className={cx('room-type-tag', room.roomType.toLowerCase().replace(/\s/g, '-'))}>{room.roomType}</span>
                                        <p className={cx('room-description-small')}>{room.description}</p>
                                    </td>
                                    <td>
                                        <div className={cx('feature-item')}><Users size={16} /> {room.capacity} người</div>
                                        <div className={cx('feature-item')}><Maximize size={16} /> {room.area} m²</div>
                                    </td>
                                    <td>
                                        <div className={cx('price-option')}><Clock size={14} />/Giờ: **{room.pricePerHour.toLocaleString()} VNĐ**</div>
                                        <div className={cx('price-option')}><Sun size={14} />/Ngày: {room.pricePerDay.toLocaleString()} VNĐ</div>
                                        <div className={cx('price-option')}><Calendar size={14} />/Tháng: {room.pricePerMonth.toLocaleString()} VNĐ</div>
                                    </td>
                                    <td>
                                        <button 
                                            className={cx('booking-button', { disabled: isBookingDisabled })}
                                            onClick={() => handleBookRoom(room)} 
                                            disabled={isBookingDisabled}
                                        >
                                            Đặt chỗ ngay <ChevronRight size={16} />
                                        </button>
                                        {isBookingDisabled && <p className={cx('booking-tip')}>Chọn giờ để kích hoạt</p>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// --- COMPONENT CHÍNH ---
const WorkspaceDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [workspace, setWorkspace] = useState<WorkSpaceDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

    // State MỚI: Lưu trữ thông tin thời gian tìm kiếm cuối cùng
    const [lastSearchTime, setLastSearchTime] = useState<{ 
        startTimeUtc: string; 
        endTimeUtc: string;   
        numberOfParticipants: number 
    } | null>(null);

    // Hook tìm kiếm
    const {
        rooms: searchedRooms,
        isLoading: isSearchLoading,
        error: searchError,
        executeSearch
    } = useSearchRooms();

    const [hasSearched, setHasSearched] = useState(false);

    // Logic Fetch Data Workspace (Giữ nguyên)
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
    
    // Interface để đồng bộ với SearchRoomModal.tsx
    interface SearchParamsFromModal {
        startTime: string; 
        endTime: string;
        capacity: number;
    }

    // Hàm xử lý khi submit form search 
    const handleSearch = async (params: SearchParamsFromModal) => {
        if (!id) return;
        
        const searchParams: RoomSearchParams = {
            startTime: params.startTime, 
            endTime: params.endTime,     
            capacity: params.capacity,   
            workspaceId: parseInt(id)
        };

        // LƯU LẠI THÔNG TIN THỜI GIAN VÀ SỐ NGƯỜI DÙNG TÌM KIẾM
        setLastSearchTime({ 
            startTimeUtc: params.startTime, 
            endTimeUtc: params.endTime,     
            numberOfParticipants: params.capacity 
        });

        setHasSearched(true);
        await executeSearch(searchParams);
        setIsSearchModalOpen(false); 
    };

    // Hàm xử lý khi xóa tìm kiếm
    const handleClearSearch = () => {
        setHasSearched(false);
        setLastSearchTime(null); 
        setIsSearchModalOpen(false); 
    };

    // Hàm mở modal
    const handleOpenSearchModal = () => {
        setIsSearchModalOpen(true);
    };

    // Render Trạng thái loading
    if (loading) {
        return (
            <div className={cx('loading-container')}>
                <Loader className={cx('loader-icon')} size={48} />
                <p>Đang chuẩn bị trải nghiệm Workspace tuyệt vời nhất...</p>
            </div>
        );
    }

    // Render lỗi
    if (error || !workspace) {
        return <div className={cx('error-message')}>❌ {error || "Không tìm thấy dữ liệu Workspace."}</div>;
    }

    // Xác định danh sách phòng cần hiển thị
    const displayedRooms = hasSearched ? searchedRooms : (workspace.rooms || []);

    return (
        <div className={cx('wrapper')}>

            {/* ... (Các phần JSX khác giữ nguyên) ... */}

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

                {/* ... (Trạng thái tìm kiếm JSX giữ nguyên) ... */}

                {/* BẢNG PHÒNG - TRUYỀN THÊM THÔNG TIN WORKSPACE TỪ COMPONENT CHÍNH */}
                <RoomTable 
                    rooms={displayedRooms} 
                    lastSearchTime={lastSearchTime}
                    workspaceName={workspace.title}             // <--- TRUYỀN THÔNG TIN
                    workspaceAddressLine={workspace.addressLine} // <--- TRUYỀN THÔNG TIN
                />
            </section>

            <SearchRoomModal
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                onSearch={handleSearch as (params: Omit<RoomSearchParams, 'workspaceId'>) => void}
                onClear={handleClearSearch}
                isLoading={isSearchLoading}
            />
        </div>
    );
}

export default WorkspaceDetail;
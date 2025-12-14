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
    Zap, Lock, Leaf, ShieldCheck, UserCheck, PhoneMissed
} from 'lucide-react';

const cx = classNames.bind(styles);

// --- DYNAMIC AMENITIES (20 Tiện ích theo danh sách của bạn) --- 
// Sử dụng key (wifi, ac, ...) để dễ dàng check boolean trong phòng
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

const MOCK_IMAGES: string[] = [
    'https://plus.unsplash.com/premium_photo-1682608388956-11f98495e165?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
    'https://plus.unsplash.com/premium_photo-1684769161054-2fa9a998dcb6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1504',
    'https://plus.unsplash.com/premium_photo-1683880731792-39c07ceea617?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
    'https://plus.unsplash.com/premium_photo-1661767467261-4a4bed92a507?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
    'https://images.unsplash.com/photo-1524758870432-af57e54afa26?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687',
];


// --- UTILS ---
const calculateTotalHours = (start: string, end: string): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.max(0, diffHours);
};


// --- SUB-COMPONENT: GALLERY ẢNH ---
interface ImageGalleryProps {
    images: string[];
    limit: number;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, limit }) => {
    // ... (Code ImageGallery - Giữ nguyên)
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


// --- SUB-COMPONENT: HOST INFO ---
interface HostInfoProps {
    hostName: string;
    hostPhone: string;
    hostEmail: string;
    hostAvatarUrl: string;
    workspaceTitle: string;
}

const HostInfo: React.FC<HostInfoProps> = ({ hostName, hostPhone, hostEmail, hostAvatarUrl, workspaceTitle }) => {
    return (
        <section className={cx('host-section')}>
            <h2 className={cx('section-heading')}>
                <Users size={24} />
                Liên Hệ Chủ Hộ
            </h2>
            <div className={cx('host-card')}>
                <img src={hostAvatarUrl} alt={hostName} className={cx('host-avatar')} />
                <div className={cx('host-details')}>
                    <strong>{hostName}</strong>
                    <p>Đại diện {workspaceTitle}</p>
                </div>
            </div>
            <div className={cx('host-contact')}>
                <p><Phone size={14} /> **Hotline:** {hostPhone}</p>
                <p><ExternalLink size={14} /> **Email:** {hostEmail}</p>
                <button className={cx('chat-button')}>Nhắn tin trực tiếp</button>
            </div>
        </section>
    );
};


// --- SUB-COMPONENT: BẢNG PHÒNG ---
interface RoomTableProps {
    rooms: WorkSpaceRoom[];
    lastSearchTime: { startTimeUtc: string; endTimeUtc: string; numberOfParticipants: number } | null;
    workspaceName: string;
    workspaceAddressLine: string;
    roomsToCompare: number[];
    toggleRoomComparison: (roomId: number) => void;
}

const RoomTable: React.FC<RoomTableProps> = ({
    rooms,
    lastSearchTime,
    workspaceName,
    workspaceAddressLine,
    roomsToCompare,
    toggleRoomComparison
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
            workspaceName: workspaceName,
            workspaceAddressLine: workspaceAddressLine,
        };
        setBookingData(booking);

        navigate('/booking/checkout');
    };

    const isBookingDisabled = !lastSearchTime;
    const maxComparison = 3; 
    
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
                                <th>Giá Thuê (Giờ)</th>
                                <th>So Sánh</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.map((room) => {
                                const isChecked = roomsToCompare.includes(room.id);
                                const isDisabled = roomsToCompare.length >= maxComparison && !isChecked;

                                return (
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
                                            <div className={cx('price-option')}><DollarSign size={14} />/Giờ: **{room.pricePerHour.toLocaleString()} VNĐ**</div>
                                        </td>
                                        <td className={cx('compare-cell')}>
                                            <label className={cx('compare-checkbox-label', { disabled: isDisabled })}>
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => toggleRoomComparison(room.id)}
                                                    disabled={isDisabled}
                                                />
                                                <span className={cx('custom-checkbox')}></span>
                                                {isDisabled ? 'Đã đủ' : 'Chọn'}
                                            </label>
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
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};


// --- SUB-COMPONENT: BẢNG SO SÁNH PHÒNG (COMPARISON MODAL - FIX LỖI TYPE) ---
interface ComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
    rooms: WorkSpaceRoom[];
    onBookRoom: (room: WorkSpaceRoom) => void;
    clearComparison: () => void;
}

// Định nghĩa lại các loại thuộc tính để tránh lỗi TS2339
type FeatureType = 
  | { label: string; key: 'roomType' | 'capacity' | 'area'; unit?: string; isPrice?: false; isAmenity?: false }
  | { label: string; key: 'pricePerHour'; unit?: string; isPrice: true; isAmenity?: false }
  | { label: string; key: string; unit?: string; isPrice?: false; isAmenity: true };


const ComparisonModal: React.FC<ComparisonModalProps> = ({ isOpen, onClose, rooms, onBookRoom, clearComparison }) => {
    if (!isOpen || rooms.length === 0) return null;

    // Tiêu chí so sánh cố định
    const comparisonFeatures: FeatureType[] = [
        { label: 'Loại Phòng', key: 'roomType' },
        { label: 'Sức Chứa', key: 'capacity', unit: 'người' },
        { label: 'Diện Tích', key: 'area', unit: 'm²' },
        { label: 'Giá Thuê/Giờ', key: 'pricePerHour', isPrice: true },
    ];
    
    // Thêm các tiện ích chung từ DYNAMIC_AMENITIES
    const amenityFeatures: FeatureType[] = DYNAMIC_AMENITIES.map(a => ({
        label: a.label,
        key: a.key, // Lấy key mới
        isAmenity: true,
    }));
    
    const allFeatures: FeatureType[] = [...comparisonFeatures, ...amenityFeatures];

    const getFeatureValue = (room: WorkSpaceRoom, feature: FeatureType): string | boolean => {
        if (feature.isAmenity) {
            // Logic kiểm tra tiện ích dựa trên KEY
            const roomAmenities = MOCK_ROOM_AMENITIES[room.id] || [];
            return roomAmenities.includes(feature.key);
        }
        
        const value = (room as any)[feature.key];
        
        if (feature.isPrice) {
            return `${value.toLocaleString()} VNĐ`;
        }
        
        return `${value} ${feature.unit || ''}`;
    };

    return (
        <div className={cx('modal-overlay')}>
            <div className={cx('modal-content', 'comparison-modal')}>
                <div className={cx('modal-header')}>
                    <h2>So Sánh Các Phòng Đã Chọn ({rooms.length})</h2>
                    <button className={cx('close-button')} onClick={onClose}><XCircle size={24} /></button>
                </div>
                
                <div className={cx('comparison-table-wrapper')}>
                    {rooms.length < 2 && (
                        <div className={cx('comparison-hint')}>
                            <p>Vui lòng chọn ít nhất 2 phòng để so sánh.</p>
                        </div>
                    )}
                    <table className={cx('comparison-table')}>
                        <thead>
                            <tr>
                                <th className={cx('feature-column')}>Tiêu Chí</th>
                                {rooms.map(room => (
                                    <th key={room.id} className={cx('room-column')}>
                                        <div className={cx('room-header-title')}>
                                            <img src={MOCK_IMAGES[0]} alt={room.title} className={cx('room-thumb')} />
                                            <strong className={cx('room-name')}>{room.title}</strong>
                                            <button 
                                                className={cx('remove-room-button')} 
                                                onClick={() => clearComparison()} // Tạm thời dùng clear
                                            >
                                                <XCircle size={16} />
                                            </button>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {allFeatures.map((feature, index) => (
                                <tr key={index}>
                                    <td className={cx('feature-column')}>
                                        {feature.label}
                                        {feature.isPrice && <DollarSign size={14} className={cx('inline-icon')} />}
                                        {feature.key === 'capacity' && !feature.isAmenity && <Users size={14} className={cx('inline-icon')} />}
                                        {feature.key === 'area' && !feature.isAmenity && <Maximize size={14} className={cx('inline-icon')} />}
                                    </td>
                                    {rooms.map(room => {
                                        const value = getFeatureValue(room, feature);
                                        return (
                                            <td key={room.id} className={cx('room-column')}>
                                                {feature.isAmenity ? (
                                                    value ? <CheckCircle size={20} className={cx('icon-check')} /> : <XCircle size={20} className={cx('icon-x')} />
                                                ) : (
                                                    value
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td className={cx('feature-column')}></td>
                                {rooms.map(room => (
                                    <td key={room.id} className={cx('room-column')}>
                                        <button 
                                            className={cx('booking-button-small')}
                                            onClick={() => {
                                                onClose(); 
                                                onBookRoom(room);
                                            }}
                                        >
                                            Đặt Phòng
                                        </button>
                                    </td>
                                ))}
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};


// --- SUB-COMPONENT: THANH NỔI SO SÁNH ---
interface ComparisonBarProps {
    roomsCount: number;
    onOpenModal: () => void;
    onClear: () => void;
}

const ComparisonBar: React.FC<ComparisonBarProps> = ({ roomsCount, onOpenModal, onClear }) => {
    if (roomsCount === 0) return null;

    return (
        <div className={cx('comparison-bar')}>
            <div className={cx('bar-content')}>
                <p>Đã chọn **{roomsCount}** phòng để so sánh.</p>
                <div className={cx('actions')}>
                    <button onClick={onOpenModal} className={cx('compare-now-button')}>
                        So Sánh Ngay ({roomsCount})
                    </button>
                    <button onClick={onClear} className={cx('clear-comparison-button')}>
                        Xóa <XCircle size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- COMPONENT CHÍNH ---
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
            <div className={cx('loading-container')}>
                <Loader className={cx('loader-icon')} size={48} />
                <p>Đang chuẩn bị trải nghiệm Workspace tuyệt vời nhất...</p>
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
                <ImageGallery images={MOCK_IMAGES} limit={4} />
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
                    
                    {/* THÔNG TIN CHỦ HỘ/HOST */}
                    <HostInfo 
                        hostName={workspace.hostName}
                        hostPhone={workspace.hostContactPhone}
                        hostEmail={workspace.hostCompanyName}
                        hostAvatarUrl="https://i.pravatar.cc/150?img=1" 
                        workspaceTitle={workspace.title}
                    />

                    {/* BẢN ĐỒ */}
                    <section className={cx('map-section')}>
                        <h2 className={cx('section-heading')}>
                            <Map size={24} />
                            Vị Trí
                        </h2>
                        <div className={cx('map-placeholder')}>
                            
                            <p className={cx('map-address')}>{workspace.addressLine}</p>
                            <a href={`https://maps.google.com/?q=${encodeURIComponent(workspace.addressLine)}`} target="_blank" rel="noopener noreferrer" className={cx('map-link')}>
                                Mở trên Google Maps <ExternalLink size={12} />
                            </a>
                        </div>
                    </section>
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

        </div>
    );
}

export default WorkspaceDetail;
import React, { useState, useEffect } from "react";
import styles from './WorkspaceDetail.module.scss';
import classNames from "classnames/bind";
import { useParams } from "react-router-dom";
import { WorkSpaceDetail } from "~/types/WorkSpaces";
import { WorkSpaceRoom } from "~/types/WorkSpaceRoom";
import { GetWorkSpaceById } from "~/services/WorkSpaceService";
import { RoomSearchParams } from '~/services/WorkSpaceRoomService';
import { useSearchRooms } from "~/hooks/useSearchRooms";
import SearchRoomModal from "~/components/SearchRoomModal/SearchRoomModal";
import { 
    MapPin, Phone, Building, Users, Maximize, Clock, DollarSign, ChevronRight, 
    Loader, Sun, Wifi, Coffee, ParkingSquare, Snowflake, Calendar, ExternalLink,
    Search
} from 'lucide-react';

const cx = classNames.bind(styles);

// --- MOCK DATA ---
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

// --- SUB-COMPONENT: BẢNG PHÒNG ---
interface RoomTableProps {
    rooms: WorkSpaceRoom[];
}

const RoomTable: React.FC<RoomTableProps> = ({ rooms }) => {
    return (
        <div className={cx('room-table-container')}>
            {/* Hiển thị trạng thái không có phòng */}
            {(!rooms || rooms.length === 0) ? (
                <div className={cx('no-rooms-message')}>
                    <Building size={48} />
                    <p>Không có phòng nào để hiển thị.</p>
                </div>
            ) : (
                <div className={cx('table-responsive')}>
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
                                        <button className={cx('booking-button')}
                                            onClick={() => alert(`Yêu cầu đặt chỗ cho phòng ${room.title}`)}
                                        >
                                            Đặt chỗ ngay <ChevronRight size={16} />
                                        </button>
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
    
    // State quản lý modal
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

    // Hook tìm kiếm
    const {
        rooms: searchedRooms,
        isLoading: isSearchLoading,
        error: searchError,
        executeSearch
    } = useSearchRooms();

    const [hasSearched, setHasSearched] = useState(false);

    // Logic Fetch Data Workspace
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

    // Hàm xử lý khi submit form search
    const handleSearch = async (params: Omit<RoomSearchParams, 'workspaceId'>) => {
        if (!id) return;

        const searchParams: RoomSearchParams = {
            ...params,
            workspaceId: parseInt(id)
        };

        setHasSearched(true);
        await executeSearch(searchParams);
        setIsSearchModalOpen(false); // Đóng modal sau khi tìm kiếm
    };

    // Hàm xử lý khi xóa tìm kiếm
    const handleClearSearch = () => {
        setHasSearched(false);
        setIsSearchModalOpen(false); // Đóng modal khi xóa
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

            {/* 1. GALLERY ẢNH */}
            <section className={cx('gallery-section')}>
                <ImageGallery images={MOCK_IMAGES} limit={3} />
            </section>

            {/* 2. HEADER VÀ THÔNG TIN CHUNG */}
            <header className={cx('header-section')}>
                <h1 className={cx('title')}>{workspace.title}</h1>
                <p className={cx('subtitle')}>
                    <MapPin size={18} /> **Địa chỉ:** {workspace.addressLine}, {workspace.ward}
                </p>
                <div className={cx('tag')}>
                    <Building size={16} /> Loại hình: {workspace.workSpaceType}
                </div>
            </header>

            <div className={cx('top-grid')}>

                {/* CỘT CHÍNH (MAIN CONTENT) */}
                <div className={cx('main-info-column')}>

                    <h2 className={cx('section-heading')}>Giới Thiệu Chung</h2>
                    <p className={cx('description')}>
                        **{workspace.title}** là không gian làm việc lý tưởng tọa lạc tại trung tâm thành phố, được thiết kế theo phong cách tối giản hiện đại, tối ưu hóa sự hợp tác và năng suất. Chúng tôi cam kết mang lại trải nghiệm làm việc thoải mái, chuyên nghiệp và đầy đủ tiện nghi, giúp đội ngũ của bạn tập trung phát triển ý tưởng đột phá.
                    </p>
                    <p className={cx('description')}>{workspace.description}</p>

                    {/* ĐIỂM NỔI BẬT */}
                    <h2 className={cx('section-heading')}>Đặc Điểm Nổi Bật Của Tòa Nhà</h2>
                    <div className={cx('feature-list')}>
                        <div className={cx('feature-card')}>
                            <h3>Vị Trí Đắc Địa</h3>
                            <p>Chỉ cách các khu ẩm thực và trung tâm thương mại 5 phút đi bộ. Dễ dàng di chuyển bằng mọi phương tiện.</p>
                        </div>
                        <div className={cx('feature-card')}>
                            <h3>An Ninh Tuyệt Đối</h3>
                            <p>Hệ thống giám sát CCTV 24/7 và đội ngũ bảo vệ chuyên nghiệp đảm bảo an toàn tuyệt đối cho tài sản của bạn.</p>
                        </div>
                        <div className={cx('feature-card')}>
                            <h3>Thiết Kế Sáng Tạo</h3>
                            <p>Ánh sáng tự nhiên và không gian mở, kích thích sự sáng tạo và tương tác giữa các thành viên.</p>
                        </div>
                    </div>

                    {/* TIỆN ÍCH BAO GỒM */}
                    <h2 className={cx('section-heading')}>Tiện Ích Đi Kèm (All-inclusive)</h2>
                    <div className={cx('amenities-grid')}>
                        {MOCK_AMENITIES.map((item, index) => (
                            <div key={index} className={cx('amenity-item')}>
                                <item.icon size={24} className={cx('amenity-icon')} />
                                <div>
                                    <p className={cx('amenity-label')}>**{item.label}**</p>
                                    <p className={cx('amenity-detail')}>{item.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* QUY ĐỊNH & CHÍNH SÁCH */}
                    <h2 className={cx('section-heading')}>Quy Định & Chính Sách Thuê</h2>
                    <ul className={cx('policy-list')}>
                        {MOCK_POLICIES.map((policy, index) => (
                            <li key={index}><ChevronRight size={16} className={cx('policy-icon')} /> {policy}</li>
                        ))}
                    </ul>

                </div>

                {/* SIDEBAR - THÔNG TIN CHỦ HỘ VÀ BẢN ĐỒ */}
                <div className={cx('sidebar')}>

                    {/* THẺ TÍNH TOÁN NHANH VÀ ĐẶT CHỖ */}
                    <div className={cx('quick-booking-card')}>
                        <h3 className={cx('quick-booking-heading')}>Đặt Chỗ & Ưu Đãi</h3>

                        {/* Khu vực giá và nút CTA */}
                        <div className={cx('price-summary')}>
                            <span className={cx('label')}>Giá khởi điểm:</span>
                            <span className={cx('value')}>
                                **{(Math.min(...workspace.rooms.map(r => r.pricePerHour))).toLocaleString()} VNĐ**
                            </span>
                            <span className={cx('unit')}>/giờ</span>
                        </div>

                        {/* Giả định Quick Calculator (Mock) */}
                        <div className={cx('calculator-mock')}>
                            <p><strong>Tính nhanh:</strong> 8 giờ thuê = {(Math.min(...workspace.rooms.map(r => r.pricePerHour)) * 8).toLocaleString()} VNĐ</p>
                            <p className={cx('promotion')}>✨ Ưu đãi **10%** khi đặt trên 5 ngày!</p>
                        </div>

                        <button className={cx('action-button', 'book-now')}>
                            Chọn Phòng & Thanh Toán <ChevronRight size={18} />
                        </button>

                    </div>

                    {/* THẺ VỊ TRÍ VÀ HOST MINH BẠCH */}
                    <div className={cx('host-map-card')}>
                        <h4 className={cx('card-title')}><MapPin size={18} /> Vị Trí Chính Xác</h4>
                        <p className={cx('card-address')}>{workspace.addressLine}, {workspace.ward}</p>

                        <a
                            href={`https://maps.google.com/?q=${workspace.latitude},${workspace.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cx('map-placeholder-transparent-link')}
                        >
                            <div className={cx('map-placeholder-transparent')}>
                                <div className={cx('map-overlay-transparent')}>
                                    <ExternalLink size={20} className={cx('map-icon')} />
                                    <span className={cx('map-link-text')}>Mở Bản Đồ Google</span>
                                </div>
                            </div>
                        </a>

                        <div className={cx('host-info-block')}>
                            <h5 className={cx('host-info-heading')}><Building size={16} /> Chủ sở hữu</h5>
                            <p className={cx('host-detail-line')}>Host: **{workspace.hostName}**</p>
                            <p className={cx('host-detail-line')}>Công ty: {workspace.hostCompanyName}</p>
                            <p className={cx('host-detail-line')}><Phone size={16} /> Hotline: **{workspace.hostContactPhone}**</p>
                        </div>
                    </div>

                </div>
            </div>

            {/* KHU VỰC TÌM KIẾM VÀ DANH SÁCH PHÒNG */}
            <section className={cx('room-section')}>
                
                {/* HEADER VỚI NÚT MỞ MODAL */}
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

                {/* HIỂN THỊ TRẠNG THÁI TÌM KIẾM */}
                {isSearchLoading && (
                    <div className={cx('search-status', 'loading')}>
                        <Loader className={cx('loader-icon')} size={24} />
                        Đang tìm phòng theo yêu cầu của bạn...
                    </div>
                )}

                {searchError && (
                    <div className={cx('search-status', 'error')}>
                        ❌ {searchError}
                    </div>
                )}

                {/* HIỂN THỊ THÔNG BÁO KẾT QUẢ */}
                {hasSearched && !isSearchLoading && !searchError && (
                    <div className={cx('search-status', 'result-info')}>
                        {displayedRooms.length > 0
                            ? `🎉 Tìm thấy ${displayedRooms.length} phòng phù hợp.`
                            : `😥 Không tìm thấy phòng nào. Vui lòng thử lại với tiêu chí khác.`
                        }
                    </div>
                )}

                {/* BẢNG PHÒNG */}
                <RoomTable rooms={displayedRooms} />
            </section>

            {/* MODAL TÌM KIẾM PHÒNG */}
            <SearchRoomModal
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                onSearch={handleSearch}
                onClear={handleClearSearch}
                isLoading={isSearchLoading}
            />
        </div>
    );
}

export default WorkspaceDetail;
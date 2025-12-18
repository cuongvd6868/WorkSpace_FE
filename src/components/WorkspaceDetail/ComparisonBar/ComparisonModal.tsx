import { WorkSpaceRoom } from "~/types/WorkSpaceRoom";
import React from "react";
import classNames from "classnames/bind";
import styles from './ComparisonBar.module.scss'
import { AirVent, CheckCircle, Clock, Coffee, DollarSign, Leaf, ListTodo, Maximize, Monitor, ParkingSquare, PhoneMissed, Printer, ShieldCheck, Sun, UserCheck, Users, Utensils, Wifi, XCircle, Zap } from "lucide-react";

interface ComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
    rooms: WorkSpaceRoom[];
    onBookRoom: (room: WorkSpaceRoom) => void;
    clearComparison: () => void;
}

const MOCK_IMAGES: string[] = [
    'https://plus.unsplash.com/premium_photo-1682608388956-11f98495e165?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
    'https://plus.unsplash.com/premium_photo-1684769161054-2fa9a998dcb6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1504',
    'https://plus.unsplash.com/premium_photo-1683880731792-39c07ceea617?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
    'https://plus.unsplash.com/premium_photo-1661767467261-4a4bed92a507?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
    'https://images.unsplash.com/photo-1524758870432-af57e54afa26?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687',
];

export const DYNAMIC_AMENITIES = [
    { id: 1, label: 'Wi-Fi tốc độ cao', detail: 'Kết nối mạng không dây mạnh mẽ.', icon: Wifi, key: 'wifi' },
    // { id: 2, label: 'Điều hòa không khí', detail: 'Hệ thống làm mát hiện đại.', icon: AirVent, key: 'ac' },
    // { id: 3, label: 'Máy in & máy scan', detail: 'Tiện lợi cho tài liệu văn phòng.', icon: Printer, key: 'printer_scan' },
    // { id: 4, label: 'Phòng họp riêng', detail: 'Không gian kín đáo cho các cuộc họp.', icon: PhoneMissed, key: 'private_room' }, // Dùng tạm PhoneMissed
    // { id: 5, label: 'Coffee & Tea miễn phí', detail: 'Thưởng thức đồ uống không giới hạn.', icon: Coffee, key: 'coffee_tea' },
    // { id: 6, label: 'Ghế công thái học', detail: 'Thiết kế giúp bảo vệ sức khỏe khi làm việc.', icon: Users, key: 'ergonomic_chair' },
    // { id: 7, label: 'Khu vực nghỉ ngơi', detail: 'Nơi thư giãn, tái tạo năng lượng.', icon: Sun, key: 'rest_area' },
    // { id: 8, label: 'Tủ locker cá nhân', detail: 'Giữ đồ đạc an toàn, riêng tư.', icon: Lock, key: 'locker' },
    // { id: 9, label: 'Chỗ đỗ xe', detail: 'Bãi đỗ xe rộng rãi.', icon: ParkingSquare, key: 'parking' },
    // { id: 10, label: 'Hỗ trợ kỹ thuật', detail: 'Nhân viên IT luôn sẵn sàng hỗ trợ.', icon: Zap, key: 'tech_support' },
    // { id: 11, label: 'Máy chiếu & màn hình', detail: 'Hỗ trợ trình chiếu cho hội họp.', icon: Monitor, key: 'projector_screen' },
    // { id: 12, label: 'Bảng trắng', detail: 'Tiện lợi cho việc lên ý tưởng và thảo luận.', icon: ListTodo, key: 'whiteboard' },
    // { id: 13, label: 'Khu pantry', detail: 'Có tủ lạnh, lò vi sóng và bồn rửa.', icon: Utensils, key: 'pantry' },
    // { id: 14, label: 'Dịch vụ lễ tân', detail: 'Hỗ trợ đón tiếp khách hàng.', icon: UserCheck, key: 'reception' },
    // { id: 15, label: 'Bảo vệ 24/7', detail: 'An ninh tuyệt đối cả ngày lẫn đêm.', icon: ShieldCheck, key: 'security_24h' },
    // { id: 16, label: 'Thang máy', detail: 'Tiện lợi di chuyển giữa các tầng.', icon: Maximize, key: 'elevator' },
    // { id: 17, label: 'Không gian xanh', detail: 'Mang lại cảm giác thư thái, gần gũi thiên nhiên.', icon: Leaf, key: 'green_space' },
    // { id: 18, label: 'Hệ thống camera an ninh', detail: 'Giám sát khu vực chung 24/7.', icon: ShieldCheck, key: 'camera' },
    // { id: 19, label: 'Ổ cắm & sạc điện thoại', detail: 'Tích hợp ổ cắm tiện dụng.', icon: Zap, key: 'charging_port' },
    // { id: 20, label: 'Không gian yên tĩnh', detail: 'Dành cho những ai cần sự tập trung cao độ.', icon: Clock, key: 'quiet_area' },
];

const MOCK_AMENITIES = DYNAMIC_AMENITIES; // Sử dụng biến MOCK_AMENITIES cũ để giảm thiểu thay đổi code

// MOCK_ROOM_AMENITIES: Lấy key từ DYNAMIC_AMENITIES
const MOCK_ROOM_AMENITIES: { [key: number]: string[] } = {
    1: ['wifi', 'ac', 'projector_screen', 'private_room', 'elevator'], 
    2: ['wifi', 'coffee_tea', 'rest_area', 'ergonomic_chair', 'green_space', 'pantry'],
    3: ['wifi', 'ac', 'coffee_tea', 'parking', 'reception', 'whiteboard', 'security_24h'],
};

const cx = classNames.bind(styles)

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

    
    const allFeatures: FeatureType[] = [...comparisonFeatures];

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

export default ComparisonModal
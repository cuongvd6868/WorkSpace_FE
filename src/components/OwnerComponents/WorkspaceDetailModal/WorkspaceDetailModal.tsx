// WorkspaceDetailModal.tsx 
import React from 'react';
import classNames from "classnames/bind";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faBuilding, faMapMarkerAlt, faDollarSign, faUsers, faRulerCombined, faBan, faCog, faClock, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

// Import type từ file Workspaces (theo yêu cầu)
import { WorkspaceDetail, Room } from "~/types/Owner"; 
import { CLOUD_NAME } from '~/config/cloudinaryConfig'; // Giả định CLOUD_NAME tồn tại

import styles from './WorkspaceDetailModal.module.scss'; 

const cx = classNames.bind(styles);

interface WorkspaceDetailModalProps {
    workspace: WorkspaceDetail;
    onClose: () => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const WorkspaceDetailModal: React.FC<WorkspaceDetailModalProps> = ({ workspace, onClose }) => {
    
    // --- Helper function để render chi tiết từng phòng (Room Card) ---
    const renderRoom = (room: Room) => (
        <div key={room.id} className={cx('room-card')}>

            <div className={cx('room-header')}>
                <div className={cx('room-info')}>
                    <div className={cx('room-title')}>{room.title}</div>
                    <div className={cx('room-type')}>{room.roomType}</div>
                </div>
                <span className={cx('room-status', room.isActive ? 'status-active' : 'status-inactive')}>
                    {room.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                </span>
            </div>

            <div className={cx('room-details-grid')}>
                <div className={cx('detail-item', 'capacity')}><FontAwesomeIcon icon={faUsers} /> Sức chứa: **{room.capacity}** người</div>
                <div className={cx('detail-item', 'area')}><FontAwesomeIcon icon={faRulerCombined} /> Diện tích: **{room.area} m²**</div>
                <div className={cx('detail-item', 'price-hour')}><FontAwesomeIcon icon={faClock} /> Giá/Giờ: {formatCurrency(room.pricePerHour)}</div>
                <div className={cx('detail-item', 'price-day')}><FontAwesomeIcon icon={faCalendarAlt} /> Giá/Ngày: {formatCurrency(room.pricePerDay)}</div>
            </div>
            
            <h4 className={cx('amenities-title')}>Tiện ích:</h4>
            <div className={cx('amenities-list')}>
                {room.amenities.map(amenity => (
                    <span key={amenity.id} className={cx('amenity-tag')}>
                        <i className={amenity.iconClass}></i> {amenity.name}
                    </span>
                ))}
            </div>

            {room.blockedTimes && room.blockedTimes.length > 0 && (
                <div className={cx('blocked-times')}>
                    <h5><FontAwesomeIcon icon={faBan} /> Khung giờ bị chặn:</h5>
                    <ul>
                        {room.blockedTimes.map((block) => (
                            <li key={block.id || `${block.startTime}-${block.endTime}`}>
                                Từ: **{new Date(block.startTime).toLocaleString('vi-VN')}** - 
                                Đến: **{new Date(block.endTime).toLocaleString('vi-VN')}** (*{block.reason || 'Lý do không rõ'}*)
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            <div className={cx('room-actions')}>
                <button className={cx('action-btn', 'btn-edit')}><FontAwesomeIcon icon={faCog} /> Quản lý Room</button>
            </div>
        </div>
    );

    return (
        <div className={cx('modal-backdrop')} onClick={onClose}>
            <div className={cx('modal-container')} onClick={(e) => e.stopPropagation()}>
                
                {/* Header */}
                <div className={cx('modal-header')}>
                    <h2><FontAwesomeIcon icon={faBuilding} /> Chi tiết Workspace: {workspace.title}</h2>
                    <button className={cx('close-btn')} onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                {/* Body */}
                <div className={cx('modal-body')}>
                    
                    {/* Workspace Details (Phần 1) */}
                    <div className={cx('workspace-details-grid')}>
                        {/* Cột 1: Thông tin cơ bản */}
                        <div className={cx('info-column')}>
                            <p className={cx('detail-row')}><FontAwesomeIcon icon={faMapMarkerAlt} /> **Địa chỉ:** {workspace.addressLine}, {workspace.ward}, {workspace.state}</p>
                            <p className={cx('detail-row')}>**Loại:** {workspace.workSpaceType}</p>
                            <p className={cx('detail-row')}>**Host:** {workspace.hostName} ({workspace.hostCompanyName})</p>
                            <p className={cx('detail-row')}>**Trạng thái:** <span className={cx('status-badge', workspace.isActive ? 'status-active' : 'status-inactive')}>
                                    {workspace.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                                </span>
                            </p>
                        </div>

                        {/* Cột 2: Hình ảnh */}

                    </div>

                    {/* Rooms Section (Phần 2) */}
                    <div className={cx('rooms-section')}>
                        <h3><FontAwesomeIcon icon={faUsers} /> Danh sách Phòng ({workspace.totalRooms} phòng)</h3>
                        
                        <p className={cx('room-summary')}>*Có **{workspace.availableRooms}** phòng đang sẵn sàng (Min giá/ngày: {formatCurrency(workspace.minPricePerDay)}).</p>
                        <div className={cx('rooms-list')}>
                            {workspace.rooms.length > 0 ? (
                                
                                workspace.rooms.map(renderRoom)
                            ) : (
                                <p className={cx('no-rooms')}>Workspace này chưa có phòng nào.</p>
                            )}
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className={cx('modal-footer')}>
                    <button className={cx('btn-primary')} onClick={onClose}>Hoàn tất</button>
                </div>
            </div>
        </div>
    );
};

export default WorkspaceDetailModal;
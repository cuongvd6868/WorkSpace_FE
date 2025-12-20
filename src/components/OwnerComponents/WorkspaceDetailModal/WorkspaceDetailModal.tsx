import React, { useState } from 'react';
import classNames from "classnames/bind";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTimes, faBuilding, faMapMarkerAlt, faUsers, faRulerCombined, 
    faBan, faCog, faClock, faCalendarAlt, faEdit, faSave, faTrash 
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

import { WorkspaceDetail, Room } from "~/types/Owner";
import { handleUpdateWorkspace, handleUpdateRoom } from "~/services/OwnerService";
import styles from './WorkspaceDetailModal.module.scss';

const cx = classNames.bind(styles);

interface WorkspaceDetailModalProps {
    workspace: WorkspaceDetail;
    onClose: () => void;
    onRefresh: () => void; // Hàm để load lại danh sách sau khi update thành công
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const WorkspaceDetailModal: React.FC<WorkspaceDetailModalProps> = ({ workspace, onClose, onRefresh }) => {
    const token = localStorage.getItem('token') || "";
    
    // State cho việc chỉnh sửa Workspace
    const [isEditingWorkspace, setIsEditingWorkspace] = useState(false);
    const [wsData, setWsData] = useState({
        title: workspace.title,
        description: workspace.description,
        isActive: workspace.isActive,
        addressLine: workspace.addressLine
    });

    // State cho việc chỉnh sửa Room (lưu ID phòng đang edit)
    const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
    const [roomEditData, setRoomEditData] = useState<Partial<Room>>({});

    // --- Xử lý Update Workspace ---
    const saveWorkspaceUpdate = async () => {
        try {
            const payload = {
                workspaceId: workspace.id,
                title: wsData.title,
                description: wsData.description,
                isActive: wsData.isActive,
                street: wsData.addressLine,
                ward: workspace.ward,
                state: workspace.state,
                postalCode: "70000", 
                latitude: workspace.latitude,
                longitude: workspace.longitude,
                workSpaceTypeId: 1, // Nên lấy từ data nếu có
                imageUrls: workspace.imageUrls
            };
            await handleUpdateWorkspace(payload as any, token);
            toast.success("Cập nhật Workspace thành công!");
            setIsEditingWorkspace(false);
            onRefresh();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    // --- Xử lý Update Room ---
    const startEditRoom = (room: Room) => {
        setEditingRoomId(room.id);
        setRoomEditData({ ...room });
    };

    const saveRoomUpdate = async (roomId: number) => {
        try {
            const payload = {
                roomId: roomId,
                title: roomEditData.title || "",
                description: roomEditData.description || "",
                capacity: Number(roomEditData.capacity),
                area: Number(roomEditData.area),
                pricePerHour: Number(roomEditData.pricePerHour),
                pricePerDay: Number(roomEditData.pricePerDay),
                pricePerMonth: Number(roomEditData.pricePerMonth),
                isActive: roomEditData.isActive ?? true,
                workSpaceRoomTypeId: 1, // Cần map đúng ID
            };
            await handleUpdateRoom(payload as any, token);
            toast.success("Cập nhật phòng thành công!");
            setEditingRoomId(null);
            onRefresh();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const renderRoom = (room: Room) => {
        const isEditing = editingRoomId === room.id;

        return (
            <div key={room.id} className={cx('room-card', { 'editing': isEditing })}>
                <div className={cx('room-header')}>
                    <div className={cx('room-info')}>
                        {isEditing ? (
                            <input 
                                className={cx('edit-input-title')}
                                value={roomEditData.title} 
                                onChange={e => setRoomEditData({...roomEditData, title: e.target.value})}
                            />
                        ) : (
                            <div className={cx('room-title')}>{room.title}</div>
                        )}
                        <div className={cx('room-type')}>{room.roomType}</div>
                    </div>
                    <div className={cx('status-box')}>
                         {isEditing ? (
                            <select 
                                value={roomEditData.isActive ? "true" : "false"}
                                onChange={e => setRoomEditData({...roomEditData, isActive: e.target.value === "true"})}
                            >
                                <option value="true">Hoạt động</option>
                                <option value="false">Tạm dừng</option>
                            </select>
                         ) : (
                            <span className={cx('room-status', room.isActive ? 'status-active' : 'status-inactive')}>
                                {room.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                            </span>
                         )}
                    </div>
                </div>

                <div className={cx('room-details-grid')}>
                    <div className={cx('detail-item')}>
                        <FontAwesomeIcon icon={faUsers} /> Sức chứa: 
                        {isEditing ? (
                            <input type="number" value={roomEditData.capacity} onChange={e => setRoomEditData({...roomEditData, capacity: parseInt(e.target.value)})} />
                        ) : (
                            <b> {room.capacity} người</b>
                        )}
                    </div>
                    <div className={cx('detail-item')}>
                        <FontAwesomeIcon icon={faRulerCombined} /> Diện tích: 
                        {isEditing ? (
                            <input type="number" value={roomEditData.area} onChange={e => setRoomEditData({...roomEditData, area: parseInt(e.target.value)})} />
                        ) : (
                            <b> {room.area} m²</b>
                        )}
                    </div>
                    <div className={cx('detail-item')}>
                        <FontAwesomeIcon icon={faClock} /> Giá/Giờ: 
                        {isEditing ? (
                            <input type="number" value={roomEditData.pricePerHour} onChange={e => setRoomEditData({...roomEditData, pricePerHour: parseInt(e.target.value)})} />
                        ) : (
                            <b> {formatCurrency(room.pricePerHour)}</b>
                        )}
                    </div>
                    <div className={cx('detail-item')}>
                        <FontAwesomeIcon icon={faCalendarAlt} /> Giá/Ngày: 
                        {isEditing ? (
                            <input type="number" value={roomEditData.pricePerDay} onChange={e => setRoomEditData({...roomEditData, pricePerDay: parseInt(e.target.value)})} />
                        ) : (
                            <b> {formatCurrency(room.pricePerDay)}</b>
                        )}
                    </div>
                </div>

                <div className={cx('room-actions')}>
                    {isEditing ? (
                        <>
                            <button className={cx('action-btn', 'btn-save')} onClick={() => saveRoomUpdate(room.id)}>
                                <FontAwesomeIcon icon={faSave} /> Lưu
                            </button>
                            <button className={cx('action-btn', 'btn-cancel')} onClick={() => setEditingRoomId(null)}>Hủy</button>
                        </>
                    ) : (
                        <button className={cx('action-btn', 'btn-edit')} onClick={() => startEditRoom(room)}>
                            <FontAwesomeIcon icon={faCog} /> Chỉnh sửa phòng
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className={cx('modal-backdrop')} onClick={onClose}>
            <div className={cx('modal-container')} onClick={(e) => e.stopPropagation()}>
                <div className={cx('modal-header')}>
                    {isEditingWorkspace ? (
                        <input 
                            className={cx('edit-ws-title')} 
                            value={wsData.title} 
                            onChange={e => setWsData({...wsData, title: e.target.value})}
                        />
                    ) : (
                        <h2><FontAwesomeIcon icon={faBuilding} /> {workspace.title}</h2>
                    )}
                    <div className={cx('header-btns')}>
                        {isEditingWorkspace ? (
                            <button className={cx('btn-save-ws')} onClick={saveWorkspaceUpdate}><FontAwesomeIcon icon={faSave} /> Lưu</button>
                        ) : (
                            <button className={cx('btn-edit-ws')} onClick={() => setIsEditingWorkspace(true)}><FontAwesomeIcon icon={faEdit} /> Sửa WS</button>
                        )}
                        <button className={cx('close-btn')} onClick={onClose}><FontAwesomeIcon icon={faTimes} /></button>
                    </div>
                </div>

                <div className={cx('modal-body')}>
                    <div className={cx('workspace-details-grid')}>
                        <div className={cx('info-column')}>
                            <div className={cx('detail-row')}>
                                <FontAwesomeIcon icon={faMapMarkerAlt} /> <b>Địa chỉ:</b> 
                                {isEditingWorkspace ? (
                                    <input value={wsData.addressLine} onChange={e => setWsData({...wsData, addressLine: e.target.value})} />
                                ) : (
                                    ` ${workspace.addressLine}, ${workspace.ward}, ${workspace.state}`
                                )}
                            </div>
                            <p className={cx('detail-row')}><b>Loại:</b> {workspace.workSpaceType}</p>
                            <p className={cx('detail-row')}><b>Trạng thái:</b> 
                                {isEditingWorkspace ? (
                                    <input type="checkbox" checked={wsData.isActive} onChange={e => setWsData({...wsData, isActive: e.target.checked})} />
                                ) : (
                                    <span className={cx('status-badge', workspace.isActive ? 'status-active' : 'status-inactive')}>
                                        {workspace.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className={cx('rooms-section')}>
                        <h3><FontAwesomeIcon icon={faUsers} /> Danh sách Phòng ({workspace.totalRooms})</h3>
                        <div className={cx('rooms-list')}>
                            {workspace.rooms.map(renderRoom)}
                        </div>
                    </div>
                </div>

                <div className={cx('modal-footer')}>
                    <button className={cx('btn-primary')} onClick={onClose}>Đóng</button>
                </div>
            </div>
        </div>
    );
};

export default WorkspaceDetailModal;
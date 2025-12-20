// OwnerWorkspacesTable.tsx

import React, { useEffect, useState, useCallback } from "react";
import classNames from "classnames/bind";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSpinner, 
    faEye, 
    faPlus, 
    faBuilding, 
    faMapMarkerAlt,
    faCogs,
    faRefresh,
    faExclamationTriangle,
    faImage,
    faLayerGroup,
    faTag
} from '@fortawesome/free-solid-svg-icons';

// Giả định: Import types từ các file tương ứng
import { WorkspacesOwnerView } from "~/types/Owner"; 
import { WorkspaceDetail } from "~/types/Owner"; 

// Giả định: Import service thật
import { getAllWorkspacesOwnerView, getWorkspaceDetailOwnerView } from "~/services/OwnerService"; 

// IMPORT MODAL THẬT
import WorkspaceDetailModal from "../WorkspaceDetailModal/WorkspaceDetailModal";
import CreateRoomModal from "../CreateRoomModal/CreateRoomModal";

import styles from './OwnerWorkspacesTable.module.scss';
import { CLOUD_NAME } from "~/config/cloudinaryConfig"; // Giả định import CLOUD_NAME

const cx = classNames.bind(styles); 

const OwnerWorkspacesTable: React.FC = () => {
    const [workspaces, setWorkspaces] = useState<WorkspacesOwnerView[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // --- State cho Modal Chi tiết ---
    const [selectedWorkspaceIdForDetail, setSelectedWorkspaceIdForDetail] = useState<number | null>(null);
    const [workspaceDetail, setWorkspaceDetail] = useState<WorkspaceDetail | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    
    // --- State cho Modal Tạo Phòng ---
    const [selectedWorkspaceIdForRoom, setSelectedWorkspaceIdForRoom] = useState<number | null>(null);
    // ---------------------------------

    const fetchWorkspaces = useCallback(async () => {
        const loadingState = !refreshing;
        if (loadingState) setIsLoading(true);
        setError(null);
        try {
            // GỌI SERVICE LẤY DỮ LIỆU THẬT
            const data = await getAllWorkspacesOwnerView(); 
            setWorkspaces(data);
        } catch (err) {
            console.error("Lỗi khi tải Workspace:", err);
            setError("Không thể tải danh sách Workspace. Vui lòng thử lại.");
            toast.error("Lỗi khi tải danh sách Workspace.");
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [refreshing]);

    useEffect(() => {
        fetchWorkspaces();
    }, [fetchWorkspaces]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchWorkspaces();
    };

    // --- Logic Fetch Chi tiết Workspace và mở Modal ---
    const handleViewDetails = useCallback(async (workspaceId: number) => {
        setSelectedWorkspaceIdForDetail(workspaceId); 
        setWorkspaceDetail(null); 
        setIsDetailLoading(true);

        try {
            // GỌI SERVICE LẤY DỮ LIỆU THẬT
            const detail = await getWorkspaceDetailOwnerView(workspaceId);
            setWorkspaceDetail(detail);
        } catch (err: any) {
            console.error("Lỗi khi tải chi tiết Workspace:", err);
            toast.error(err.message || "Không thể tải chi tiết Workspace.");
            setSelectedWorkspaceIdForDetail(null);
        } finally {
            setIsDetailLoading(false);
        }
    }, []);

    const handleCloseDetailModal = () => {
        setSelectedWorkspaceIdForDetail(null);
        setWorkspaceDetail(null);
    };

    // --- Logic Mở Modal Tạo Room ---
    const handleAddRoom = (workspaceId: number) => {
        setSelectedWorkspaceIdForRoom(workspaceId);
    };

    const handleCloseRoomModal = () => {
        setSelectedWorkspaceIdForRoom(null);
    };
    
    // Hàm gọi khi Tạo Room thành công từ Modal
    const handleRoomCreated = () => {
        handleRefresh(); // Tải lại danh sách để cập nhật tổng số phòng
    };


    // --- Loading State UI ---
    if (isLoading) { 
        return (
            <div className={cx('loading-container')}>
                <div className={cx('loading-content')}>
                    <div className={cx('loading-icon')}>
                        <FontAwesomeIcon icon={faSpinner} spin />
                    </div>
                    <h3 className={cx('loading-title')}>Đang tải Workspace</h3>
                    <p className={cx('loading-subtitle')}>Vui lòng chờ trong giây lát...</p>
                </div>
            </div>
        );
    }
    
    // --- Error State UI ---
    if (error) { 
        return (
            <div className={cx('error-container')}>
                <div className={cx('error-content')}>
                    <div className={cx('error-icon')}>
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                    </div>
                    <h3 className={cx('error-title')}>Đã xảy ra lỗi</h3>
                    <p className={cx('error-message')}>{error}</p>
                    <div className={cx('error-actions')}>
                        <button 
                            onClick={handleRefresh} 
                            className={cx('refresh-btn')}
                        >
                            <FontAwesomeIcon icon={faRefresh} />
                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    // --- Empty State UI ---
    if (workspaces.length === 0) { 
         return (
            <div className={cx('empty-container')}>
                <div className={cx('empty-content')}>
                    <div className={cx('empty-icon')}>
                        <FontAwesomeIcon icon={faBuilding} />
                    </div>
                    <h3 className={cx('empty-title')}>Chưa có Workspace nào</h3>
                    <p className={cx('empty-message')}>
                        Bạn chưa đăng ký workspace nào. Hãy tạo workspace đầu tiên để bắt đầu!
                    </p>
                </div>
            </div>
        );
    }


    // --- Main Table & Modal Logic ---
    return (
        <div className={cx('dashboard')}>
            {/* Header và Refresh Button */}
            <div className={cx('dashboard-header')}>
                <div className={cx('header-content')}>
                    <div className={cx('header-icon')}>
                        <FontAwesomeIcon icon={faBuilding} />
                    </div>
                    <div className={cx('header-text')}>
                        <h1 className={cx('dashboard-title')}>Quản lý Workspace</h1>
                        <p className={cx('dashboard-subtitle')}>
                            Tổng cộng <span className={cx('highlight')}>{workspaces.length}</span> workspace đang quản lý
                        </p>
                    </div>
                </div>
                <button 
                    onClick={handleRefresh}
                    className={cx('refresh-button', { refreshing })}
                    disabled={refreshing}
                >
                    <FontAwesomeIcon icon={faRefresh} spin={refreshing} />
                    {refreshing ? 'Đang làm mới...' : 'Làm mới'}
                </button>
            </div>

            {/* Table UI */}
            <div className={cx('table-container')}>
                <div className={cx('table-wrapper')}>
                    <table className={cx('workspaces-table')}>
                        <thead>
                            <tr>
                                <th className={cx('th-id')}><div className={cx('th-content')}><FontAwesomeIcon icon={faTag} className={cx('th-icon')} /><span>ID</span></div></th>
                                <th className={cx('th-title')}><div className={cx('th-content')}><FontAwesomeIcon icon={faBuilding} className={cx('th-icon')} /><span>Tên Workspace</span></div></th>
                                <th className={cx('th-type')}><div className={cx('th-content')}><FontAwesomeIcon icon={faCogs} className={cx('th-icon')} /><span>Loại</span></div></th>
                                <th className={cx('th-rooms')}><div className={cx('th-content')}><FontAwesomeIcon icon={faLayerGroup} className={cx('th-icon')} /><span>Phòng</span></div></th>
                                <th className={cx('th-address')}><div className={cx('th-content')}><FontAwesomeIcon icon={faMapMarkerAlt} className={cx('th-icon')} /><span>Địa chỉ</span></div></th>
                                <th className={cx('th-thumbnail')}><div className={cx('th-content')}><FontAwesomeIcon icon={faImage} className={cx('th-icon')} /><span>Ảnh bìa</span></div></th>
                                <th className={cx('th-status')}><div className={cx('th-content')}><FontAwesomeIcon icon={faCogs} className={cx('th-icon')} /><span>Trạng thái</span></div></th>
                                <th className={cx('th-actions')}><div className={cx('th-content')}><span>Hành động</span></div></th>
                            </tr>
                        </thead>
                        <tbody>
                            {workspaces.map((ws) => (
                                <tr key={ws.id} className={cx('table-row')}>
                                    <td className={cx('td-id')}><div className={cx('id-badge')}>#{ws.id.toString().padStart(3, '0')}</div></td>
                                    <td className={cx('td-title')}>
                                        <div className={cx('workspace-info')}>
                                            <div className={cx('workspace-title')}>{ws.title}</div>
                                            <div className={cx('workspace-subtitle')}>Tạo ngày {new Date().toLocaleDateString('vi-VN')}</div>
                                        </div>
                                    </td>
                                    <td className={cx('td-type')}><div className={cx('type-badge')}>{ws.workSpaceTypeName}</div></td>
                                    <td className={cx('td-rooms')}><div className={cx('rooms-count')}><div className={cx('count-number')}>{ws.totalRooms}</div><div className={cx('count-label')}>phòng</div></div></td>
                                    <td className={cx('td-address')}><div className={cx('address-text')}><FontAwesomeIcon icon={faMapMarkerAlt} className={cx('address-icon')} />{ws.addressLine}</div></td>
                                    <td className={cx('td-thumbnail')}>
                                        <div className={cx('thumbnail-container')}>
                                            {ws.thumbnailUrl ? (
                                                <img 
                                                    src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${ws.thumbnailUrl}`} 
                                                    alt={ws.title} 
                                                    className={cx('thumbnail-img')}
                                                    onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/100x60/667eea/ffffff?text=WS'; }}
                                                />
                                            ) : (
                                                <div className={cx('thumbnail-placeholder')}><FontAwesomeIcon icon={faImage} /></div>
                                            )}
                                        </div>
                                    </td>
                                    
                                    {/* CỘT TRẠNG THÁI: CHỈ HIỂN THỊ ACTIVE (THEO YÊU CẦU) */}
                                    <td className={cx('td-status')}>
                                        <div className={cx('status-container')}>
                                            <div className={cx('status-badge', 'status-active')}>
                                                <div className={cx('status-dot')}></div>
                                                Active
                                            </div>
                                        </div>
                                    </td>
                                    
                                    <td className={cx('td-actions')}>
                                        <div className={cx('action-buttons')}>
                                            <button 
                                                className={cx('action-btn', 'btn-details')}
                                                onClick={() => handleViewDetails(ws.id)} 
                                                title="Xem chi tiết"
                                                disabled={isDetailLoading && selectedWorkspaceIdForDetail === ws.id}
                                            >
                                                <FontAwesomeIcon 
                                                    icon={isDetailLoading && selectedWorkspaceIdForDetail === ws.id ? faSpinner : faEye} 
                                                    spin={isDetailLoading && selectedWorkspaceIdForDetail === ws.id} 
                                                />
                                                <span>Chi tiết</span>
                                            </button>
                                            <button 
                                                className={cx('action-btn', 'btn-add-room')}
                                                onClick={() => handleAddRoom(ws.id)} 
                                                title="Thêm phòng"
                                                disabled={isDetailLoading}
                                            >
                                                <FontAwesomeIcon icon={faPlus} />
                                                <span>Thêm phòng</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- Modal Rendering --- */}

            {/* Loading Modal khi fetch chi tiết */}
            {(selectedWorkspaceIdForDetail && isDetailLoading) && (
                <div className={cx('loading-modal-backdrop')}>
                    <FontAwesomeIcon icon={faSpinner} spin size="2x" color="#fff" />
                    <p className={cx('loading-text')}>Đang tải chi tiết Workspace...</p>
                </div>
            )}
            
            {/* Modal Chi tiết Workspace (Sử dụng dữ liệu thật) */}
            {workspaceDetail && (
                <WorkspaceDetailModal
                    workspace={workspaceDetail}
                    onClose={handleCloseDetailModal}
                    onRefresh={handleRefresh} 
                />
            )}

            {/* Modal Thêm Phòng (Sử dụng service tạo phòng thật) */}
            {selectedWorkspaceIdForRoom !== null && (
                <CreateRoomModal 
                    workspaceId={selectedWorkspaceIdForRoom}
                    onClose={handleCloseRoomModal}
                    onRoomCreated={handleRoomCreated}
                />
            )}
        </div>
    );
};

export default OwnerWorkspacesTable;
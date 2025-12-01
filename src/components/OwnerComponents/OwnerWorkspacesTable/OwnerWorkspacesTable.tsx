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

import { WorkspacesOwnerView } from "~/types/Owner"; 
import { getAllWorkspacesOwnerView } from "~/services/OwnerService";

import styles from './OwnerWorkspacesTable.module.scss';
import { CLOUD_NAME } from "~/config/cloudinaryConfig";

const cx = classNames.bind(styles); 

type OwnerWorkspacesTableProps = {
    onAddRoom: (workspaceId: number) => void;
    onViewDetails: (workspaceId: number) => void;
};

const OwnerWorkspacesTable: React.FC<OwnerWorkspacesTableProps> = ({ 
    onAddRoom, 
    onViewDetails 
}) => {
    const [workspaces, setWorkspaces] = useState<WorkspacesOwnerView[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchWorkspaces = useCallback(async () => {
        const loadingState = !refreshing;
        if (loadingState) setIsLoading(true);
        setError(null);
        try {
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

    const handleRefresh = () => {
        setRefreshing(true);
        fetchWorkspaces();
    };

    useEffect(() => {
        fetchWorkspaces();
    }, [fetchWorkspaces]);

    // --- Loading State ---
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

    // --- Error State ---
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
    
    // --- Empty State ---
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

    // --- Main Table ---
    return (
        <div className={cx('dashboard')}>
            <div className={cx('dashboard-header')}>
                <div className={cx('header-content')}>
                    <div className={cx('header-icon')}>
                        <FontAwesomeIcon icon={faBuilding} />
                    </div>
                    <div className={cx('header-text')}>
                        <h1 className={cx('dashboard-title')}>Quản lý Workspace</h1>
                        <p className={cx('dashboard-subtitle')}>
                            {/* Tổng cộng <span className={cx('highlight')}>{workspaces.length}</span> workspace đang quản lý */}
                            Tổng cộng <span className={cx('highlight')}></span> workspace đang quản lý
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

            <div className={cx('table-container')}>
                <div className={cx('table-wrapper')}>
                    <table className={cx('workspaces-table')}>
                        <thead>
                            <tr>
                                <th className={cx('th-id')}>
                                    <div className={cx('th-content')}>
                                        <FontAwesomeIcon icon={faTag} className={cx('th-icon')} />
                                        <span>ID</span>
                                    </div>
                                </th>
                                <th className={cx('th-title')}>
                                    <div className={cx('th-content')}>
                                        <FontAwesomeIcon icon={faBuilding} className={cx('th-icon')} />
                                        <span>Tên Workspace</span>
                                    </div>
                                </th>
                                <th className={cx('th-type')}>
                                    <div className={cx('th-content')}>
                                        <FontAwesomeIcon icon={faCogs} className={cx('th-icon')} />
                                        <span>Loại</span>
                                    </div>
                                </th>
                                <th className={cx('th-rooms')}>
                                    <div className={cx('th-content')}>
                                        <FontAwesomeIcon icon={faLayerGroup} className={cx('th-icon')} />
                                        <span>Phòng</span>
                                    </div>
                                </th>
                                <th className={cx('th-address')}>
                                    <div className={cx('th-content')}>
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className={cx('th-icon')} />
                                        <span>Địa chỉ</span>
                                    </div>
                                </th>
                                <th className={cx('th-thumbnail')}>
                                    <div className={cx('th-content')}>
                                        <FontAwesomeIcon icon={faImage} className={cx('th-icon')} />
                                        <span>Ảnh bìa</span>
                                    </div>
                                </th>
                                <th className={cx('th-status')}>
                                    <div className={cx('th-content')}>
                                        <FontAwesomeIcon icon={faCogs} className={cx('th-icon')} />
                                        <span>Trạng thái</span>
                                    </div>
                                </th>
                                <th className={cx('th-actions')}>
                                    <div className={cx('th-content')}>
                                        <span>Hành động</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {workspaces.map((ws) => (
                                <tr key={ws.id} className={cx('table-row')}>
                                    <td className={cx('td-id')}>
                                        <div className={cx('id-badge')}>
                                            #{ws.id.toString().padStart(3, '0')}
                                        </div>
                                    </td>
                                    <td className={cx('td-title')}>
                                        <div className={cx('workspace-info')}>
                                            <div className={cx('workspace-title')}>{ws.title}</div>
                                            <div className={cx('workspace-subtitle')}>
                                                Tạo ngày {new Date().toLocaleDateString('vi-VN')}
                                            </div>
                                        </div>
                                    </td>
                                    <td className={cx('td-type')}>
                                        <div className={cx('type-badge')}>
                                            {ws.workSpaceTypeName}
                                        </div>
                                    </td>
                                    <td className={cx('td-rooms')}>
                                        <div className={cx('rooms-count')}>
                                            <div className={cx('count-number')}>{ws.totalRooms}</div>
                                            <div className={cx('count-label')}>phòng</div>
                                        </div>
                                    </td>
                                    <td className={cx('td-address')}>
                                        <div className={cx('address-text')}>
                                            <FontAwesomeIcon icon={faMapMarkerAlt} className={cx('address-icon')} />
                                            {ws.addressLine}
                                        </div>
                                    </td>
                                    <td className={cx('td-thumbnail')}>
                                        <div className={cx('thumbnail-container')}>
                                            {ws.thumbnailUrl ? (
                                                <img 
                                                    // src={ws.thumbnailUrl} 
                                                    src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${ws.thumbnailUrl}`} 
                                                    alt={ws.title} 
                                                    className={cx('thumbnail-img')}
                                                    onError={(e) => {
                                                        e.currentTarget.src = 'https://via.placeholder.com/100x60/667eea/ffffff?text=WS';
                                                    }}
                                                />
                                            ) : (
                                                <div className={cx('thumbnail-placeholder')}>
                                                    <FontAwesomeIcon icon={faImage} />
                                                </div>
                                            )}
                                        </div>
                                    </td>
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
                                                onClick={() => onViewDetails(ws.id)}
                                                title="Xem chi tiết"
                                            >
                                                <FontAwesomeIcon icon={faEye} />
                                                <span>Chi tiết</span>
                                            </button>
                                            <button 
                                                className={cx('action-btn', 'btn-add-room')}
                                                onClick={() => onAddRoom(ws.id)}
                                                title="Thêm phòng"
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

            {/* Table Footer */}
            <div className={cx('table-footer')}>
                <div className={cx('footer-info')}>
                    Hiển thị <span className={cx('footer-highlight')}>{workspaces.length}</span> workspace
                </div>
                <div className={cx('footer-actions')}>
                    <button 
                        className={cx('export-btn')}
                        onClick={handleRefresh}
                    >
                        <FontAwesomeIcon icon={faRefresh} />
                        Xuất dữ liệu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OwnerWorkspacesTable;
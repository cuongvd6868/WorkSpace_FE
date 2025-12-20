import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faCheckSquare, faSpinner, faTimesCircle, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { getAllPendingWorkspaces, handleApproveWorkspace } from '~/services/StaffService'; 
import { WorkspaceItem } from '~/types/Staff';
import styles from './WorkspacesPendingList.module.scss';
import { toast } from 'react-toastify';

// Import modal mới
import PendingWorkspaceDetailModal from '../PendingWorkspaceDetailModal/PendingWorkspaceDetailModal';

const cx = classNames.bind(styles);

const WorkspacesPendingList: React.FC = () => {
    const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceItem | null>(null);

    const fetchPendingWorkspaces = async () => {
        setIsLoading(true);
        try {
            const data: WorkspaceItem[] = await getAllPendingWorkspaces(); 
            setWorkspaces(data);
        } catch (error) {
            toast.error("Lỗi khi tải danh sách Workspace chờ duyệt.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingWorkspaces();
    }, []);

    const handleApprove = async (id: number, title: string) => {
        if (window.confirm(`Bạn có chắc chắn muốn DUYỆT Workspace "${title}"?`)) {
            try {
                await handleApproveWorkspace(id); 
                toast.success(`Workspace "${title}" đã được duyệt thành công!`);
                setSelectedWorkspace(null); // Đóng modal nếu đang mở
                fetchPendingWorkspaces();
            } catch (error) {
                toast.error(`Lỗi khi duyệt Workspace.`);
            }
        }
    };

    const handleReject = async (id: number, title: string) => {
        if (window.confirm(`Bạn có chắc chắn muốn TỪ CHỐI Workspace "${title}"?`)) {
            toast.info(`Workspace "${title}" đã bị từ chối.`);
            setSelectedWorkspace(null);
            fetchPendingWorkspaces(); 
        }
    };

    if (isLoading) return <div className={cx('loading')}><FontAwesomeIcon icon={faSpinner} spin /> Đang tải...</div>;

    return (
        <div className={cx('data-table-wrapper')}>
            <table className={cx('workspace-table')}>
                <thead>
                    <tr>
                        <th style={{ width: '25%' }}>Workspace</th>
                        <th style={{ width: '25%' }}>Địa chỉ</th>
                        <th style={{ width: '20%' }}>Host</th>
                        <th style={{ width: '10%' }} className={cx('center-text')}>Số Phòng</th>
                        <th style={{ width: '10%' }}>Ngày Đăng Ký</th>
                        <th style={{ width: '15%' }}>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {workspaces.map((ws) => (
                        <tr key={ws.id}>
                            <td className={cx('ws-title-cell')}>
                                <FontAwesomeIcon icon={faBuilding} className={cx('ws-icon')} />
                                <strong>{ws.title}</strong>
                                <span className={cx('ws-type')}>{ws.workSpaceTypeName}</span>
                            </td>
                            <td>{ws.addressLine}, <strong>{ws.city}</strong></td>
                            <td>
                                <strong>{ws.hostName}</strong><br />
                                <small style={{ color: '#007bff' }}>{ws.hostEmail}</small>
                            </td>
                            <td className={cx('center-text')}>{ws.totalRooms}</td>
                            <td>{new Date(ws.createdDate).toLocaleDateString('vi-VN')}</td>
                            <td>
                                <div className={cx('action-btns')}>
                                    <button 
                                        className={cx('action-btn', 'approve')} 
                                        onClick={() => handleApprove(ws.id, ws.title)}
                                    >
                                        Phê duyệt
                                    </button>
                                    
                                    <button 
                                        className={cx('action-btn', 'view')} 
                                        onClick={() => setSelectedWorkspace(ws)}
                                    >
                                        Xem chi tiết
                                    </button>
                                    
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal Chi tiết */}
            {selectedWorkspace && (
                <PendingWorkspaceDetailModal 
                    workspace={selectedWorkspace}
                    onClose={() => setSelectedWorkspace(null)}
                    onApprove={handleApprove}
                    onReject={handleReject}
                />
            )}
        </div>
    );
};

export default WorkspacesPendingList;
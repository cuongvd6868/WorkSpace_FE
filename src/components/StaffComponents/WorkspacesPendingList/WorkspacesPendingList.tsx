import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faCheckSquare, faSpinner, faTimesCircle, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { getAllPendingWorkspaces, handleApproveWorkspace } from '~/services/StaffService'; 
import { WorkspaceItem } from '~/types/Staff';
import styles from './WorkspacesPendingList.module.scss';
import { toast } from 'react-toastify';

const cx = classNames.bind(styles);

const WorkspacesPendingList: React.FC = () => {
    const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPendingWorkspaces = async () => {
        setIsLoading(true);
        try {
            // Chỉ lấy các Workspace đang chờ duyệt
            const data: WorkspaceItem[] = await getAllPendingWorkspaces(); 
            setWorkspaces(data);
        } catch (error) {
            toast.error("Lỗi khi tải danh sách Workspace chờ duyệt.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingWorkspaces();
    }, []);

    const handleApprove = async (id: number, title: string) => {
        if (window.confirm(`Bạn có chắc chắn muốn DUYỆT Workspace "${title}" và cho phép nó hoạt động trên hệ thống?`)) {
            try {
                // Đảm bảo truyền Body rỗng {} cho yêu cầu PUT để tránh lỗi 415
                await handleApproveWorkspace(id); 
                toast.success(`Workspace "${title}" đã được duyệt thành công!`);
                fetchPendingWorkspaces(); // Tải lại danh sách
            } catch (error) {
                toast.error(`Lỗi khi duyệt Workspace "${title}".`);
            }
        }
    };

    // Hàm giả định cho hành động Từ chối (Reject)
    const handleReject = async (id: number, title: string) => {
        if (window.confirm(`Bạn có chắc chắn muốn TỪ CHỐI Workspace "${title}"? Thao tác này sẽ loại bỏ nó khỏi danh sách chờ duyệt.`)) {
            try {
                // Giả định có hàm service xử lý từ chối
                // await handleRejectWorkspace(id); 
                toast.info(`Workspace "${title}" đã bị từ chối/xóa khỏi danh sách chờ duyệt.`);
                fetchPendingWorkspaces(); 
            } catch (error) {
                toast.error(`Lỗi khi từ chối Workspace "${title}".`);
            }
        }
    };

    if (isLoading) {
        return <div className={cx('loading')}><FontAwesomeIcon icon={faSpinner} spin /> Đang tải Workspace...</div>;
    }

    if (workspaces.length === 0) {
        return <div className={cx('no-data')}>🎉 Không có Workspace nào đang chờ kiểm duyệt.</div>;
    }

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
                            <td>
                                {ws.addressLine}, <strong>{ws.city}</strong>
                            </td>
                            <td>
                                <strong>{ws.hostName}</strong>
                                <br />
                                <small style={{ color: '#007bff' }}>{ws.hostEmail}</small>
                            </td>
                            <td className={cx('center-text')}>{ws.totalRooms}</td>
                            <td>
                                {new Date(ws.createdDate).toLocaleDateString('vi-VN')}
                            </td>
                            <td>
                                <button 
                                    className={cx('action-btn', 'approve')} 
                                    onClick={() => handleApprove(ws.id, ws.title)}
                                    title="Duyệt và kích hoạt Workspace"
                                >
                                    <FontAwesomeIcon icon={faCheckSquare} /> Duyệt
                                </button>
                                
                                <button 
                                    className={cx('action-btn', 'view')} 
                                    title="Xem chi tiết và các phòng"
                                    // onClick={() => navigate(`/staff/workspace/${ws.id}`)}
                                >
                                    <FontAwesomeIcon icon={faArrowRight} /> Chi tiết
                                </button>
                                
                                <button 
                                    className={cx('action-btn', 'reject')} 
                                    onClick={() => handleReject(ws.id, ws.title)}
                                    title="Từ chối/Loại bỏ khỏi danh sách chờ duyệt"
                                >
                                    <FontAwesomeIcon icon={faTimesCircle} /> <span>Từ chối</span>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default WorkspacesPendingList;
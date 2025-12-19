import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./OwnerPendingWorkspacesTable.module.scss"; // Bạn hãy tạo file scss tương ứng
import { GetWorkspacesPending } from "~/services/OwnerService"; 
import { WorkspacePending } from "~/types/Owner";
import { toast } from "react-toastify";
import { CLOUD_NAME } from "~/config/cloudinaryConfig";

const cx = classNames.bind(styles);

const OwnerPendingWorkspacesTable: React.FC = () => {
    const [pendingList, setPendingList] = useState<WorkspacePending[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchPendingWorkspaces = async () => {
        try {
            setLoading(true);
            const data = await GetWorkspacesPending();
            setPendingList(data);
        } catch (error) {
            toast.error("Không thể tải danh sách chờ duyệt");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingWorkspaces();
    }, []);

    if (loading) return <div className={cx('loading')}>Đang tải dữ liệu...</div>;

    return (
        <div className={cx('table-container')}>
            {pendingList.length === 0 ? (
                <div className={cx('empty-state')}>Hiện không có workspace nào đang chờ duyệt.</div>
            ) : (
                <table className={cx('pending-table')}>
                    <thead>
                        <tr>
                            <th>Hình ảnh</th>
                            <th>Tên Workspace</th>
                            <th>Loại</th>
                            <th>Địa chỉ</th>
                            <th>Số phòng</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingList.map((item) => (
                            <tr key={item.id}>
                                <td>
                                    <img 
                                        src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${item.thumbnailUrl}`} 
                                        alt={item.title} 
                                        className={cx('thumbnail')} 
                                    />
                                </td>
                                <td>
                                    <div className={cx('workspace-title')}>{item.title}</div>
                                    <div className={cx('workspace-desc')}>{item.description.substring(0, 50)}...</div>
                                </td>
                                <td>{item.workSpaceTypeName}</td>
                                <td>{`${item.addressLine}, ${item.city}`}</td>
                                <td>{item.totalRooms}</td>
                                <td>
                                    <span className={cx('status-badge')}>Đang chờ duyệt</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default OwnerPendingWorkspacesTable;
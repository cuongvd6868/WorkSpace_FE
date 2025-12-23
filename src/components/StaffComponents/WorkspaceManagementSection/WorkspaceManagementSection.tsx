import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from './WorkspaceManagementSection.module.scss'; 
import { getAllWorkspaceStaffView, ToggleWorkspace } from "~/services/StaffService"; 
import { WorkspaceStaffView } from "~/types/Staff";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faSearch, faLock, faLockOpen, faMapMarkerAlt, 
    faSyncAlt, faBuilding, faUser, faShieldAlt 
} from "@fortawesome/free-solid-svg-icons";

const cx = classNames.bind(styles);

const WorkspaceManagementSection: React.FC = () => {
    const [workspaces, setWorkspaces] = useState<WorkspaceStaffView[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await getAllWorkspaceStaffView();
            setWorkspaces(data);
        } catch (error) {
            toast.error("Không thể tải danh sách workspace");
        } finally {
            setTimeout(() => setLoading(false), 500); // Tạo độ trễ mượt mà
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        const confirmMsg = currentStatus 
            ? "Bạn có chắc chắn muốn CHẶN workspace này?" 
            : "Bạn có muốn MỞ KÍCH HOẠT lại workspace này?";
        
        if (window.confirm(confirmMsg)) {
            try {
                await ToggleWorkspace(id);
                toast.success(`${currentStatus ? 'Đã chặn' : 'Đã mở'} thành công`, {
                    theme: "colored"
                });
                fetchData();
            } catch (error) {
                toast.error("Thao tác thất bại");
            }
        }
    };

    const filteredWorkspaces = workspaces.filter(ws => 
        ws.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ws.addressLine.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ws.hostName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={cx('container')}>
            {/* Header Section */}
            <div className={cx('page-header')}>
                <div className={cx('title-area')}>
                    <div className={cx('icon-wrapper')}>
                        <FontAwesomeIcon icon={faShieldAlt} />
                    </div>
                    <div>
                        <h1>Quản lý Workspace</h1>
                        <p>Danh sách và trạng thái hoạt động của tất cả không gian làm việc</p>
                    </div>
                </div>
                
                <div className={cx('action-bar')}>
                    <div className={cx('search-wrapper')}>
                        <FontAwesomeIcon icon={faSearch} className={cx('search-icon')} />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm workspace, địa chỉ, chủ sở hữu..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className={cx('refresh-btn', { spinning: loading })} onClick={fetchData}>
                        <FontAwesomeIcon icon={faSyncAlt} />
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className={cx('table-card')}>
                <div className={cx('table-responsive')}>
                    <table className={cx('modern-table')}>
                        <thead>
                            <tr>
                                <th>WORKSPACE</th>
                                <th>CHỦ SỞ HỮU</th>
                                <th>ĐỊA CHỈ</th>
                                <th>TRẠNG THÁI</th>
                                <th style={{ textAlign: 'center' }}>HÀNH ĐỘNG</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className={cx('skeleton-row')}>
                                        <td colSpan={5}><div className={cx('skeleton-line')}></div></td>
                                    </tr>
                                ))
                            ) : (
                                filteredWorkspaces.map((ws) => (
                                    <tr key={ws.id}>
                                        <td className={cx('ws-cell')}>
                                            <div className={cx('ws-avatar')}>
                                                <FontAwesomeIcon icon={faBuilding} />
                                            </div>
                                            <div className={cx('ws-meta')}>
                                                <span className={cx('ws-name')}>{ws.title}</span>
                                                <span className={cx('ws-type')}>{ws.workSpaceTypeName}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={cx('host-info')}>
                                                <FontAwesomeIcon icon={faUser} />
                                                <span>{ws.hostName}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={cx('address-info')}>
                                                <FontAwesomeIcon icon={faMapMarkerAlt} />
                                                <span>{ws.addressLine}, {ws.city}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={cx('status-badge', ws.isActive ? 'active' : 'blocked')}>
                                                <span className={cx('dot')}></span>
                                                {ws.isActive ? "Hoạt động" : "Đang chặn"}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button 
                                                className={cx('toggle-btn', ws.isActive ? 'btn-danger' : 'btn-success')}
                                                onClick={() => handleToggleStatus(ws.id, ws.isActive)}
                                                title={ws.isActive ? "Chặn truy cập" : "Mở truy cập"}
                                            >
                                                <FontAwesomeIcon icon={ws.isActive ? faLock : faLockOpen} />
                                                <span>{ws.isActive ? "Chặn" : "Mở khóa"}</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {!loading && filteredWorkspaces.length === 0 && (
                    <div className={cx('empty-state')}>
                        <img src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png" alt="No data" />
                        <p>Không tìm thấy Workspace nào phù hợp với tìm kiếm của bạn.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkspaceManagementSection;
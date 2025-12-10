import React, { useState, useEffect, useCallback } from 'react';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan, faCheckCircle, faSpinner, faPlus, faUserTie, faUser, faBuildingUser, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import styles from './AccountManagementSection.module.scss';
import { 
    getStaffsAccount, 
    getOwnersAccount, 
    getCustomerAccount, 
    handleBlockUser 
} from '~/services/AdminService'; 
import { UserAdminView } from '~/types/Admin';

const cx = classNames.bind(styles);

type AccountType = 'customers' | 'owners' | 'staffs';

const AccountManagementSection: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AccountType>('customers');
    const [users, setUsers] = useState<UserAdminView[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isBlocking, setIsBlocking] = useState<number | null>(null);

    // 1. Hàm tải dữ liệu người dùng
    const fetchUsers = useCallback(async (type: AccountType) => {
        setIsLoading(true);
        try {
            let data: UserAdminView[] = [];
            switch (type) {
                case 'customers':
                    data = await getCustomerAccount();
                    break;
                case 'owners':
                    data = await getOwnersAccount();
                    break;
                case 'staffs':
                    data = await getStaffsAccount();
                    break;
            }
            setUsers(data);
        } catch (err) {
            // Hiển thị lỗi rõ ràng hơn
            toast.error(`Lỗi tải dữ liệu tài khoản ${type}. Vui lòng kiểm tra API.`);
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 2. useEffect để tải dữ liệu khi tab thay đổi
    useEffect(() => {
        fetchUsers(activeTab);
    }, [activeTab, fetchUsers]);

    // 3. Hàm xử lý Khóa/Mở khóa tài khoản
    const handleToggleBlock = async (id: number, currentStatus: boolean) => {
        setIsBlocking(id);
        try {
            // API của bạn chỉ có hàm block, ta giả định nó toggle trạng thái
            await handleBlockUser(id); 
            
            // Cập nhật trạng thái isActive ngay lập tức trong state (optimistic update)
            setUsers(prevUsers => 
                prevUsers.map(user => 
                    user.id === id ? { ...user, isActive: !currentStatus } : user
                )
            );
            toast.success(currentStatus ? 'Đã KHÓA tài khoản thành công!' : 'Đã MỞ KHÓA tài khoản thành công!');
        } catch (error) {
            toast.error('Thao tác Khóa/Mở khóa thất bại.');
        } finally {
            setIsBlocking(null);
        }
    };
    
    // 4. Component hiển thị bảng
    const UserTable: React.FC = () => {
        if (isLoading) {
            return <div className={cx('loading')}>
                <FontAwesomeIcon icon={faSpinner} spin /> Đang tải dữ liệu...
            </div>;
        }

        if (users.length === 0) {
            return <div className={cx('no-data')}>Không có tài khoản nào thuộc nhóm này.</div>;
        }

        return (
            <table className={cx('user-table')}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên Đăng Nhập</th>
                        <th>Họ Tên</th>
                        <th>Email</th>
                        <th>Trạng Thái</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.userName}</td>
                            <td>{user.fullName}</td>
                            <td>{user.email}</td>
                            <td className={cx(user.isActive ? 'status-active' : 'status-blocked')}>
                                <FontAwesomeIcon icon={user.isActive ? faCheckCircle : faBan} />
                                {user.isActive ? ' Active' : ' Blocked'}
                            </td>
                            <td>
                                <button
                                    className={cx('action-btn', user.isActive ? 'btn-block' : 'btn-unblock')}
                                    onClick={() => handleToggleBlock(user.id, user.isActive)}
                                    disabled={isBlocking === user.id}
                                >
                                    {isBlocking === user.id ? (
                                        <FontAwesomeIcon icon={faSpinner} spin />
                                    ) : (
                                        <FontAwesomeIcon icon={user.isActive ? faBan : faCheckCircle} />
                                    )}
                                    {user.isActive ? ' Khóa' : ' Mở Khóa'}
                                </button>
                                <button className={cx('action-btn', 'btn-delete')} disabled>
                                    <FontAwesomeIcon icon={faTrashCan} /> Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div className={cx('account-management')}>
            
            {/* Thanh Tabs */}
            <div className={cx('tabs')}>
                <button 
                    className={cx('tab-btn', { active: activeTab === 'customers' })}
                    onClick={() => setActiveTab('customers')}
                >
                    <FontAwesomeIcon icon={faUser} /> Khách Hàng
                </button>
                <button 
                    className={cx('tab-btn', { active: activeTab === 'owners' })}
                    onClick={() => setActiveTab('owners')}
                >
                    <FontAwesomeIcon icon={faBuildingUser} /> Chủ Workspace
                </button>
                <button 
                    className={cx('tab-btn', { active: activeTab === 'staffs' })}
                    onClick={() => setActiveTab('staffs')}
                >
                    <FontAwesomeIcon icon={faUserTie} /> Nhân Viên
                </button>
            </div>

            {/* Bảng dữ liệu */}
            <UserTable />
            
            <button className={cx('add-user-btn')}>
                <FontAwesomeIcon icon={faPlus} /> Thêm Tài Khoản Mới
            </button>
        </div>
    );
};

export default AccountManagementSection;
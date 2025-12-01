import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faWallet, faBuilding, faCalendarCheck, faUserCog, IconDefinition, faDollarSign, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import styles from './OwnerDashboard.module.scss'; 
import KPICard from '~/components/KPICard/KPICard'; 
import { useAuth } from "~/context/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { OwnerStats } from "~/types/Owner";
import { getOwnerStats } from "~/services/OwnerService";
import WeeklyRevenueChart from "~/components/OwnerComponents/Charts/WeeklyRevenueChart";
import FinanceSection from "~/components/OwnerComponents/FinanceSection/FinanceSection";
import OwnerBookingsSection from "~/components/OwnerComponents/OwnerBookingsSection/OwnerBookingsSection";
import { CreateWorkspaceForm } from "~/components/OwnerComponents/CreateWorkspaceForm/CreateWorkspaceForm";
import OwnerWorkspacesTable from "~/components/OwnerComponents/OwnerWorkspacesTable/OwnerWorkspacesTable";
const cx = classNames.bind(styles);

enum OwnerPage {
    Overview = 'overview',
    Finance = 'finance',
    Listings = 'listings', 
    Bookings = 'bookings',
    Settings = 'settings',
}




const ListingsManagementSection: React.FC = () => {
    const [isCreating, setIsCreating] = useState(false);
    const [reloadKey, setReloadKey] = useState(0); 

    const handleCreationSuccess = () => {
        setIsCreating(false);
        toast.success("Workspace mới đã được tạo thành công! Vui lòng chờ hệ thống duyệt.");
        setReloadKey(prev => prev + 1); 
    };

    const handleAddRoom = (id: number) => {
        // Logic chuyển hướng/mở modal thêm phòng
        toast.info(`Chuyển đến trang thêm phòng cho Workspace ID: ${id}`);
    };

    const handleViewDetails = (id: number) => {
        toast.info(`Chuyển đến trang chi tiết cho Workspace ID: ${id}`);
    };


    if (isCreating) {
        return (
            <div className={cx('create-form-wrapper')}>
                <h3>➕ Thêm Workspace Mới</h3>
                <CreateWorkspaceForm 
                    onSuccess={handleCreationSuccess}
                    onCancel={() => setIsCreating(false)}
                />
            </div>
        );
    }

    return (
        <div className={cx('listings-management')}>
            <div className={cx('header-with-action')}>
                <button 
                    className={cx('add-btn')} 
                    onClick={() => setIsCreating(true)} 
                >
                    + Thêm Workspace Mới
                </button>
            </div>

            <OwnerWorkspacesTable 
                key={reloadKey} 
                onAddRoom={handleAddRoom}
                onViewDetails={handleViewDetails}
            />
        </div>
    );
};

const BookingsManagementSection: React.FC = () => (
    <div className={cx('bookings-management')}>
        <h3>📅 Quản Lý Lượt Đặt Chỗ</h3>
        <p className={cx('placeholder')}>
            [Bảng: Mã Booking, Khách hàng, Workspace, Thời gian, Tổng tiền, Trạng thái (Pending/Confirmed/Canceled)]
        </p>
        <button className={cx('filter-btn')}>Lọc Booking Theo Ngày</button>
    </div>
);

const OwnerDashboard: React.FC = () => {
    const [stats, setStats] = useState<OwnerStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
        try {
            setIsLoading(true);
            const data = await getOwnerStats(); // Dữ liệu trả về đã là kiểu OwnerStats
            setStats(data);
        } catch (err) {
            setError(err + '');
        } finally {
            setIsLoading(false);
        }
        };

    fetchStats();
    }, []);

    const kpiData: { title: string; value: string; change: string; icon: IconDefinition; color: 'green' | 'blue' | 'purple' | 'red' }[] = [
    { title: "Doanh Thu Của Tôi (T.Này)", value: `${stats?.monthlyRevenue} VND`, change: "+15.2%", icon: faDollarSign, color: "green" },
    { title: "Lượt Booking Mới", value: `${stats?.totalBookings} Đơn`, change: "+5%", icon: faCalendarCheck, color: "blue" },
    { title: "Tỷ Lệ Lấp Đầy", value: `${stats?.occupancyRate}%`, change: "+2.1%", icon: faChartBar, color: "purple" },
    { title: "Workspace Hết Hạn Duyệt", value: `${stats?.pendingWorkspaces} mục`, change: "Khẩn cấp!", icon: faBuilding, color: "red" },
    ];
    const [activePage, setActivePage] = useState<OwnerPage>(OwnerPage.Overview);
    const {user, logout, isLoggedIn} = useAuth();

    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/'); 
        toast.dark('Bạn vừa đăng xuất khỏi hệ thống!')
    };

    const renderContent = () => {
        switch (activePage) {
            case OwnerPage.Overview:
                return (
                    <div className={cx('content-section')}>
                        <h2 className={cx('section-title')}>📊 TỔNG QUAN HIỆU SUẤT</h2>
                        
                        <div className={cx('kpi-grid')}>
                            {kpiData.map((kpi, index) => (
                                <KPICard key={index} {...kpi} />
                            ))}
                        </div>

                        <div className={cx('chart-box')}>
                            <h3 className={cx('chart-title')}>Biểu đồ Xu hướng Doanh thu theo Tuần</h3>
                            {stats?.weeklyRevenueTrend ? (
                                <WeeklyRevenueChart data={stats.weeklyRevenueTrend} />
                            ) : (
                                <div className={cx('placeholder', 'chart-placeholder')}>
                                    {isLoading ? 'Đang tải biểu đồ...' : 'Không có dữ liệu xu hướng doanh thu.'}
                                </div>
                            )}
                        </div>

                        <div className={cx('recent-activity')}>
                             <h3>📝 BOOKING SẮP TỚI</h3>
                             <p className={cx('placeholder')}>[Danh sách 5 booking sắp diễn ra cần xác nhận]</p>
                             ced
                        </div>
                    </div>
                );
            case OwnerPage.Finance:
                return (
<div className={cx('content-section')}>
            <h2 className={cx('section-title')}>💰 TÀI CHÍNH & THANH TOÁN</h2>
            <FinanceSection stats={stats} isLoading={isLoading} />
        </div>
                );
            case OwnerPage.Listings:
                return (
                    <div className={cx('content-section')}>
                        <h2 className={cx('section-title')}>🏢 QUẢN LÝ DANH SÁCH WORKSPACE</h2>
                        <ListingsManagementSection />
                    </div>
                );
            case OwnerPage.Bookings:
                return (
                <div className={cx('content-section')}>
                    <h2 className={cx('section-title')}>📅 QUẢN LÝ LƯỢT BOOKING</h2>
                    {/* Thay thế placeholder bằng component mới */}
                    <OwnerBookingsSection />
                </div>
                );
            case OwnerPage.Settings:
                return (
                    <div className={cx('content-section')}>
                        <h2 className={cx('section-title')}>⚙️ THIẾT LẬP CÁ NHÂN</h2>
                        <p className={cx('placeholder-long')}>
                            [Thông tin cá nhân, Đổi mật khẩu, Thiết lập thông báo]
                        </p>
                    </div>
                );
            default:
                return <div>Chào mừng, Owner!</div>;
        }
    }

    return (
        <div className={cx('wrapper')}>
            {/* Sidebar (Menu Điều Hướng) */}
            <nav className={cx('sidebar')}>
                <div className={cx('logo')}>CBS OWNER</div>
                <ul className={cx('nav-list')}>
                    <li className={cx('nav-item', { active: activePage === OwnerPage.Overview })} onClick={() => setActivePage(OwnerPage.Overview)}>
                        <FontAwesomeIcon icon={faChartBar} /> <span>Tổng Quan</span>
                    </li>
                    <li className={cx('nav-item', { active: activePage === OwnerPage.Finance })} onClick={() => setActivePage(OwnerPage.Finance)}>
                        <FontAwesomeIcon icon={faWallet} /> <span>Tài Chính</span>
                    </li>
                    <li className={cx('nav-item', { active: activePage === OwnerPage.Listings })} onClick={() => setActivePage(OwnerPage.Listings)}>
                        <FontAwesomeIcon icon={faBuilding} /> <span>Quản Lý Listing</span>
                    </li>
                    <li className={cx('nav-item', { active: activePage === OwnerPage.Bookings })} onClick={() => setActivePage(OwnerPage.Bookings)}>
                        <FontAwesomeIcon icon={faCalendarCheck} /> <span>Quản Lý Booking</span>
                    </li>
                    <li className={cx('nav-item', { active: activePage === OwnerPage.Settings })} onClick={() => setActivePage(OwnerPage.Settings)}>
                        <FontAwesomeIcon icon={faUserCog} /> <span>Thiết Lập</span>
                    </li>
                </ul>
            </nav>

            {/* Main Content */}
            <div className={cx('main-content')}>
                <header className={cx('header')}>
                    <h1 className={cx('page-header')}>{activePage.toUpperCase()}</h1>
                        {isLoggedIn() ? (
                            <div className={cx('user-profile')}>
                                <span>Xin chào, {user?.userName}</span>
                                <FontAwesomeIcon icon={faRightFromBracket} className={cx('logo-icon')} onClick={handleLogout}/>
                            </div>
                        ) : (
                            <span>Bạn chưa đăng nhập</span>
                        )}
                        {/* 
*/}
                </header>
                
                <main className={cx('content-area')}>
                    {renderContent()}
                </main>
            </div>
        </div>
    )
}

export default OwnerDashboard;
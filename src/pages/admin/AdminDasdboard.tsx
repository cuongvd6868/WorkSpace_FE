import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faDollarSign, faUsers, faBuilding, faCog, IconDefinition, faRightFromBracket, faCheckSquare } from '@fortawesome/free-solid-svg-icons';
import styles from './AdminDasdboard.module.scss';
import KPICard from '~/components/KPICard/KPICard'; 
import { useAuth } from "~/context/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AdminStats } from "~/types/Admin";
import { getAdminDashboard } from "~/services/AdminService";
import LineChartRevenue from "~/components/AdminComponents/LineChartRevenue/LineChartRevenue";
import RevenueManagementSection from "~/components/AdminComponents/RevenueManagementSection/RevenueManagementSection";
import AccountManagementSection from "~/components/AdminComponents/AccountManagementSection/AccountManagementSection";
import OwnerRegistrationCensorSection from "~/components/AdminComponents/OwnerRegistrationCensorSection/OwnerRegistrationCensorSection";

const cx = classNames.bind(styles);

enum AdminPage {
    Overview = 'overview',
    Revenue = 'revenue',
    Censor = 'censor',
    Accounts = 'accounts',
    Settings = 'settings',
}



// Hàm giả lập nội dung cho Quản lý Tài khoản (Giữ nguyên)


const AdminDasdboard: React.FC = () => {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);   

    useEffect(() => {
            const fetchStats = async () => {
            try {
                setIsLoading(true);
                const data = await getAdminDashboard(); 
                setStats(data);
            } catch (err) {
                setError(err + '');
            } finally {
                setIsLoading(false);
            }
            };
    
        fetchStats();
    }, []);
    const {user, logout, isLoggedIn} = useAuth();
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        navigate('/'); 
        toast.dark('Bạn vừa đăng xuất khỏi hệ thống!')
    };
    const [activePage, setActivePage] = useState<AdminPage>(AdminPage.Overview);
    const kpiData: { title: string; value: string; change: string; icon: IconDefinition; color: 'green' | 'blue' | 'purple' | 'red' }[] = [
    { title: "Tổng Doanh Thu (T.Này)", value: `${stats?.totalRevenue} VND`, change: "+12.5%", icon: faDollarSign, color: "green" },
    { title: "Booking Mới (T.Này)", value: `${stats?.newBookingsThisMonth} Đơn`, change: "+8%", icon: faBuilding, color: "blue" },
    { title: "Tài Khoản Mới", value: `${stats?.newUsersThisMonth} Users`, change: "+3.2%", icon: faUsers, color: "purple" },
    { title: "Tất cả tài khoản", value: `${stats?.totalUsers} Users`, change: "-----", icon: faTachometerAlt, color: "red" },
    ];

    const renderContent = () => {
        switch (activePage) {
            case AdminPage.Overview:
                return (
                    <div className={cx('content-section')}>
                        <h2 className={cx('section-title')}>📊 DASHBOARD TỔNG QUAN</h2>
                        
                        {/* 1. KPI Cards */}
                        <div className={cx('kpi-grid')}>
                            {kpiData.map((kpi, index) => (
                                <KPICard key={index} {...kpi} />
                            ))}
                        </div>

                        {/* 2. Biểu Đồ Doanh Thu */}
                        <div className={cx('chart-box')}>
                            <h3 className={cx('chart-title')}>DOANH THU THEO THÁNG</h3>
                            {/* <LineChartRevenue /> */}
                            <div className={cx('placeholder', 'chart-placeholder')}>
                                {isLoading ? (
                                <p className={cx('placeholder', 'chart-placeholder')}>Đang tải biểu đồ...</p>
                            ) : error ? (
                                <p className={cx('placeholder', 'chart-placeholder')} style={{ color: 'red' }}>Lỗi tải dữ liệu: {error}</p>
                            ) : (
                                <LineChartRevenue data={stats?.revenueChart || []} />
                            )}
                            </div>
                        </div>

                        {/* 3. Hoạt động Gần đây */}
                        <div className={cx('recent-activity')}>
                             <h3>📝 HOẠT ĐỘNG GẦN ĐÂY</h3>
                             <p className={cx('placeholder')}>[Danh sách 5 booking, giao dịch gần nhất]</p>
                        </div>
                    </div>
                );
            case AdminPage.Accounts:
                return (
                    <div className={cx('content-section')}>
                        <h2 className={cx('section-title')}>👥 QUẢN LÝ TÀI KHOẢN</h2>
                        <AccountManagementSection />
                    </div>
                );
            case AdminPage.Revenue:
                return <div className={cx('content-section')}>
                        {/* SỬ DỤNG COMPONENT MỚI */}
                        <RevenueManagementSection 
                            stats={stats} 
                            isLoading={isLoading} 
                            error={error} 
                        />
                    </div>;
            case AdminPage.Censor:
                return (
                    <div className={cx('content-section')}>
                        <h2 className={cx('section-title')}>🏢 KIỂM DUYỆT ĐĂNG KÝ OWNER</h2>
                        <OwnerRegistrationCensorSection />
                    </div>
                );
            case AdminPage.Settings:
                return <h2 className={cx('section-title')}>⚙️ CÀI ĐẶT HỆ THỐNG</h2>;
            default:
                return <div>Chào mừng đến với Admin Dashboard.</div>;
        }
    }

    return (
        <div className={cx('wrapper')}>
            {/* Sidebar (Menu Điều Hướng) */}
            <nav className={cx('sidebar')}>
                <div className={cx('logo')}>CBS ADMIN</div>
                <ul className={cx('nav-list')}>
                    <li className={cx('nav-item', { active: activePage === AdminPage.Overview })} onClick={() => setActivePage(AdminPage.Overview)}>
                        <FontAwesomeIcon icon={faTachometerAlt} /> <span>Dashboard</span>
                    </li>
                    <li className={cx('nav-item', { active: activePage === AdminPage.Revenue })} onClick={() => setActivePage(AdminPage.Revenue)}>
                        <FontAwesomeIcon icon={faDollarSign} /> <span>Doanh Thu</span>
                    </li>
                    <li className={cx('nav-item', { active: activePage === AdminPage.Censor })} onClick={() => setActivePage(AdminPage.Censor)}>
                        <FontAwesomeIcon icon={faCheckSquare} /> <span>Kiểm duyệt</span>
                    </li>
                    <li className={cx('nav-item', { active: activePage === AdminPage.Accounts })} onClick={() => setActivePage(AdminPage.Accounts)}>
                        <FontAwesomeIcon icon={faUsers} /> <span>Tài Khoản</span>
                    </li>
                    <li className={cx('nav-item', { active: activePage === AdminPage.Settings })} onClick={() => setActivePage(AdminPage.Settings)}>
                        <FontAwesomeIcon icon={faCog} /> <span>Cài Đặt</span>
                    </li>
                </ul>
            </nav>

            {/* Main Content */}
            <div className={cx('main-content')}>
                <header className={cx('header')}>
                    <h1 className={cx('page-header')}>{activePage.toUpperCase()}</h1>
                    {isLoggedIn() ? (
                        <div className={cx('user-profile')}>
                            <span>Xin chào, ADMIN</span>
                            <FontAwesomeIcon icon={faRightFromBracket} className={cx('logo-icon')} onClick={handleLogout}/>
                        </div>
                        ) : (
                            <span>Bạn chưa đăng nhập</span>
                    )}
                </header>
                
                <main className={cx('content-area')}>
                    {renderContent()}
                </main>
            </div>
        </div>
    )
}

export default AdminDasdboard;
import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// Thêm faSignOutAlt nếu bạn muốn biểu tượng khác, nhưng dùng faRightFromBracket cho nhất quán
import { faTachometerAlt, faDollarSign, faUsers, faBuilding, faCog, IconDefinition, faRightFromBracket, faCheckSquare, faBell, faTags, faCalendarCheck } from '@fortawesome/free-solid-svg-icons'; 
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
import NotificationManagementSection from "~/components/AdminComponents/NotificationManagementSection/NotificationManagementSection";
import PromotionManagementSection from "~/components/AdminComponents/PromotionManagementSection/PromotionManagementSection";
import BookingManagementSection from "~/components/AdminComponents/BookingManagementSection/BookingManagementSection";
import TopBookedSection from "~/components/AdminComponents/TopBookedSection/TopBookedSection";

const cx = classNames.bind(styles);

enum AdminPage {
    Overview = 'overview',
    Revenue = 'revenue',
    Censor = 'censor',
    Notifications = 'notifications',
    Promotions = 'promotions',
    Bookings = 'Bookings',
    Accounts = 'accounts',
    TopBooking = 'TopBookings',
}

const AdminDasdboard: React.FC = () => {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null); 
    const {user, logout, isLoggedIn} = useAuth();
    const navigate = useNavigate();

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

    const handleLogout = () => {
        logout();
        navigate('/'); 
        toast.dark('Bạn vừa đăng xuất khỏi hệ thống!')
    };
    
    const [activePage, setActivePage] = useState<AdminPage>(AdminPage.Overview);
    
    // Đảm bảo dữ liệu KPI luôn có fallback để không bị crash khi stats là null
    const kpiData: { title: string; value: string; change: string; icon: IconDefinition; color: 'green' | 'blue' | 'purple' | 'red' }[] = [
    { title: "Tổng Doanh Thu (T.Này)", value: `${stats?.totalRevenue || 0} VND`, change: "+12.5%", icon: faDollarSign, color: "green" },
    { title: "Booking Mới (T.Này)", value: `${stats?.newBookingsThisMonth || 0} Đơn`, change: "+8%", icon: faBuilding, color: "blue" },
    { title: "Tài Khoản Mới", value: `${stats?.newUsersThisMonth || 0} Users`, change: "+3.2%", icon: faUsers, color: "purple" },
    { title: "Tất cả tài khoản", value: `${stats?.totalUsers || 0} Users`, change: "-----", icon: faTachometerAlt, color: "red" },
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
            case AdminPage.TopBooking:
                return (
        <div className={cx('content-section')}>
            <h2 className={cx('section-title')}>🏆 TOP 5 WORKSPACE ĐƯỢC ĐẶT NHIỀU NHẤT</h2>
            <TopBookedSection />
        </div>
    );
            case AdminPage.Notifications:
                return (
                    <div className={cx('content-section')}>
                        <h2 className={cx('section-title')}>🏢 QUẢN LÝ THÔNG BÁO</h2>
                        <NotificationManagementSection />
                    </div>
                );
            case AdminPage.Promotions:
                return(
                    <div className={cx('content-section')}>
                        <h2 className={cx('section-title')}>🏷️ QUẢN LÝ PROMOTIONS</h2>
                        <PromotionManagementSection />
                    </div>)
            case AdminPage.Bookings:
                return(
                    <div className={cx('content-section')}>
                        <h2 className={cx('section-title')}>🗓️ XEM BOOKING</h2>
                        <BookingManagementSection />
                    </div>)
            default:
                return <div>Chào mừng đến với Admin Dashboard.</div>;
        }
    }

    return (
        <div className={cx('wrapper')}>
            {/* Sidebar (Menu Điều Hướng) */}
            <nav className={cx('sidebar')}>
                <div className={cx('logo')}>CBS ADMIN</div>
                
                {/* Khu vực danh sách menu (Cần dùng Flexbox để đẩy logout xuống dưới) */}
                <div className={cx('nav-menu-container')}>
                    <ul className={cx('nav-list')}>
                        <li className={cx('nav-item', { active: activePage === AdminPage.Overview })} onClick={() => setActivePage(AdminPage.Overview)}>
                            <FontAwesomeIcon icon={faTachometerAlt} /> <span>Dashboard</span>
                        </li>
                        {/* <li className={cx('nav-item', { active: activePage === AdminPage.Revenue })} onClick={() => setActivePage(AdminPage.Revenue)}>
                            <FontAwesomeIcon icon={faDollarSign} /> <span>Doanh Thu</span>
                        </li> */}
                        <li className={cx('nav-item', { active: activePage === AdminPage.Censor })} onClick={() => setActivePage(AdminPage.Censor)}>
                            <FontAwesomeIcon icon={faCheckSquare} /> <span>Kiểm duyệt</span>
                        </li>
                        <li className={cx('nav-item', { active: activePage === AdminPage.Notifications })} onClick={() => setActivePage(AdminPage.Notifications)}>
                            <FontAwesomeIcon icon={faBell} /> <span>Quản lý thông báo</span>
                        </li>
                        <li className={cx('nav-item', { active: activePage === AdminPage.Promotions })} onClick={() => setActivePage(AdminPage.Promotions)}>
                            <FontAwesomeIcon icon={faTags} /> <span>Quản lý Promotions</span>
                        </li>
                        <li className={cx('nav-item', { active: activePage === AdminPage.Bookings })} onClick={() => setActivePage(AdminPage.Bookings)}>
                            <FontAwesomeIcon icon={faCalendarCheck} /> <span>Xem Booking</span>
                        </li>
                        <li className={cx('nav-item', { active: activePage === AdminPage.Accounts })} onClick={() => setActivePage(AdminPage.Accounts)}>
                            <FontAwesomeIcon icon={faUsers} /> <span>Tài Khoản</span>
                        </li>
                        <li className={cx('nav-item', { active: activePage === AdminPage.TopBooking })} onClick={() => setActivePage(AdminPage.TopBooking)}>
                            <FontAwesomeIcon icon={faCog} /> <span>TOP</span>
                        </li>
                    </ul>
                </div>

                {/* Nút Đăng Xuất được đẩy xuống cuối Sidebar */}
                {isLoggedIn() && (
                    <div className={cx('sidebar-footer')}>
                        <div className={cx('nav-item', 'logout-item')} onClick={handleLogout}>
                            <FontAwesomeIcon icon={faRightFromBracket}  className={cx('icon')}/> <span>Đăng Xuất</span>
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <div className={cx('main-content')}>
                <header className={cx('header')}>
                    <h1 className={cx('page-header')}>{activePage.toUpperCase()}</h1>
                    {/* Giữ lại thông báo "Xin chào, ADMIN" ở Header */}
                    {isLoggedIn() && (
                        <div className={cx('user-greeting')}>
                            <span>Xin chào, ADMIN</span>
                        </div>
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
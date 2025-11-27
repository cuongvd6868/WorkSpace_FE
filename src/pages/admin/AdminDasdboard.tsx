import React, { useState } from "react";
import classNames from "classnames/bind";
// Font Awesome Imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faDollarSign, faUsers, faBuilding, faCog, IconDefinition } from '@fortawesome/free-solid-svg-icons';

import styles from './AdminDasdboard.module.scss';
// Thay đổi đường dẫn import KPICard cho phù hợp với cấu trúc dự án của bạn
import KPICard from '~/components/KPICard/KPICard'; 

const cx = classNames.bind(styles);

enum AdminPage {
    Overview = 'overview',
    Revenue = 'revenue',
    Workspaces = 'workspaces',
    Accounts = 'accounts',
    Settings = 'settings',
}

// Dữ liệu mẫu cho KPICards (Giữ nguyên)
const kpiData: { title: string; value: string; change: string; icon: IconDefinition; color: 'green' | 'blue' | 'purple' | 'red' }[] = [
    { title: "Tổng Doanh Thu (T.Này)", value: "185.000.000 VND", change: "+12.5%", icon: faDollarSign, color: "green" },
    { title: "Booking Mới (T.Này)", value: "450 Đơn", change: "+8%", icon: faBuilding, color: "blue" },
    { title: "Tài Khoản Mới", value: "95 Users", change: "+3.2%", icon: faUsers, color: "purple" },
    { title: "Lấp Đầy Trung Bình", value: "78%", change: "-1.1%", icon: faTachometerAlt, color: "red" },
];

// Hàm giả lập nội dung cho Quản lý Tài khoản (Giữ nguyên)
const AccountManagementSection: React.FC = () => (
    <div className={cx('account-management')}>
        <h3>👥 Danh Sách Người Dùng</h3>
        {/* Ở đây sẽ là component <AccountTable /> */}
        <p className={cx('placeholder')}>
            [Bảng dữ liệu: Tên, Email, SĐT, Ngày Đăng Ký, Trạng Thái (Active/Blocked), Action (Edit/Delete)]
        </p>
        <button className={cx('add-user-btn')}>+ Thêm Tài Khoản Mới</button>
    </div>
);

const AdminDasdboard: React.FC = () => {
    const [activePage, setActivePage] = useState<AdminPage>(AdminPage.Overview);

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
                                [Biểu đồ đường thể hiện Doanh thu 12 tháng gần nhất]
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
                return <h2 className={cx('section-title')}>💰 QUẢN LÝ DOANH THU</h2>;
            case AdminPage.Workspaces:
                return <h2 className={cx('section-title')}>🏢 QUẢN LÝ WORKSPACE</h2>;
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
                <div className={cx('logo')}>BOOKSPACE ADMIN</div>
                <ul className={cx('nav-list')}>
                    <li className={cx('nav-item', { active: activePage === AdminPage.Overview })} onClick={() => setActivePage(AdminPage.Overview)}>
                        <FontAwesomeIcon icon={faTachometerAlt} /> <span>Dashboard</span>
                    </li>
                    <li className={cx('nav-item', { active: activePage === AdminPage.Revenue })} onClick={() => setActivePage(AdminPage.Revenue)}>
                        <FontAwesomeIcon icon={faDollarSign} /> <span>Doanh Thu</span>
                    </li>
                    <li className={cx('nav-item', { active: activePage === AdminPage.Workspaces })} onClick={() => setActivePage(AdminPage.Workspaces)}>
                        <FontAwesomeIcon icon={faBuilding} /> <span>Workspaces</span>
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
                    <div className={cx('user-profile')}>
                        <span>Xin chào, Admin!</span>
                        {/* 

[Image of User Avatar]
 */}
                    </div>
                </header>
                
                <main className={cx('content-area')}>
                    {renderContent()}
                </main>
            </div>
        </div>
    )
}

export default AdminDasdboard;
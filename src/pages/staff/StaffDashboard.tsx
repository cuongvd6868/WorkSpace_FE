import React, { useState } from "react";
import classNames from "classnames/bind";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faComments, faCheckSquare, faEye, faUserCog, 
    faEnvelopeOpenText, faGlobe, faBuilding, faStar, 
    IconDefinition 
} from '@fortawesome/free-solid-svg-icons';
import styles from './StaffDashboard.module.scss';
import TaskCard from '~/components/TaskCard/TaskCard'; 

const cx = classNames.bind(styles);

// Các mục điều hướng mới cho Staff
enum StaffPage {
    Support = 'support',
    ContentReview = 'contentReview',
    Monitoring = 'monitoring',
    Settings = 'settings',
}

// Dữ liệu mẫu cho các nhiệm vụ chính của Staff
const taskData: { title: string; count: number; description: string; icon: IconDefinition; color: 'orange' | 'purple' | 'green' | 'blue' }[] = [
    { title: "Yêu Cầu Hỗ Trợ Mới", count: 15, description: "Xử lý các khiếu nại, yêu cầu đơn giản.", icon: faEnvelopeOpenText, color: "orange" },
    { title: "Review Chờ Duyệt", count: 42, description: "Kiểm tra đánh giá trước khi hiển thị công khai.", icon: faStar, color: "purple" },
    { title: "Workspace Chờ Duyệt", count: 3, description: "Duyệt thông tin và hình ảnh workspace mới.", icon: faBuilding, color: "green" },
    { title: "Booking Trong Ngày", count: 68, description: "Giám sát các đơn hàng đang diễn ra.", icon: faEye, color: "blue" },
];

// Nội dung cho mục Hỗ trợ Khách hàng
const SupportSection: React.FC = () => (
    <div className={cx('support-section')}>
        <h3>💬 Hộp Thư Hỗ Trợ Trực Tuyến</h3>
        <p className={cx('placeholder-long')}>
            [Giao diện Chat: Danh sách Ticket/User đang chờ, ô trả lời nhanh, bộ lọc theo trạng thái (Open/Resolved)]
        </p>
        <button className={cx('view-all-btn')}>Xem Tất Cả Ticket (15 Mới)</button>
    </div>
);

// Nội dung cho mục Kiểm duyệt Nội dung
const ReviewSection: React.FC = () => (
    <div className={cx('review-section')}>
        <h3>📝 Nhiệm Vụ Kiểm Duyệt</h3>
        <div className={cx('review-tabs')}>
            <button className={cx('tab-btn', 'active')}>Reviews (42)</button>
            <button className={cx('tab-btn')}>Listings (3)</button>
        </div>
        <p className={cx('placeholder')}>
            [Bảng: Nội dung cần duyệt, Người đăng, Ngày đăng, Action (Approve/Reject/Edit)]
        </p>
    </div>
);


const StaffDashboard: React.FC = () => {
    const [activePage, setActivePage] = useState<StaffPage>(StaffPage.Support);

    const renderContent = () => {
        switch (activePage) {
            case StaffPage.Support:
                return (
                    <div className={cx('content-section')}>
                        <h2 className={cx('section-title')}>💬 TRUNG TÂM HỖ TRỢ</h2>
                        <SupportSection />
                        
                        <div className={cx('monitoring-grid')}>
                            <div className={cx('sub-box')}>
                                <h3>Hủy Đơn Gần Đây</h3>
                                <p className={cx('placeholder-small')}>[Bảng: Mã đơn, Lý do hủy]</p>
                            </div>
                            <div className={cx('sub-box')}>
                                <h3>Vấn Đề Thanh Toán</h3>
                                <p className={cx('placeholder-small')}>[Danh sách giao dịch lỗi]</p>
                            </div>
                        </div>
                    </div>
                );
            case StaffPage.ContentReview:
                return (
                    <div className={cx('content-section')}>
                        <h2 className={cx('section-title')}>📝 KIỂM DUYỆT NỘI DUNG</h2>
                        <ReviewSection />
                    </div>
                );
            case StaffPage.Monitoring:
                return (
                    <div className={cx('content-section')}>
                        <h2 className={cx('section-title')}>👁️ GIÁM SÁT HOẠT ĐỘNG</h2>
                        <div className={cx('monitoring-main-box')}>
                            <h3>Booking Đang Diễn Ra (Hôm Nay)</h3>
                            <p className={cx('placeholder-long')}>
                                [Bảng: Workspace, Giờ bắt đầu/kết thúc, Khách hàng, Trạng thái (On-going)]
                            </p>
                        </div>
                    </div>
                );
            case StaffPage.Settings:
                return (
                    <div className={cx('content-section')}>
                        <h2 className={cx('section-title')}>⚙️ THIẾT LẬP CÁ NHÂN</h2>
                        <p className={cx('placeholder-long')}>
                            [Thông tin cá nhân, Đổi mật khẩu, Thiết lập quyền hạn (Chỉ Admin mới có thể thay đổi)]
                        </p>
                    </div>
                );
            default:
                return <div>Chào mừng, Staff!</div>;
        }
    }

    return (
        <div className={cx('wrapper')}>
            {/* Sidebar (Menu Điều Hướng) */}
            <nav className={cx('sidebar')}>
                <div className={cx('logo')}>STAFF PORTAL</div>
                <ul className={cx('nav-list')}>
                    <li className={cx('nav-item', { active: activePage === StaffPage.Support })} onClick={() => setActivePage(StaffPage.Support)}>
                        <FontAwesomeIcon icon={faComments} /> <span>Hỗ Trợ</span>
                    </li>
                    <li className={cx('nav-item', { active: activePage === StaffPage.ContentReview })} onClick={() => setActivePage(StaffPage.ContentReview)}>
                        <FontAwesomeIcon icon={faCheckSquare} /> <span>Kiểm Duyệt</span>
                    </li>
                    <li className={cx('nav-item', { active: activePage === StaffPage.Monitoring })} onClick={() => setActivePage(StaffPage.Monitoring)}>
                        <FontAwesomeIcon icon={faEye} /> <span>Giám Sát</span>
                    </li>
                    <li className={cx('nav-item', { active: activePage === StaffPage.Settings })} onClick={() => setActivePage(StaffPage.Settings)}>
                        <FontAwesomeIcon icon={faUserCog} /> <span>Thiết Lập</span>
                    </li>
                </ul>
                <div className={cx('task-summary')}>
                    <h4>✅ Tóm Tắt Nhiệm Vụ</h4>
                    <p>Total Pending: **60**</p>
                </div>
            </nav>

            {/* Main Content */}
            <div className={cx('main-content')}>
                <header className={cx('header')}>
                    <h1 className={cx('page-header')}>{activePage.toUpperCase()}</h1>
                    <div className={cx('user-profile')}>
                        <span>Xin chào, [Tên Staff]!</span>
                        {/* 

[Image of User Avatar]
 */}
                    </div>
                </header>
                
                <main className={cx('content-area')}>
                    {/* Bảng KPI/Thẻ nhiệm vụ nhanh cho Tổng quan */}
                    {activePage === StaffPage.Support && (
                        <div className={cx('task-grid')}>
                            {taskData.map((task, index) => (
                                <TaskCard key={index} {...task} /> // Sử dụng TaskCard mới
                            ))}
                        </div>
                    )}
                    {renderContent()}
                </main>
            </div>
        </div>
    )
}

export default StaffDashboard;
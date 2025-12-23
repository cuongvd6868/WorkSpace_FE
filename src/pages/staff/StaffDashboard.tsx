import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faComments, faCheckSquare, faEye, faUserCog, 
    faEnvelopeOpenText, faGlobe, faBuilding, faStar, 
    IconDefinition, 
    faRightFromBracket,
    faNewspaper
} from '@fortawesome/free-solid-svg-icons';
import styles from './StaffDashboard.module.scss';
import TaskCard from '~/components/TaskCard/TaskCard'; 
import { useAuth } from "~/context/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CancelledBooking, StaffDashboardStats } from "~/types/Staff";
import { getStaffDashboard } from "~/services/StaffService";
import CancelledBookingList from "~/components/StaffComponents/CancelledBookingList/CancelledBookingList";
import SupportTicketList from "~/components/StaffComponents/SupportTicketList/SupportTicketList";
import BookingTodayListTable from "~/components/StaffComponents/BookingTodayListTable/BookingTodayListTable";
import ReviewsPendingList from "~/components/StaffComponents/ReviewsPendingList/ReviewsPendingList";
import WorkspacesPendingList from "~/components/StaffComponents/WorkspacesPendingList/WorkspacesPendingList";
import PostManagementSection from "~/components/StaffComponents/PostManagementSection/PostManagementSection";
import WorkspaceManagementSection from "~/components/StaffComponents/WorkspaceManagementSection/WorkspaceManagementSection";

const cx = classNames.bind(styles);

enum StaffPage {
    Support = 'support',
    ContentReview = 'contentReview',
    Monitoring = 'monitoring',
    Posts = 'posts',
    WorkspaceManagement = 'WorkspaceManagement',
}

enum ReviewType {
    Reviews = 'reviews',
    Listings = 'listings',
}

interface ReviewSectionProps {
    pendingReviewsCount: number;
    pendingWorkspacesCount: number;
}

const ContentReviewSection: React.FC<ReviewSectionProps> = ({ pendingReviewsCount, pendingWorkspacesCount }) => {
    const [activeTab, setActiveTab] = useState<ReviewType>(ReviewType.Reviews);

    const renderContent = () => {
        switch (activeTab) {
            case ReviewType.Reviews:
                return <ReviewsPendingList />;
            case ReviewType.Listings:
                return <WorkspacesPendingList />;
            default:
                return null;
        }
    };

    return (
        <div className={cx('review-section')}>
            <div className={cx('review-tabs-container')}>
                <h3>📝 Nhiệm Vụ Kiểm Duyệt</h3>
                <div className={cx('review-tabs')}>
                    <button
                        className={cx('tab-btn', { active: activeTab === ReviewType.Reviews })}
                        onClick={() => setActiveTab(ReviewType.Reviews)}
                    >
                        Reviews ({pendingReviewsCount})
                    </button>
                    <button
                        className={cx('tab-btn', { active: activeTab === ReviewType.Listings })}
                        onClick={() => setActiveTab(ReviewType.Listings)}
                    >
                        Listings ({pendingWorkspacesCount})
                    </button>
                </div>
            </div>
            {/* Hiển thị danh sách tương ứng với tab */}
            <div className={cx('tab-content')}>
                {renderContent()}
            </div>
        </div>
    );
};





// Nội dung cho mục Hỗ trợ Khách hàng
const SupportSection: React.FC = () => (
    <div className={cx('support-section')}>
        <h3>💬 Hộp Thư Hỗ Trợ Trực Tuyến</h3>
        <div className={cx('placeholder-long')}>
            <SupportTicketList />
            {/* [Giao diện Chat: Danh sách Ticket/User đang chờ, ô trả lời nhanh, bộ lọc theo trạng thái (Open/Resolved)] */}
        </div>
        {/* <button className={cx('view-all-btn')}>Xem Tất Cả Ticket (15 Mới)</button> */}
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
    const [stats, setStats] = useState<StaffDashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const {user, logout, isLoggedIn} = useAuth();
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        navigate('/'); 
        toast.dark('Bạn vừa đăng xuất khỏi hệ thống!')
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setIsLoading(true);
                const data = await getStaffDashboard();
                setStats(data);
            } catch (error) {
                
            } finally {
                setIsLoading(false)
            }
        }
        fetchStats();
    },[])



    const taskData: { title: string; count: number; description: string; icon: IconDefinition; color: 'orange' | 'purple' | 'green' | 'blue' }[] = [
        { title: "Yêu Cầu Hỗ Trợ Mới", count: Number(stats?.newSupportTicketsCount ?? 0), description: "Xử lý các khiếu nại, yêu cầu đơn giản.", icon: faEnvelopeOpenText, color: "orange" },
        { title: "Review Chờ Duyệt", count: Number(stats?.pendingReviewsCount ?? 0), description: "Kiểm tra đánh giá trước khi hiển thị công khai.", icon: faStar, color: "purple" },
        { title: "Workspace Chờ Duyệt", count: Number(stats?.pendingWorkspacesCount ?? 0), description: "Duyệt thông tin và hình ảnh workspace mới.", icon: faBuilding, color: "green" },
        { title: "Booking Trong Ngày", count: Number(stats?.bookingsTodayCount ?? 0), description: "Giám sát các đơn hàng đang diễn ra.", icon: faEye, color: "blue" },
    ];
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
                                    <div className={cx('data-display')}>
                                        {stats?.cancelledBookings && <CancelledBookingList bookings={stats.cancelledBookings} />}
                                        {
                                        /* Hiển thị thông báo khi đang tải hoặc không có dữ liệu */
                                        !stats && isLoading && <p>Đang tải dữ liệu...</p>
                                        } 
                                    </div>
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
                        <ContentReviewSection 
                            pendingReviewsCount={Number(stats?.pendingReviewsCount ?? 0)}
                            pendingWorkspacesCount={Number(stats?.pendingWorkspacesCount ?? 0)}
                        />
                    </div>
                );
            case StaffPage.Monitoring:
                return (
                    <div className={cx('content-section')}>
                        <h2 className={cx('section-title')}>👁️ GIÁM SÁT HOẠT ĐỘNG</h2>
                        <div className={cx('monitoring-main-box')}>
                            <h3>Booking Đang Diễn Ra (Hôm Nay)</h3>
                            <div className={cx('data-display')}>
                                <BookingTodayListTable /> 
                            </div>
                        </div>
                    </div>
                );
            case StaffPage.Posts:
                return (
                    <div className={cx('content-section')}>
                        <h2 className={cx('section-title')}>Bài Viết</h2>
                        <PostManagementSection />
                    </div>
                );
            case StaffPage.WorkspaceManagement:
                return (
                    <div className={cx('content-section')}>
                        <h2 className={cx('section-title')}>Workspace</h2>
                        <WorkspaceManagementSection/>
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
                <div className={cx('logo')}>CBS STAFF</div>
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
                    <li className={cx('nav-item', { active: activePage === StaffPage.Posts })} onClick={() => setActivePage(StaffPage.Posts)}>
                        <FontAwesomeIcon icon={faNewspaper} /> <span>Bài viết</span>
                    </li>
                    <li className={cx('nav-item', { active: activePage === StaffPage.WorkspaceManagement })} onClick={() => setActivePage(StaffPage.WorkspaceManagement)}>
                        <FontAwesomeIcon icon={faBuilding} /> <span>Workspace</span>
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
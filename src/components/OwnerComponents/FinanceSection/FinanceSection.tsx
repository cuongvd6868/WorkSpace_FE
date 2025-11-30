// src/components/OwnerDashboard/FinanceSection.tsx
import React from 'react';
import classNames from 'classnames/bind';
// import styles from '../../styles/OwnerDashboard.module.scss'; 
import styles from './FinanceSection.module.scss'; 
import KPICard from '~/components/KPICard/KPICard';
import { faWallet, faChartLine, faExchangeAlt, faCog, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { OwnerStats } from '~/types/Owner'; 
import WeeklyRevenueChart from '../Charts/WeeklyRevenueChart'; 

const cx = classNames.bind(styles);

// Định nghĩa lại KPICardProps để giải quyết lỗi TS2322 (Giả định structure này)
// Tốt nhất là import từ file KPICard/KPICard.tsx nếu có
interface KPICardProps {
    title: string;
    value: string;
    change: string;
    icon: IconDefinition;
    // Kiểu dữ liệu giới hạn (Literal union type) cho prop color
    color: 'green' | 'blue' | 'purple' | 'red'; 
}

interface FinanceSectionProps {
    stats: OwnerStats | null;
    isLoading: boolean;
}

const formatVND = (amount: number | undefined): string => {
    if (amount === undefined || amount === null || isNaN(amount)) return 'N/A';
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};


const FinanceSection: React.FC<FinanceSectionProps> = ({ stats, isLoading }) => {
    
    // Giả định thêm trường 'currentBalance' vào OwnerStats nếu API hỗ trợ.
    const currentBalance = 5500000; // Thay bằng stats?.currentBalance nếu có

    // Khai báo rõ ràng kiểu dữ liệu là KPICardProps[]
    const kpiFinanceData: KPICardProps[] = [
        { 
            title: "Số Dư Hiện Tại", 
            value: formatVND(currentBalance), 
            change: "Sẵn sàng rút", 
            icon: faWallet, 
            color: "blue" // Kiểu khớp với KPICardProps
        },
        { 
            title: "Tổng Thu Nhập Trọn Đời", 
            // Dữ liệu totalRevenue đã được fetch từ API
            value: formatVND(stats?.totalRevenue), 
            change: "Tăng trưởng tốt", 
            icon: faChartLine, 
            color: "green" // Kiểu khớp với KPICardProps
        },
        { 
            title: "Giao Dịch Trong Tháng", 
            // Dữ liệu totalBookings đã được fetch từ API
            value: `${stats?.totalBookings || 0} Lần`, 
            change: "Cần xem xét", 
            icon: faExchangeAlt, 
            color: "purple" // Kiểu khớp với KPICardProps
        },
    ];
    
    return (
        <div className={cx('finance-content')}>
            {/* 1. Tóm tắt Thu nhập */}
            <div className={cx('finance-summary')}>
                <div className={cx('kpi-grid')}>
                    {/* TS2322 đã được giải quyết nhờ khai báo kpiFinanceData: KPICardProps[] */}
                    {kpiFinanceData.map((kpi, index) => (
                        <KPICard key={index} {...kpi} /> 
                    ))}
                </div>
                {/* <button 
                    className={cx('action-btn', 'payout-btn')} 
                    disabled={isLoading || currentBalance <= 0}
                >
                    💰 Yêu Cầu Thanh Toán ({formatVND(currentBalance)})
                </button> */}
            </div>

            {/* 2. Biểu đồ Phân tích Doanh thu */}
            <div className={cx('chart-box', 'large-chart')}>
                <h3 className={cx('chart-title')}>Biểu đồ Thu nhập 6 Tháng Gần Nhất</h3>
                {/* Sử dụng WeeklyRevenueChart */}
                {stats?.weeklyRevenueTrend ? (
                    <WeeklyRevenueChart data={stats.weeklyRevenueTrend} /> 
                ) : (
                    <div className={cx('placeholder', 'chart-placeholder')}>
                        {isLoading ? 'Đang tải dữ liệu biểu đồ...' : 'Không có dữ liệu thu nhập.'}
                    </div>
                )}
            </div>

            {/* 3. Lịch sử Giao dịch */}
            <div className={cx('history-table')}>
                <h3>📜 Lịch Sử Giao Dịch & Thu Nhập</h3>
                <p className={cx('placeholder-long')}>
                    [Bảng chi tiết các giao dịch Booking đã hoàn thành, hiển thị Thu nhập ròng, Phí dịch vụ, và Trạng thái thanh toán của từng giao dịch.]
                </p>
            </div>

            {/* 4. Cài đặt Thanh toán */}
            <div className={cx('settings-box')}>
                <h3>⚙️ Cài Đặt Thanh Toán</h3>
                <div className={cx('placeholder-short')}>
                    <p>Ngân hàng: **Vietcombank** (CN Sài Gòn)</p>
                    <p>Số tài khoản: **XXX-9876-XXXX**</p>
                    <p>Tần suất: **Thanh toán tự động 2 lần/tháng**</p>
                </div>
                <button className={cx('edit-btn')}>Chỉnh Sửa Thông Tin Thanh Toán</button>
            </div>
            
        </div>
    );
}

export default FinanceSection;
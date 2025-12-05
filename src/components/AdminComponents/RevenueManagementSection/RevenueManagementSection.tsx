import React from 'react';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faBuilding, IconDefinition } from '@fortawesome/free-solid-svg-icons';
// Giả định styles được đặt ở cùng cấp
import styles from './RevenueManagementSection.module.scss'; 
import KPICard from '~/components/KPICard/KPICard';
// Điều chỉnh import path nếu cần, ở đây giả định là 1 level trên
import LineChartRevenue from '../LineChartRevenue/LineChartRevenue'; 
import { AdminStats } from "~/types/Admin";

const cx = classNames.bind(styles);

interface RevenueManagementSectionProps {
    stats: AdminStats | null;
    isLoading: boolean;
    error: string | null;
}

const RevenueManagementSection: React.FC<RevenueManagementSectionProps> = ({ stats, isLoading, error }) => {

    const kpiDataRevenue: { title: string; value: string; change: string; icon: IconDefinition; color: 'green' | 'blue' | 'purple' | 'red' }[] = [
        { 
            title: "Doanh Thu Hôm Nay (Giả Định)", 
            value: `${Math.round((stats?.totalRevenue ?? 0) / 30).toLocaleString('vi-VN')} VND`, 
            change: "+5%", 
            icon: faDollarSign, 
            color: "green" 
        },
        { 
            title: "Số Lượng Giao Dịch (T.Này)", 
            value: `${(stats?.newBookingsThisMonth ?? 0).toLocaleString('vi-VN')} GD`, 
            change: "+15%", 
            icon: faBuilding, 
            color: "blue" 
        },
        { 
            title: "Doanh Thu Năm Nay (Giả Định)", 
            value: `${((stats?.totalRevenue ?? 0) * 12).toLocaleString('vi-VN')} VND`, 
            change: "+10%", 
            icon: faDollarSign, 
            color: "purple" 
        },
        { 
            title: "Doanh Thu TB/Booking", 
            value: `${(stats?.totalRevenue && stats?.newBookingsThisMonth) 
                ? Math.round(stats.totalRevenue / stats.newBookingsThisMonth).toLocaleString('vi-VN') 
                : 0} VND`, 
            change: "---", 
            icon: faDollarSign, 
            color: "red" 
        },
    ];

    if (error) {
        return <p style={{ color: 'red', padding: '20px' }}>Lỗi khi tải dữ liệu Doanh Thu: **{error}**</p>;
    }
    
    return (
        <div className={cx('revenue-management')}>

            {/* 1. KPI Cards dành riêng cho Doanh Thu */}
            <div className={cx('kpi-grid')}>
                {kpiDataRevenue.map((kpi, index) => (
                    <KPICard 
                        key={index} 
                        {...kpi} 
                        // Hiển thị loading state trên KPI Card nếu cần
                        value={isLoading ? 'Đang tải...' : kpi.value} 
                    />
                ))}
            </div>

            {/* 2. Biểu Đồ Doanh Thu Chi Tiết */}
            <div className={cx('chart-box')}>
                <h3 className={cx('chart-title')}>BIỂU ĐỒ TĂNG TRƯỞNG DOANH THU</h3>
                {isLoading ? (
                    <div className={cx('placeholder', 'chart-placeholder')}>Đang tải biểu đồ...</div>
                ) : (
                    <LineChartRevenue data={stats?.revenueChart || []} />
                )}
            </div>

            {/* 3. Bảng Dữ Liệu Giao Dịch */}
            <div className={cx('transaction-detail')}>
                <h3>🧾 CHI TIẾT GIAO DỊCH GẦN NHẤT</h3>
                <p className={cx('placeholder')}>[Bảng dữ liệu: Mã GD, Số tiền, Người dùng, Workspace, Trạng thái]</p>
                <button className={cx('view-report-btn')} style={{ marginTop: '10px' }}>Xem Báo Cáo Chi Tiết</button>
            </div>
        </div>
    );
};

export default RevenueManagementSection;
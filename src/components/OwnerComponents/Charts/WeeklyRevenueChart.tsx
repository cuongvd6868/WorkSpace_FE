// src/components/Charts/WeeklyRevenueChart.tsx
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { WeeklyRevenueData } from '~/types/Owner'; // Giả sử WeeklyRevenueData nằm trong file Owner.ts hoặc đã được import

// Định nghĩa props cho component biểu đồ
interface WeeklyRevenueChartProps {
  data: WeeklyRevenueData[];
}

// Hàm format tiền tệ (Ví dụ: 1200000 -> 1.200.000)
const formatCurrency = (value: number) => {
  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

const WeeklyRevenueChart: React.FC<WeeklyRevenueChartProps> = ({ data }) => {
    
    if (!data || data.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                Không có dữ liệu doanh thu hàng tuần để hiển thị.
            </div>
        );
    }

    return (
        
        <ResponsiveContainer width="100%" height={350}>
            <BarChart
                data={data}
                margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                {/* Lưới tọa độ */}
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                
                {/* Trục X: Hiển thị tuần (weekLabel) */}
                <XAxis 
                    dataKey="weekLabel" 
                    angle={-15} 
                    textAnchor="end" 
                    height={50} 
                    stroke="#555"
                />
                
                {/* Trục Y: Hiển thị Doanh thu (totalRevenue) */}
                <YAxis 
                    tickFormatter={(value) => formatCurrency(value)}
                    stroke="#555"
                />
                
                {/* Tooltip: Hiển thị thông tin chi tiết khi hover */}
                <Tooltip 
                    formatter={(value: number, name: string) => [formatCurrency(value), "Doanh Thu"]} 
                    labelFormatter={(label) => `Tuần: ${label}`}
                />
                
                {/* Chú giải (Legend) */}
                <Legend />
                
                {/* Thanh Biểu đồ (Bar) */}
                <Bar 
                    dataKey="totalRevenue" 
                    name="Doanh Thu" 
                    fill="#8884d8" 
                    barSize={40} 
                />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default WeeklyRevenueChart;
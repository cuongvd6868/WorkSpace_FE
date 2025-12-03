import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RevenueChartItem } from '~/types/Admin'; 

interface LineChartRevenueProps {
    data: RevenueChartItem[];
}

// Hàm định dạng giá trị trục Y (VND)
const formatYAxis = (tickValue: number) => {
    // Chia cho 1,000,000 để hiển thị đơn vị triệu VND (cho dễ nhìn)
    if (tickValue >= 1000000) {
        return `${(tickValue / 1000000).toLocaleString()} Tr`; 
    }
    return tickValue.toLocaleString();
};

// Custom Tooltip hiển thị thông tin chi tiết khi hover
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        // payload[0].value là giá trị revenue
        const revenueValue = payload[0].value;
        return (
            <div style={{ 
                backgroundColor: '#fff', 
                border: '1px solid #ccc', 
                padding: '10px', 
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
            }}>
                <p style={{ margin: 0 }}>**Tháng:** {label}</p>
                <p style={{ margin: 0, color: payload[0].color }}>
                    **Doanh Thu:** {revenueValue.toLocaleString('vi-VN')} VND
                </p>
            </div>
        );
    }
    return null;
};


const LineChartRevenue: React.FC<LineChartRevenueProps> = ({ data }) => {
    // Nếu không có dữ liệu, hiển thị thông báo
    if (!data || data.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '50px', color: '#888' }}>
                Không có dữ liệu doanh thu để hiển thị.
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart
                data={data}
                margin={{
                    top: 15, right: 30, left: 20, bottom: 5,
                }}
            >
                {/* Lưới tọa độ */}
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /> 
                
                {/* Trục X: Tháng/Năm */}
                <XAxis 
                    dataKey="label" // label đã được định nghĩa là "Tháng X/Năm Y"
                    stroke="#555"
                    padding={{ left: 10, right: 10 }}
                />
                
                {/* Trục Y: Doanh Thu */}
                <YAxis 
                    stroke="#555"
                    tickFormatter={formatYAxis} // Định dạng hiển thị đơn vị triệu
                    label={{ value: 'VND (Triệu)', angle: -90, position: 'insideLeft', fill: '#555' }}
                />
                
                {/* Tooltip: Hiển thị chi tiết khi hover */}
                <Tooltip content={<CustomTooltip />} />
                
                {/* Chú thích */}
                <Legend />
                
                {/* Đường Biểu Đồ */}
                <Line 
                    type="monotone" // Kiểu đường cong mềm mại
                    dataKey="revenue" 
                    name="Doanh Thu"
                    stroke="#8884d8" // Màu đường
                    activeDot={{ r: 8 }} // Điểm sáng khi hover
                    strokeWidth={3}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default LineChartRevenue;
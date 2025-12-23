import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RevenueChartItem } from '~/types/Admin'; 

interface LineChartRevenueProps {
    data: RevenueChartItem[];
}

const formatYAxis = (tickValue: number) => {
    if (tickValue >= 1000000) {
        return `${(tickValue / 1000000).toLocaleString()} Tr`; 
    }
    return tickValue.toLocaleString();
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
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
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /> 
                
                <XAxis 
                    dataKey="label" 
                    stroke="#f8ededff"
                    padding={{ left: 10, right: 10 }}
                />
                
                <YAxis 
                    stroke="#e6dedeff"
                    tickFormatter={formatYAxis} 
                    label={{ value: 'VND (Triệu)', angle: -90, position: 'insideLeft', fill: '#e3d7d7ff' }}
                />
                
                <Tooltip content={<CustomTooltip />} />
                
                <Legend />
                
                <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    name="Doanh Thu"
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                    strokeWidth={3}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default LineChartRevenue;
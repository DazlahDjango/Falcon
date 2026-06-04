import React from 'react';
import { FiCalendar } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import './analytics.css';

export const RevenueChart = ({ data = [], period = 'monthly', loading = false }) => {
    if (loading) return <div className="revenue-chart-skeleton"><div className="skeleton skeleton-chart"></div></div>;

    const chartData = data.map(item => ({ name: item.month || item.date || item.period, revenue: item.revenue || item.total || item.amount || 0, count: item.count || 0 }));

    return (
        <div className="revenue-chart-card">
            <div className="chart-header"><FiCalendar /> Revenue Overview <span className="chart-period">{period.charAt(0).toUpperCase() + period.slice(1)} Breakdown</span></div>
            <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis yAxisId="left" tickFormatter={(v) => `KES ${v / 1000}k`} tick={{ fontSize: 11 }} />
                        <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}`} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v, name) => [name === 'revenue' ? `KES ${(v / 100).toFixed(2)}` : v, name === 'revenue' ? 'Revenue' : 'Transactions']} />
                        <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="right" dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RevenueChart;
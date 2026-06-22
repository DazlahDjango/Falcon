import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import './analytics.css';

const COLORS = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

export const RevenueBreakdown = ({ data = [], title = "Revenue by Plan", loading = false }) => {
    if (loading) return <div className="breakdown-skeleton"><div className="skeleton skeleton-chart"></div></div>;
    if (!data.length) return <div className="breakdown-empty">No revenue data available</div>;

    const total = data.reduce((sum, item) => sum + (item.value || item.revenue || item.amount || 0), 0);

    return (
        <div className="revenue-breakdown">
            <div className="breakdown-header"><h4>{title}</h4><span className="breakdown-total">Total: <CurrencyFormatter amount={total} showCents={false} /></span></div>
            <div className="breakdown-content">
                <div className="breakdown-chart">
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                                {data.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                            </Pie>
                            <Tooltip formatter={(v) => CurrencyFormatter({ amount: v, showCents: false })} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="breakdown-list">
                    {data.map((item, idx) => (
                        <div key={idx} className="breakdown-item"><span className="breakdown-color" style={{ background: COLORS[idx % COLORS.length] }}></span><span className="breakdown-name">{item.name}</span><span className="breakdown-value"><CurrencyFormatter amount={item.value || item.revenue || item.amount || 0} showCents={false} /></span></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RevenueBreakdown;
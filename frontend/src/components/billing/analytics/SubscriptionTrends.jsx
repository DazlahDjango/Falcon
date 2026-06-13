import React from 'react';
import { FiUsers, FiUserPlus, FiUserMinus } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import './analytics.css';

export const SubscriptionTrends = ({ data = [], loading = false }) => {
    if (loading) return <div className="trends-skeleton"><div className="skeleton skeleton-chart"></div></div>;

    const chartData = data.map(item => ({ month: item.month || item.date, active: item.active || 0, new: item.new || 0, cancelled: item.cancelled || 0 }));

    const latest = chartData[chartData.length - 1] || { active: 0, new: 0, cancelled: 0 };
    const netGrowth = latest.new - latest.cancelled;

    return (
        <div className="subscription-trends">
            <div className="trends-header">
                <h4><FiUsers /> Subscription Trends</h4>
                <div className="trends-stats"><span className="stat new"><FiUserPlus /> +{latest.new} new</span><span className="stat cancelled"><FiUserMinus /> {latest.cancelled} cancelled</span><span className={`stat net ${netGrowth >= 0 ? 'positive' : 'negative'}`}>Net: {netGrowth >= 0 ? '+' : ''}{netGrowth}</span></div>
            </div>
            <div className="trends-chart">
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Active" />
                        <Line type="monotone" dataKey="new" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} name="New" />
                        <Line type="monotone" dataKey="cancelled" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} name="Cancelled" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SubscriptionTrends;
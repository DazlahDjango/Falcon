import React from 'react';
import { FiDollarSign, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './analytics.css';

export const MRRCard = ({ data = [], currentMRR = 0, previousMRR = 0, loading = false }) => {
    const change = previousMRR ? ((currentMRR - previousMRR) / previousMRR) * 100 : 0;
    const isPositive = change >= 0;

    if (loading) return <div className="mrr-skeleton"><div className="skeleton skeleton-title"></div><div className="skeleton skeleton-chart"></div></div>;

    const chartData = data.map(item => ({ month: item.month || item.date, value: item.mrr || item.revenue || item.value || 0 }));

    return (
        <div className="mrr-card">
            <div className="mrr-header">
                <div className="mrr-title"><FiDollarSign /> Monthly Recurring Revenue</div>
                <div className="mrr-value"><CurrencyFormatter amount={currentMRR} showCents={false} /><span className="mrr-change"><span className={isPositive ? 'positive' : 'negative'}>{isPositive ? <FiTrendingUp /> : <FiTrendingDown />} {Math.abs(change).toFixed(1)}%</span></span></div>
            </div>
            <div className="mrr-chart">
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={chartData}>
                        <defs><linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs>
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={(v) => `KES ${v / 1000}k`} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v) => [`KES ${(v / 100).toFixed(2)}`, 'MRR']} />
                        <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="url(#mrrGradient)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <div className="mrr-footer"><span className="mrr-note">Projected MRR: <CurrencyFormatter amount={currentMRR * 1.12} showCents={false} /></span></div>
        </div>
    );
};

export default MRRCard;
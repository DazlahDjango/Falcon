import React from 'react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { BillingCard } from '../shared/BillingCard';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import './admin.css';

export const RevenueChart = ({ data = [], loading = false }) => {
    if (loading) return <LoadingSkeleton type="chart" count={1} />;
    if (!data.length) return <BillingCard title="Revenue Trend" icon={<FiTrendingUp />}><div className="chart-empty">No revenue data available</div></BillingCard>;

    const maxValue = Math.max(...data.map(d => d.total || d.revenue || 0));
    const hasNegative = data.some(d => (d.total || d.revenue || 0) < 0);
    const previousMonthTotal = data.length > 1 ? data[data.length - 2].total || data[data.length - 2].revenue || 0 : 0;
    const currentMonthTotal = data[data.length - 1]?.total || data[data.length - 1]?.revenue || 0;
    const trend = previousMonthTotal ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal * 100) : 0;

    return (
        <BillingCard title="Revenue Trend" icon={<FiTrendingUp />} headerAction={<div className={`trend-indicator ${trend >= 0 ? 'positive' : 'negative'}`}>{trend >= 0 ? <FiTrendingUp /> : <FiTrendingDown />} {Math.abs(trend).toFixed(1)}%</div>}>
            <div className="revenue-chart-container">
                <div className="revenue-chart-bars">
                    {data.map((item, index) => {
                        const value = item.total || item.revenue || 0;
                        const height = maxValue > 0 ? (value / maxValue) * 200 : 0;
                        const isPositive = value >= 0;
                        return (
                            <div key={index} className="chart-bar-wrapper">
                                <div className={`chart-bar ${isPositive ? 'positive' : 'negative'}`} style={{ height: `${Math.abs(height)}px` }}>
                                    <span className="chart-bar-value"><CurrencyFormatter amount={Math.abs(value)} showCents={false} /></span>
                                </div>
                                <span className="chart-bar-label">{item.month || item.date || `Week ${index + 1}`}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </BillingCard>
    );
};

export default RevenueChart;
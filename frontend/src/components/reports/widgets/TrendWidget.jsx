// frontend/src/components/reports/widgets/TrendWidget.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiArrowUp, FiArrowDown, FiMinus } from 'react-icons/fi';
import './widgets.css';

export const TrendWidget = ({ widget, data }) => {
    const {
        periods = [],
        values = [],
        trend_line = [],
        mom_growth = [],
        yoy_growth = [],
        direction = 'stable',
        growth_rate = 0,
        volatility = 0,
    } = data;

    const getDirectionIcon = () => {
        if (direction === 'upward') return <FiArrowUp size={18} className="trend-up" />;
        if (direction === 'downward') return <FiArrowDown size={18} className="trend-down" />;
        return <FiMinus size={18} className="trend-stable" />;
    };

    const getDirectionColor = () => {
        if (direction === 'upward') return '#10b981';
        if (direction === 'downward') return '#ef4444';
        return '#94a3b8';
    };

    const getGrowthColor = (growth) => {
        if (growth > 0) return '#10b981';
        if (growth < 0) return '#ef4444';
        return '#94a3b8';
    };

    const getMinMax = () => {
        if (values.length === 0) return { min: 0, max: 100 };
        const min = Math.min(...values);
        const max = Math.max(...values);
        const padding = (max - min) * 0.1 || 10;
        return { min: min - padding, max: max + padding };
    };

    const getBarHeight = (value) => {
        const { min, max } = getMinMax();
        if (max === min) return 50;
        return ((value - min) / (max - min)) * 80 + 10;
    };

    if (!data || periods.length === 0) {
        return (
            <div className="trend-placeholder">
                <p>No trend data available</p>
            </div>
        );
    }

    return (
        <div className="trend-widget">
            <div className="trend-header">
                <div className="trend-stats">
                    <span className="trend-direction" style={{ color: getDirectionColor() }}>
                        {getDirectionIcon()}
                        {direction}
                    </span>
                    <span className="trend-growth" style={{ color: getGrowthColor(growth_rate) }}>
                        {growth_rate > 0 ? '+' : ''}{growth_rate.toFixed(1)}%
                    </span>
                    <span className="trend-volatility">
                        Volatility: {volatility.toFixed(2)}
                    </span>
                </div>
            </div>

            <div className="trend-chart">
                <div className="trend-bars">
                    {periods.map((period, idx) => {
                        const height = getBarHeight(values[idx]);
                        const trendHeight = trend_line[idx] ? getBarHeight(trend_line[idx]) : 0;
                        return (
                            <div key={idx} className="trend-bar-group">
                                <div className="trend-bar-wrapper">
                                    <div
                                        className="trend-bar"
                                        style={{ height: `${height}%` }}
                                    />
                                    {trend_line.length > 0 && (
                                        <div
                                            className="trend-line-marker"
                                            style={{ height: `${trendHeight}%` }}
                                        />
                                    )}
                                </div>
                                <span className="trend-label">{period}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="trend-footer">
                {mom_growth.length > 0 && (
                    <div className="trend-mom">
                        <span className="mom-label">MoM:</span>
                        {mom_growth.slice(-3).map((g, idx) => (
                            <span
                                key={idx}
                                className="mom-value"
                                style={{ color: getGrowthColor(g) }}
                            >
                                {g > 0 ? '+' : ''}{g.toFixed(1)}%
                            </span>
                        ))}
                    </div>
                )}
                {yoy_growth.length > 0 && (
                    <div className="trend-yoy">
                        <span className="yoy-label">YoY:</span>
                        {yoy_growth.slice(-1).map((g, idx) => (
                            <span
                                key={idx}
                                className="yoy-value"
                                style={{ color: getGrowthColor(g) }}
                            >
                                {g > 0 ? '+' : ''}{g.toFixed(1)}%
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

TrendWidget.propTypes = {
    widget: PropTypes.object.isRequired,
    data: PropTypes.object,
};
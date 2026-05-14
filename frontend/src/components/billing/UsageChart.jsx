import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

const UsageChart = ({ 
    data, 
    type = 'line',
    metrics = ['api_calls', 'storage', 'users'],
    height = 300,
    title,
}) => {
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];
        return data.map(point => ({
            date: point.date,
            api_calls: point.api_calls || 0,
            storage: Math.round((point.storage_mb || 0) / 1024 * 10) / 10, // Convert to GB
            users: point.users || 0,
            kpis: point.kpis || 0,
        }));
    }, [data]);
    const formatYAxis = (value, metric) => {
        if (metric === 'storage') return `${value} GB`;
        if (metric === 'api_calls') return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value;
        return value;
    };
    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload) return null;  
        return (
            <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
                {payload.map((entry, idx) => (
                    <p key={idx} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: {entry.value.toLocaleString()} {entry.dataKey === 'storage' ? 'GB' : ''}
                    </p>
                ))}
            </div>
        );
    };
    const getLineColor = (metric) => {
        const colors = {
            api_calls: '#3B82F6',
            storage: '#10B981',
            users: '#F59E0B',
            kpis: '#8B5CF6',
        };
        return colors[metric] || '#6B7280';
    };
    const getMetricLabel = (metric) => {
        const labels = {
            api_calls: 'API Calls',
            storage: 'Storage (GB)',
            users: 'Users',
            kpis: 'KPIs',
        };
        return labels[metric] || metric;
    };
    if (chartData.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No usage data available
            </div>
        );
    }
    
    return (
        <div>
            {title && (
                <h4 className="text-sm font-medium text-gray-700 mb-4">{title}</h4>
            )}
            <ResponsiveContainer width="100%" height={height}>
                {type === 'line' && (
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {metrics.map(metric => (
                            <Line
                                key={metric}
                                type="monotone"
                                dataKey={metric}
                                stroke={getLineColor(metric)}
                                name={getMetricLabel(metric)}
                                strokeWidth={2}
                                dot={{ r: 3 }}
                                activeDot={{ r: 5 }}
                            />
                        ))}
                    </LineChart>
                )}
                {type === 'area' && (
                    <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {metrics.map(metric => (
                            <Area
                                key={metric}
                                type="monotone"
                                dataKey={metric}
                                stroke={getLineColor(metric)}
                                fill={`${getLineColor(metric)}20`}
                                name={getMetricLabel(metric)}
                            />
                        ))}
                    </AreaChart>
                )}              
                {type === 'bar' && (
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {metrics.map(metric => (
                            <Bar
                                key={metric}
                                dataKey={metric}
                                fill={getLineColor(metric)}
                                name={getMetricLabel(metric)}
                            />
                        ))}
                    </BarChart>
                )}
            </ResponsiveContainer>
        </div>
    );
};
UsageChart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
        date: PropTypes.string.isRequired,
        api_calls: PropTypes.number,
        storage_mb: PropTypes.number,
        users: PropTypes.number,
        kpis: PropTypes.number,
    })).isRequired,
    type: PropTypes.oneOf(['line', 'area', 'bar']),
    metrics: PropTypes.arrayOf(PropTypes.oneOf(['api_calls', 'storage', 'users', 'kpis'])),
    height: PropTypes.number,
    title: PropTypes.string,
};
UsageChart.defaultProps = {
    type: 'line',
    metrics: ['api_calls', 'storage', 'users'],
    height: 300,
};
export default UsageChart;
// frontend/src/components/tenant/connections/ConnectionHealthChart.jsx
import React from 'react';
import {
    LineChart,
    Line,
    Area,
    AreaChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

const ConnectionHealthChart = ({ data, title, type = 'line' }) => {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
                <div className="text-center text-gray-500 py-8">
                    No data available
                </div>
            </div>
        );
    }

    const ChartComponent = type === 'area' ? AreaChart : LineChart;

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={300}>
                <ChartComponent data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {type === 'area' ? (
                        <>
                            <Area
                                type="monotone"
                                dataKey="active"
                                stackId="1"
                                stroke="#10B981"
                                fill="#10B981"
                                fillOpacity={0.3}
                                name="Active"
                            />
                            <Area
                                type="monotone"
                                dataKey="idle"
                                stackId="1"
                                stroke="#F59E0B"
                                fill="#F59E0B"
                                fillOpacity={0.3}
                                name="Idle"
                            />
                            <Area
                                type="monotone"
                                dataKey="error"
                                stackId="1"
                                stroke="#EF4444"
                                fill="#EF4444"
                                fillOpacity={0.3}
                                name="Error"
                            />
                        </>
                    ) : (
                        <>
                            <Line
                                type="monotone"
                                dataKey="active"
                                stroke="#10B981"
                                name="Active"
                                strokeWidth={2}
                            />
                            <Line
                                type="monotone"
                                dataKey="idle"
                                stroke="#F59E0B"
                                name="Idle"
                                strokeWidth={2}
                            />
                            <Line
                                type="monotone"
                                dataKey="error"
                                stroke="#EF4444"
                                name="Error"
                                strokeWidth={2}
                            />
                        </>
                    )}
                </ChartComponent>
            </ResponsiveContainer>
        </div>
    );
};

export default ConnectionHealthChart;
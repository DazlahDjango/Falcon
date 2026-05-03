// frontend/src/components/tenant/resources/ResourceHistoryChart.jsx
import React, { useState } from 'react';
import './resources.css';

export const ResourceHistoryChart = ({ history, resourceType, loading = false }) => {
    const [timeRange, setTimeRange] = useState('30');

    if (loading) {
        return (
            <div className="chart-container">
                <div className="chart-title">Usage History - {resourceType}</div>
                <div className="chart-wrapper flex items-center justify-center">
                    <div className="text-gray-500">Loading history...</div>
                </div>
            </div>
        );
    }

    if (!history || history.length === 0) {
        return (
            <div className="chart-container">
                <div className="chart-title">Usage History - {resourceType}</div>
                <div className="chart-wrapper flex items-center justify-center">
                    <div className="text-gray-500">No history data available</div>
                </div>
            </div>
        );
    }

    const maxValue = Math.max(...history.map(d => d.value), 1);

    return (
        <div className="chart-container">
            <div className="flex justify-between items-center mb-4">
                <div className="chart-title">Usage History - {resourceType}</div>
                <div className="flex gap-2">
                    {[7, 30, 90].map(days => (
                        <button
                            key={days}
                            onClick={() => setTimeRange(days.toString())}
                            className={`px-2 py-1 text-xs rounded ${timeRange === days.toString()
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {days}d
                        </button>
                    ))}
                </div>
            </div>
            <div className="chart-wrapper">
                <div className="relative h-full">
                    <div className="absolute left-0 right-0 top-0 bottom-0 flex items-end gap-1">
                        {history.slice(-parseInt(timeRange)).map((item, index) => {
                            const height = (item.value / maxValue) * 200;
                            return (
                                <div key={index} className="flex-1 flex flex-col items-center">
                                    <div className="text-xs text-gray-500 mb-1">{item.value}</div>
                                    <div
                                        className="w-full bg-blue-500 rounded-t transition-all duration-300"
                                        style={{ height: `${Math.max(height, 4)}px` }}
                                    />
                                    <div className="text-xs text-gray-500 mt-1">
                                        {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
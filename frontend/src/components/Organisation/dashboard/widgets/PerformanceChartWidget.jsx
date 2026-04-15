import React, { useState, useEffect } from 'react';
import { useKpiData } from '@/hooks/organisation';
import { useAuthContext } from '@/contexts/accounts/AuthContext';

// Simple chart component without external dependencies
const PerformanceChartWidget = () => {
  const { isAuthenticated } = useAuthContext();
  const { performanceTrend: data, loading, getPerformanceTrend } = useKpiData();
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    if (isAuthenticated) {
      getPerformanceTrend({ period });
    }
  }, [period, isAuthenticated, getPerformanceTrend]);

  const chartData = data || [];
  const maxScore = chartData.length > 0 ? Math.max(...chartData.map(d => d.score), 100) : 100;
  const chartHeight = 120;

  if (loading && chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Performance Trend</h3>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1"
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 6 months</option>
            <option value="year">Last year</option>
          </select>
        </div>
      </div>

      <div className="p-6">
        <div className="relative" style={{ height: chartHeight }}>
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 w-8 text-xs text-gray-400 flex flex-col justify-between">
            <span>{maxScore}%</span>
            <span>{Math.round(maxScore / 2)}%</span>
            <span>0%</span>
          </div>

          {/* Chart bars */}
          <div className="ml-10 h-full flex items-end space-x-2">
            {chartData.map((item, idx) => {
              const barHeight = (item.score / maxScore) * chartHeight;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-indigo-500 rounded-t transition-all duration-500 hover:bg-indigo-600"
                    style={{ height: `${barHeight}px` }}
                  >
                    <div className="opacity-0 hover:opacity-100 absolute -mt-6 text-xs bg-gray-800 text-white px-1 rounded">
                      {item.score}%
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2 rotate-45 origin-top-left">
                    {item.month || item.date?.slice(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {chartData.length === 0 && !loading && (
          <p className="text-center text-gray-500 py-8">No performance data available</p>
        )}
      </div>
    </div>
  );
};

export default PerformanceChartWidget;
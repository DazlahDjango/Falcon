import { useHealthCheck } from '../../../hooks/config';
import { LineChart, Line, Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState } from 'react';
import { FiActivity, FiClock, FiBarChart2 } from 'react-icons/fi';

export const HealthMetricsChart = ({ appName, days = 7, metricType = 'response_time' }) => {
  const { useHealthHistory } = useHealthCheck();
  const [timeRange, setTimeRange] = useState(days);
  const { data, isLoading } = useHealthHistory({ app_name: appName, days: timeRange });

  const history = data?.data?.results || [];

  const chartData = history.map(h => ({
    date: new Date(h.created_at).toLocaleDateString(),
    time: new Date(h.created_at).toLocaleTimeString(),
    response_time: h.response_time_ms || 0,
    error_rate: h.error_rate_percent || 0,
    status: h.status
  })).reverse();

  const getYAxisLabel = () => {
    switch (metricType) {
      case 'response_time': return 'Response Time (ms)';
      case 'error_rate': return 'Error Rate (%)';
      default: return 'Value';
    }
  };

  const getLineColor = () => {
    switch (metricType) {
      case 'response_time': return '#3b82f6';
      case 'error_rate': return '#ef4444';
      default: return '#10b981';
    }
  };

  if (isLoading) return <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 animate-pulse"><div className="h-64 bg-gray-100 rounded"></div></div>;

  if (chartData.length === 0) {
    return <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center text-gray-500">No health data available for the selected period</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg"><FiActivity className="text-blue-600" /></div>
          <h3 className="font-semibold text-gray-800">Health Metrics</h3>
          {appName && <span className="text-sm text-gray-500">{appName}</span>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTimeRange(7)} className={`px-3 py-1 text-xs rounded-lg ${timeRange === 7 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>7 Days</button>
          <button onClick={() => setTimeRange(30)} className={`px-3 py-1 text-xs rounded-lg ${timeRange === 30 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>30 Days</button>
          <button onClick={() => setTimeRange(90)} className={`px-3 py-1 text-xs rounded-lg ${timeRange === 90 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>90 Days</button>
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} label={{ value: getYAxisLabel(), angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontSize: 12 } }} />
            <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} />
            <Legend />
            <Line type="monotone" dataKey={metricType === 'response_time' ? 'response_time' : 'error_rate'} stroke={getLineColor()} strokeWidth={2} dot={{ fill: getLineColor(), r: 4 }} activeDot={{ r: 6 }} name={metricType === 'response_time' ? 'Response Time' : 'Error Rate'} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded-full"></div><span>Healthy: {chartData.filter(d => d.status === 'healthy').length} checks</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-500 rounded-full"></div><span>Degraded: {chartData.filter(d => d.status === 'degraded').length} checks</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded-full"></div><span>Unhealthy: {chartData.filter(d => d.status === 'unhealthy').length} checks</span></div>
      </div>
    </div>
  );
};
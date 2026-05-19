import { useHealthCheck } from '../../../hooks/config';
import { HealthStatusBadge } from './HealthStatusBadge';
import { format } from 'date-fns';

export const HealthHistoryTable = ({ appName, limit = 50 }) => {
  const { useHealthHistory } = useHealthCheck();
  const { data, isLoading } = useHealthHistory({ app_name: appName, limit, ordering: '-created_at' });
  const history = data?.data?.results || [];

  if (isLoading) return <div className="text-center py-8 text-gray-500">Loading health history...</div>;

  if (history.length === 0) {
    return <div className="text-center py-8 text-gray-500">No health history found</div>;
  }

  const getResponseTimeColor = (ms) => {
    if (!ms) return 'text-gray-400';
    if (ms < 500) return 'text-green-600';
    if (ms < 2000) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr className="text-left text-gray-600">
            <th className="px-4 py-3">Timestamp</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Response Time</th>
            <th className="px-4 py-3">Error Rate</th>
            <th className="px-4 py-3">Consecutive Failures</th>
            <th className="px-4 py-3">Message</th>
           </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {history.map((check) => (
            <tr key={check.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-gray-600">{format(new Date(check.created_at), 'MMM dd, yyyy HH:mm:ss')}</td>
              <td className="px-4 py-3"><HealthStatusBadge status={check.status} size="sm" /></td>
              <td className="px-4 py-3"><span className={getResponseTimeColor(check.response_time_ms)}>{check.response_time_ms ? `${check.response_time_ms}ms` : '-'}</span></td>
              <td className="px-4 py-3"><span className={check.error_rate_percent > 5 ? 'text-red-600' : 'text-gray-600'}>{check.error_rate_percent ? `${check.error_rate_percent}%` : '-'}</span></td>
              <td className="px-4 py-3"><span className={check.consecutive_failures > 0 ? 'text-red-600 font-medium' : 'text-gray-500'}>{check.consecutive_failures || 0}</span></td>
              <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{check.message || '-'}</td>
             </tr>
          ))}
        </tbody>
       </table>
    </div>
  );
};
import { useDisasterRecovery } from '../../../hooks/config';
import { StatusBadge } from '../common/StatusBadge';
import { FiEye, FiDownload, FiClock, FiTarget } from 'react-icons/fi';
import { format } from 'date-fns';

export const DRExecutionHistory = ({ planId, limit = 20, onSelectExecution }) => {
  const { useDRExecutions } = useDisasterRecovery();
  const { data, isLoading } = useDRExecutions({ dr_plan_id: planId, limit, ordering: '-triggered_at' });
  const executions = data?.data?.results || [];

  if (isLoading) return <div className="text-center py-8 text-gray-500">Loading execution history...</div>;

  if (executions.length === 0) {
    return <div className="text-center py-8 text-gray-500">No DR executions found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr className="text-left text-gray-600">
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">RTO Achieved</th>
            <th className="px-4 py-3">RPO Achieved</th>
            <th className="px-4 py-3">Triggered By</th>
            <th className="px-4 py-3"></th>
           </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {executions.map((exec) => {
            const rtoMet = exec.rto_achieved_minutes && exec.rto_achieved_minutes <= (exec.dr_plan?.rto_target_minutes || 240);
            const rpoMet = exec.rpo_achieved_minutes && exec.rpo_achieved_minutes <= (exec.dr_plan?.rpo_target_minutes || 60);
            return (
              <tr key={exec.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-600">{format(new Date(exec.triggered_at), 'MMM dd, yyyy HH:mm')}</td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${exec.execution_type === 'drill' ? 'bg-blue-100 text-blue-700' : exec.execution_type === 'actual' ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'}`}>{exec.execution_type}</span></td>
                <td className="px-4 py-3"><StatusBadge status={exec.status} size="sm" /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <FiClock className="text-gray-400 text-xs" />
                    <span className={rtoMet ? 'text-green-600' : 'text-red-600'}>{exec.rto_achieved_minutes ? `${exec.rto_achieved_minutes} min` : '-'}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <FiTarget className="text-gray-400 text-xs" />
                    <span className={rpoMet ? 'text-green-600' : 'text-red-600'}>{exec.rpo_achieved_minutes ? `${exec.rpo_achieved_minutes} min` : '-'}</span>
                  </div>
                </td>
                <td className="px-4 py-3"><span className="text-xs capitalize px-2 py-1 bg-gray-100 rounded-full">{exec.triggered_by_role}</span></td>
                <td className="px-4 py-3">
                  <button onClick={() => onSelectExecution?.(exec)} className="p-1.5 hover:bg-gray-100 rounded-lg"><FiEye className="text-gray-500" /></button>
                </td>
               </tr>
            );
          })}
        </tbody>
       </table>
    </div>
  );
};
import { useParams, useNavigate } from 'react-router-dom';
import { useDisasterRecovery } from '../../../hooks/config';
import { StatusBadge } from '../common/StatusBadge';
import { DRExecuteModal } from './DRExecuteModal';
import { DRDrillModal } from './DRDrillModal';
import { DRProgressMonitor } from './DRProgressMonitor';
import { FiArrowLeft, FiPlay, FiTarget, FiEdit, FiTrash2, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { format } from 'date-fns';

export const DRPlanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { useDRPlan, useDRExecutions } = useDisasterRecovery();
  const [showExecuteModal, setShowExecuteModal] = useState(false);
  const [showDrillModal, setShowDrillModal] = useState(false);
  const { data, isLoading } = useDRPlan(id);
  const { data: executionsData } = useDRExecutions({ dr_plan_id: id, limit: 10 });

  const plan = data?.data;
  const executions = executionsData?.data?.results || [];

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!plan) return <div className="p-8 text-center text-red-500">DR Plan not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/config/disaster-recovery')} className="p-2 hover:bg-gray-100 rounded-lg">
            <FiArrowLeft className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{plan.name}</h1>
          <StatusBadge status={plan.status} size="lg" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowDrillModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <FiTarget /> Run Drill
          </button>
          <button onClick={() => setShowExecuteModal(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            <FiPlay /> Execute Plan
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Plan Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div><label className="text-xs text-gray-500">App</label><div className="font-medium">{plan.app_name}</div></div>
          <div><label className="text-xs text-gray-500">Version</label><div className="font-medium">{plan.version}</div></div>
          <div><label className="text-xs text-gray-500">RTO Target</label><div className="font-medium">{plan.rto_target_minutes} minutes</div></div>
          <div><label className="text-xs text-gray-500">RPO Target</label><div className="font-medium">{plan.rpo_target_minutes} minutes</div></div>
          <div><label className="text-xs text-gray-500">Last Tested</label><div className="font-medium">{plan.last_tested_at ? format(new Date(plan.last_tested_at), 'MMM dd, yyyy') : 'Never'}</div></div>
          <div><label className="text-xs text-gray-500">Test Frequency</label><div className="font-medium">Every {plan.test_frequency_days} days</div></div>
          <div><label className="text-xs text-gray-500">Standby Endpoint</label><div className="font-mono text-xs">{plan.standby_endpoint || 'Not configured'}</div></div>
        </div>

        {plan.recovery_steps && plan.recovery_steps.length > 0 && (
          <div className="mb-6">
            <label className="text-xs text-gray-500">Recovery Steps</label>
            <ol className="mt-2 space-y-1">
              {plan.recovery_steps.map((step, idx) => (
                <li key={idx} className="text-sm text-gray-700 flex items-start gap-2"><span className="text-gray-400">{idx + 1}.</span> {step}</li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {executions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Executions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600">
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">RTO Achieved</th>
                  <th className="px-4 py-2">RPO Achieved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {executions.map((exec) => (
                  <tr key={exec.id}>
                    <td className="px-4 py-2">{format(new Date(exec.triggered_at), 'MMM dd, HH:mm')}</td>
                    <td className="px-4 py-2 capitalize">{exec.execution_type}</td>
                    <td className="px-4 py-2"><StatusBadge status={exec.status} size="sm" /></td>
                    <td className="px-4 py-2">{exec.rto_achieved_minutes ? `${exec.rto_achieved_minutes} min` : '-'}</td>
                    <td className="px-4 py-2">{exec.rpo_achieved_minutes ? `${exec.rpo_achieved_minutes} min` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showExecuteModal && <DRExecuteModal plan={plan} onClose={() => setShowExecuteModal(false)} onSuccess={() => setShowExecuteModal(false)} />}
      {showDrillModal && <DRDrillModal plan={plan} onClose={() => setShowDrillModal(false)} onSuccess={() => setShowDrillModal(false)} />}
    </div>
  );
};
import { useState } from 'react';
import { useDisasterRecovery } from '../../../hooks/config';
import { DRProgressMonitor } from './DRProgressMonitor';
import { FiTarget, FiLoader, FiCheckCircle } from 'react-icons/fi';

export const DRDrillModal = ({ plan, onClose, onSuccess }) => {
  const { runDRDrill } = useDisasterRecovery();
  const [executionId, setExecutionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDrill = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await runDRDrill.mutateAsync(plan.id);
      setExecutionId(result.data?.drill_id || result.data?.execution_id);
    } catch (err) {
      setError(err.message || 'Drill failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (executionId) {
    return <DRProgressMonitor executionId={executionId} onComplete={onSuccess} onClose={onClose} isDrill />;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <FiTarget className="text-blue-600 text-xl" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Run DR Drill</h2>
          </div>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-4">Run a disaster recovery drill for:</p>
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <div className="font-medium">{plan.name}</div>
            <div className="text-sm text-gray-500">{plan.app_name}</div>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-600">
            This is a test drill. No production impact. RTO/RPO metrics will be recorded.
          </div>
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mt-4">{error}</div>}
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={handleDrill} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {isLoading ? <FiLoader className="animate-spin" /> : <FiTarget />}
            Start Drill
          </button>
        </div>
      </div>
    </div>
  );
};
import { useState } from 'react';
import { useDisasterRecovery } from '../../../hooks/config';
import { FiRefreshCw, FiLoader } from 'react-icons/fi';

export const FailbackButton = ({ appName, executionId, onSuccess }) => {
  const { failback } = useDisasterRecovery();
  const [isLoading, setIsLoading] = useState(false);

  const handleFailback = async () => {
    if (!confirm(`Return to primary systems for ${appName}?`)) return;
    setIsLoading(true);
    try {
      await failback.mutateAsync(executionId);
      alert('Failback initiated successfully');
      onSuccess?.();
    } catch (error) {
      alert('Failback failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleFailback}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
    >
      {isLoading ? <FiLoader className="animate-spin" /> : <FiRefreshCw />}
      Return to Primary (Failback)
    </button>
  );
};
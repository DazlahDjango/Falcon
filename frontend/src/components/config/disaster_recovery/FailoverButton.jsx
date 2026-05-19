import { useState } from 'react';
import { useDisasterRecovery } from '../../../hooks/config';
import { FiShield, FiLoader, FiAlertTriangle } from 'react-icons/fi';

export const FailoverButton = ({ appName, executionId, onSuccess }) => {
  const { failover } = useDisasterRecovery();
  const [isLoading, setIsLoading] = useState(false);

  const handleFailover = async () => {
    if (!confirm(`Initiate failover for ${appName}? This will switch to standby systems.`)) return;
    setIsLoading(true);
    try {
      await failover.mutateAsync(executionId);
      alert('Failover initiated successfully');
      onSuccess?.();
    } catch (error) {
      alert('Failover failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleFailover}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
    >
      {isLoading ? <FiLoader className="animate-spin" /> : <FiShield />}
      Initiate Failover
    </button>
  );
};
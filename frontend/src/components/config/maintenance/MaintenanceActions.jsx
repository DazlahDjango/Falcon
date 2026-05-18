import { useState } from 'react';
import { useMaintenance } from '../../../hooks/config';
import { FiPlay, FiStop, FiX, FiRefreshCw } from 'react-icons/fi';

export const MaintenanceActions = ({ window, onActionComplete }) => {
  const { startMaintenance, stopMaintenance, cancelMaintenance } = useMaintenance();
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    if (confirm('Start this maintenance window? Services will be affected.')) {
      setIsLoading(true);
      try {
        await startMaintenance.mutateAsync(window.id);
        onActionComplete?.();
      } catch (error) {
        alert('Failed to start maintenance: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleStop = async () => {
    if (confirm('Stop this maintenance window? Services will resume.')) {
      setIsLoading(true);
      try {
        await stopMaintenance.mutateAsync(window.id);
        onActionComplete?.();
      } catch (error) {
        alert('Failed to stop maintenance: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancel = async () => {
    if (confirm('Cancel this maintenance window?')) {
      setIsLoading(true);
      try {
        await cancelMaintenance.mutateAsync(window.id);
        onActionComplete?.();
      } catch (error) {
        alert('Failed to cancel maintenance: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (window.status === 'scheduled') {
    return (
      <div className="flex gap-2">
        <button onClick={handleStart} disabled={isLoading} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50">
          <FiPlay size={14} /> Start
        </button>
        <button onClick={handleCancel} disabled={isLoading} className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50">
          <FiX size={14} /> Cancel
        </button>
      </div>
    );
  }

  if (window.status === 'in_progress') {
    return (
      <button onClick={handleStop} disabled={isLoading} className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 disabled:opacity-50">
        <FiStop size={14} /> Stop Maintenance
      </button>
    );
  }

  if (window.status === 'completed') {
    return (
      <span className="text-sm text-green-600 flex items-center gap-1">
        <FiRefreshCw size={14} /> Completed
      </span>
    );
  }

  return null;
};
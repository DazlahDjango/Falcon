import React from 'react';
import { useDRProgress } from '../../../hooks/config';
import { FiCheckCircle, FiXCircle, FiLoader, FiTarget, FiClock } from 'react-icons/fi';

export const DRProgressMonitor = ({ executionId, onComplete, onClose, isDrill = false }) => {
  const { progress, isConnected } = useDRProgress(executionId);

  React.useEffect(() => {
    if (progress.status === 'success' && onComplete) {
      setTimeout(onComplete, 2000);
    }
  }, [progress.status, onComplete]);

  const getStatusIcon = () => {
    if (progress.status === 'success') return <FiCheckCircle className="text-green-500 text-3xl" />;
    if (progress.status === 'failed') return <FiXCircle className="text-red-500 text-3xl" />;
    return <FiLoader className="text-blue-500 text-3xl animate-spin" />;
  };

  const getStatusColor = () => {
    if (progress.status === 'success') return 'border-green-500';
    if (progress.status === 'failed') return 'border-red-500';
    return 'border-blue-500';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 border-t-4 ${getStatusColor()}`}>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            {getStatusIcon()}
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{isDrill ? 'DR Drill' : 'DR Execution'} in Progress</h2>
              <p className="text-sm text-gray-500">{progress.status}</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">{Math.round(progress.progressPercent)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress.progressPercent}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Completed: {progress.completedSteps}/{progress.totalSteps} steps</span>
              <span>Connected: {isConnected ? '✓' : '✗'}</span>
            </div>
          </div>

          {progress.currentStep && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <FiLoader className="animate-spin text-blue-500" />
                <span className="text-gray-600">{progress.currentStep}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            {progress.rtoAchievedMinutes && (
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1"><FiClock /> RTO Achieved</div>
                <div className="font-bold text-lg">{Math.round(progress.rtoAchievedMinutes)} min</div>
              </div>
            )}
            {progress.rpoAchievedMinutes && (
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1"><FiTarget /> RPO Achieved</div>
                <div className="font-bold text-lg">{Math.round(progress.rpoAchievedMinutes)} min</div>
              </div>
            )}
          </div>

          {progress.status === 'success' && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm mb-4">
              {isDrill ? 'DR Drill completed successfully!' : 'DR Execution completed successfully!'}
            </div>
          )}

          {progress.status === 'failed' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
              {isDrill ? 'DR Drill failed.' : 'DR Execution failed. Check logs for details.'}
            </div>
          )}

          <div className="flex justify-end">
            <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};
import { useBackupProgress } from '../../../hooks/config';
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';

export const BackupProgressBar = ({ jobId, onComplete }) => {
  const { progress, isConnected, isComplete, isFailed } = useBackupProgress(jobId);

  React.useEffect(() => {
    if (isComplete && onComplete) onComplete(progress);
  }, [isComplete, progress, onComplete]);

  const getStatusIcon = () => {
    if (isComplete) return <FiCheckCircle className="text-green-500 text-xl" />;
    if (isFailed) return <FiXCircle className="text-red-500 text-xl" />;
    return <FiLoader className="text-blue-500 text-xl animate-spin" />;
  };

  const getStatusText = () => {
    if (isComplete) return 'Backup Completed';
    if (isFailed) return 'Backup Failed';
    return `${progress.status} - ${Math.round(progress.progressPercent)}%`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <h4 className="font-medium text-gray-800">Backup Progress</h4>
            <p className="text-sm text-gray-500">{getStatusText()}</p>
          </div>
        </div>
        <span className="text-sm text-gray-400">{progress.completedItems}/{progress.totalItems} items</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all duration-300 ${isFailed ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${progress.progressPercent}%` }} />
      </div>
      {progress.currentItem && <p className="text-xs text-gray-400 mt-2 truncate">Current: {progress.currentItem}</p>}
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        <span className={isConnected ? 'config-ws-connected' : 'config-ws-disconnected'}>
          {isConnected ? '● Live' : '○ Offline'}
        </span>
        {progress.durationSeconds && <span>Elapsed: {Math.floor(progress.durationSeconds / 60)}m {progress.durationSeconds % 60}s</span>}
      </div>
    </div>
  );
};
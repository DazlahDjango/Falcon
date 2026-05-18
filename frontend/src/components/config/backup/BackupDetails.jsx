import { useParams, useNavigate } from 'react-router-dom';
import { useBackup } from '../../../hooks/config';
import { StatusBadge } from '../common/StatusBadge';
import { BackupProgressBar } from './BackupProgressBar';
import { BackupVerificationBadge } from './BackupVerificationBadge';
import { FiArrowLeft, FiDownload, FiRefreshCw, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import { format } from 'date-fns';

export const BackupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { useBackupJob, restoreBackup, verifyBackup } = useBackup();
  const { data, isLoading } = useBackupJob(id);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const backup = data?.data;

  if (isLoading) return <div className="p-8 text-center">Loading backup details...</div>;
  if (!backup) return <div className="p-8 text-center text-red-500">Backup not found</div>;

  const handleRestore = async () => {
    if (confirm('Are you sure you want to restore from this backup?')) {
      setIsRestoring(true);
      try {
        await restoreBackup.mutateAsync({ jobId: id });
        alert('Restore initiated successfully');
      } catch (error) {
        alert('Restore failed: ' + error.message);
      } finally {
        setIsRestoring(false);
      }
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      await verifyBackup.mutateAsync(id);
      alert('Verification completed');
    } catch (error) {
      alert('Verification failed: ' + error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/config/backups')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <FiArrowLeft className="text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Backup Details</h1>
        <StatusBadge status={backup.status} size="lg" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div><label className="text-xs text-gray-500">App</label><div className="font-medium">{backup.app_display_name || backup.app_name}</div></div>
          <div><label className="text-xs text-gray-500">Type</label><div className="font-medium capitalize">{backup.backup_type}</div></div>
          <div><label className="text-xs text-gray-500">Size</label><div className="font-medium">{getSizeDisplay(backup.size_bytes)}</div></div>
          <div><label className="text-xs text-gray-500">Checksum</label><div className="font-mono text-xs truncate">{backup.checksum?.substring(0, 16)}...</div></div>
          <div><label className="text-xs text-gray-500">Started</label><div className="font-medium">{backup.started_at ? format(new Date(backup.started_at), 'MMM dd, yyyy HH:mm:ss') : '-'}</div></div>
          <div><label className="text-xs text-gray-500">Completed</label><div className="font-medium">{backup.completed_at ? format(new Date(backup.completed_at), 'MMM dd, yyyy HH:mm:ss') : '-'}</div></div>
          <div><label className="text-xs text-gray-500">Duration</label><div className="font-medium">{backup.duration_display || '-'}</div></div>
          <div><label className="text-xs text-gray-500">Triggered By</label><div className="font-medium capitalize">{backup.triggered_by_role}</div></div>
        </div>

        {backup.status === 'running' && <BackupProgressBar jobId={id} />}

        {backup.error_message && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{backup.error_message}</div>
        )}

        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
          <button onClick={handleRestore} disabled={isRestoring || backup.status !== 'completed'} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
            <FiDownload /> {isRestoring ? 'Restoring...' : 'Restore'}
          </button>
          <button onClick={handleVerify} disabled={isVerifying} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <FiCheckCircle /> {isVerifying ? 'Verifying...' : 'Verify Integrity'}
          </button>
        </div>
      </div>

      <BackupVerificationBadge backupId={id} />
    </div>
  );
};

const getSizeDisplay = (bytes) => {
  if (!bytes) return 'N/A';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) { size /= 1024; unitIndex++; }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};
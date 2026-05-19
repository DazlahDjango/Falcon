import { useBackup } from '../../../hooks/config';
import { FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';

export const BackupVerificationBadge = ({ backupId }) => {
  const { useBackupArtifacts } = useBackup();
  const { data } = useBackupArtifacts({ backup_job_id: backupId });
  const artifact = data?.data?.results?.[0];

  if (!artifact) return null;

  const getVerificationIcon = () => {
    switch (artifact.status) {
      case 'verified': return <FiCheckCircle className="text-green-500" />;
      case 'corrupt': return <FiXCircle className="text-red-500" />;
      case 'verifying': return <FiClock className="text-yellow-500 animate-spin" />;
      default: return <FiClock className="text-gray-400" />;
    }
  };

  const getVerificationText = () => {
    switch (artifact.status) {
      case 'verified': return `Verified ${artifact.verified_at ? new Date(artifact.verified_at).toLocaleString() : ''}`;
      case 'corrupt': return 'Integrity check failed - backup is corrupt';
      case 'verifying': return 'Verifying integrity...';
      default: return 'Not verified';
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      {getVerificationIcon()}
      <span className={artifact.status === 'corrupt' ? 'text-red-600' : 'text-gray-600'}>
        {getVerificationText()}
      </span>
    </div>
  );
};
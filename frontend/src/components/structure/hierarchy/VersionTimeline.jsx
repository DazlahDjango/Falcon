import React from 'react';
import { Calendar, GitBranch } from 'lucide-react';

const VersionTimeline = ({ versions, currentVersionId, onSelectVersion, className = '' }) => {
  if (!versions || versions.length === 0) {
    return <div className="text-center text-gray-500 py-4">No versions available</div>;
  }
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  const getVersionBadgeClass = (type) => {
    switch (type) {
      case 'auto': return 'version-badge-auto';
      case 'manual': return 'version-badge-manual';
      case 'restructure': return 'version-badge-restructure';
      default: return 'version-badge-auto';
    }
  };

  return (
    <div className={`version-timeline ${className}`}>
      {versions.map((version) => (
        <div
          key={version.id}
          className={`version-node ${version.id === currentVersionId ? 'version-node-current' : ''}`}
          onClick={() => onSelectVersion?.(version)}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <GitBranch size={14} className="text-gray-400" />
              <span className="font-medium">v{version.version_number}</span>
              <span className={`version-badge ${getVersionBadgeClass(version.version_type)}`}>
                {version.version_type}
              </span>
              {version.id === currentVersionId && (
                <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">Current</span>
              )}
            </div>
            <div className="text-sm text-gray-600 mt-1">{version.name}</div>
            {version.description && (
              <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{version.description}</div>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar size={12} />
            <span>{formatDate(version.effective_from)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
export default VersionTimeline;
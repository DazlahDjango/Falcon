import React from 'react';
import { GitBranch, Calendar, Users, Building2, AlertTriangle } from 'lucide-react';

const VersionCompareView = ({ versionA, versionB, differences, className = '' }) => {
  if (!versionA || !versionB) {
    return <div className="text-center text-gray-500 py-8">Select two versions to compare</div>;
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
  const getDiffClass = (item, type) => {
    if (!differences) return '';
    const added = differences.departments_added || [];
    const removed = differences.departments_removed || [];
    const modified = differences.departments_modified || [];

    if (added.includes(item)) return 'diff-added';
    if (removed.includes(item)) return 'diff-removed';
    if (modified.includes(item)) return 'diff-modified';
    return '';
  };

  return (
    <div className={`version-compare-view ${className}`}>
      <div className="compare-panel">
        <div className="compare-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch size={16} className="text-blue-500" />
            <span>Version {versionA.version_number}</span>
          </div>
          <div className="text-xs text-gray-400">{formatDate(versionA.effective_from)}</div>
        </div>
        <div className="compare-content">
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1">Name</div>
            <div className="font-medium">{versionA.name || 'Unnamed'}</div>
          </div>
          {versionA.description && (
            <div className="mb-3">
              <div class="text-xs text-gray-500 mb-1">Description</div>
              <div className="text-sm">{versionA.description}</div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <div className="text-xs text-gray-500 mb-1">Type</div>
              <div className="text-sm capitalize">{versionA.version_type}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Departments</div>
              <div className="text-sm">{versionA.snapshot?.departments?.length || 0}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="compare-panel">
        <div className="compare-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch size={16} className="text-green-500" />
            <span>Version {versionB.version_number}</span>
            {versionB.is_current && (
              <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">Current</span>
            )}
          </div>
          <div className="text-xs text-gray-400">{formatDate(versionB.effective_from)}</div>
        </div>
        <div className="compare-content">
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1">Name</div>
            <div className="font-medium">{versionB.name || 'Unnamed'}</div>
          </div>
          {versionB.description && (
            <div className="mb-3">
              <div className="text-xs text-gray-500 mb-1">Description</div>
              <div className="text-sm">{versionB.description}</div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <div className="text-xs text-gray-500 mb-1">Type</div>
              <div className="text-sm capitalize">{versionB.version_type}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Departments</div>
              <div className="text-sm">{versionB.snapshot?.departments?.length || 0}</div>
            </div>
          </div>
        </div>
      </div>
      {differences && (
        <div className="col-span-2 mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-amber-500" />
            <h4 className="font-medium">Changes Summary</h4>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{differences.departments_added?.length || 0}</div>
              <div className="text-xs text-gray-500">Departments Added</div>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{differences.departments_removed?.length || 0}</div>
              <div className="text-xs text-gray-500">Departments Removed</div>
            </div>
            <div className="p-2 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{differences.departments_modified?.length || 0}</div>
              <div className="text-xs text-gray-500">Departments Modified</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default VersionCompareView;
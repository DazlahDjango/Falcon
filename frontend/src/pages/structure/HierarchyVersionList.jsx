import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { History, GitBranch, Calendar, Eye, RotateCcw, Download, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'; // Added X
import { VersionTimeline, VersionCompareView } from '../../components/structure/hierarchy';
import { ConfirmDeleteModal, RestoreVersionModal } from '../../components/structure/modals';
import { useHierarchyVersions, useHierarchyVersionMutations, useHierarchyHealth } from '../../hooks/structure';
import { 
  fetchHierarchyVersions, 
  fetchCurrentHierarchyVersion, 
  captureHierarchySnapshot,
  restoreHierarchyVersion,
  setHierarchyPage
} from '../../store/structure';
import { 
  selectHierarchyVersions, 
  selectHierarchyVersionsLoading, 
  selectHierarchyVersionPagination,
  selectCurrentHierarchyVersion
} from '../../store/structure';
import { STRUCTURE_ROUTES } from '../../routes/structure.routes';
import { HIERARCHY_VERSION_TYPE_LABELS } from '../../config/constants/structureConstants';

const HierarchyVersionList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const versions = useSelector(selectHierarchyVersions);
  const loading = useSelector(selectHierarchyVersionsLoading);
  const pagination = useSelector(selectHierarchyVersionPagination);
  const currentVersion = useSelector(selectCurrentHierarchyVersion);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareVersionId, setCompareVersionId] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  useEffect(() => {
    dispatch(fetchHierarchyVersions({ page: pagination.page, pageSize: pagination.pageSize }));
    dispatch(fetchCurrentHierarchyVersion());
  }, [dispatch, pagination.page, pagination.pageSize]);
  const handlePageChange = (newPage) => {
    dispatch(setHierarchyPage(newPage));
  };
  const handleCaptureSnapshot = async () => {
    setIsCapturing(true);
    try {
      await dispatch(captureHierarchySnapshot({
        name: `Manual Snapshot ${new Date().toLocaleString()}`,
        version_type: 'manual',
        description: 'Manually captured hierarchy snapshot',
      })).unwrap();
    } finally {
      setIsCapturing(false);
    }
  };
  const handleRestore = async (versionId) => {
    await dispatch(restoreHierarchyVersion(versionId)).unwrap();
    setShowRestoreModal(false);
    setSelectedVersion(null);
  };
  const handleCompare = (versionId) => {
    setCompareVersionId(versionId);
    setShowCompareModal(true);
  };
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hierarchy Versions</h1>
          <p className="text-gray-500 mt-1">Track and manage organizational structure changes</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button
            onClick={handleCaptureSnapshot}
            disabled={isCapturing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            {isCapturing ? 'Capturing...' : 'Capture Snapshot'}
          </button>
        </div>
      </div>
      {currentVersion && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <GitBranch size={20} className="text-green-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-green-800">Current Version</span>
                  <span className="text-sm text-green-600">v{currentVersion.version_number}</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    {HIERARCHY_VERSION_TYPE_LABELS[currentVersion.version_type]}
                  </span>
                </div>
                <p className="text-sm text-green-700 mt-0.5">
                  Captured on {formatDate(currentVersion.effective_from)}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate(STRUCTURE_ROUTES.ORG_CHART)}
              className="text-sm text-green-700 hover:text-green-800 flex items-center gap-1"
            >
              <Eye size={14} /> View Current Structure
            </button>
          </div>
        </div>
      )}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : versions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <History size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No hierarchy versions found</p>
          <button
            onClick={handleCaptureSnapshot}
            className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Capture your first snapshot →
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Version</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Captured At</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {versions.map((version) => (
                  <tr key={version.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-medium">v{version.version_number}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{version.name || 'Unnamed'}</div>
                        {version.description && (
                          <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{version.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        version.version_type === 'auto' ? 'bg-gray-100 text-gray-600' :
                        version.version_type === 'manual' ? 'bg-blue-100 text-blue-700' :
                        version.version_type === 'restructure' ? 'bg-amber-100 text-amber-700' :
                        version.version_type === 'yearly' ? 'bg-green-100 text-green-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {HIERARCHY_VERSION_TYPE_LABELS[version.version_type] || version.version_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar size={14} />
                        <span>{formatDate(version.effective_from)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {version.id === currentVersion?.id ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Current</span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Archived</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedVersion(version);
                            setShowRestoreModal(true);
                          }}
                          className="p-1 text-gray-400 hover:text-amber-600 transition-colors"
                          title="Restore Version"
                          disabled={version.id === currentVersion?.id}
                        >
                          <RotateCcw size={16} />
                        </button>
                        <button
                          onClick={() => handleCompare(version.id)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Compare with Current"
                        >
                          <GitBranch size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
      <RestoreVersionModal
        isOpen={showRestoreModal}
        onClose={() => {
          setShowRestoreModal(false);
          setSelectedVersion(null);
        }}
        version={selectedVersion}
        onRestore={handleRestore}
      />
      {showCompareModal && compareVersionId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <GitBranch size={18} className="text-blue-500" />
                <h3 className="text-lg font-semibold">Compare Versions</h3>
              </div>
              <button
                onClick={() => {
                  setShowCompareModal(false);
                  setCompareVersionId(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
              <VersionCompareView
                versionA={versions.find(v => v.id === compareVersionId)}
                versionB={currentVersion}
              />
            </div>
            <div className="flex justify-end p-4 border-t bg-gray-50">
              <button
                onClick={() => {
                  setShowCompareModal(false);
                  setCompareVersionId(null);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default HierarchyVersionList;
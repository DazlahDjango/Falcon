import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { GitBranch, ArrowLeft, Calendar, Building2, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { VersionCompareView } from '../../components/structure/hierarchy';
import { useHierarchyVersions, useVersionComparison } from '../../hooks/structure';
import { STRUCTURE_ROUTES } from '../../routes/structure.routes';

const HierarchyCompare = () => {
  const { versionA, versionB } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [versionAData, setVersionAData] = useState(null);
  const [versionBData, setVersionBData] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchVersions = async () => {
      setLoading(true);
      try {
        const [vA, vB] = await Promise.all([
          dispatch(fetchHierarchyVersionById(versionA)).unwrap(),
          dispatch(fetchHierarchyVersionById(versionB)).unwrap(),
        ]);
        setVersionAData(vA);
        setVersionBData(vB);
        const compareResult = await dispatch(compareVersions({ versionAId: versionA, versionBId: versionB })).unwrap();
        setComparison(compareResult);
      } catch (error) {
        console.error('Failed to fetch versions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (versionA && versionB) {
      fetchVersions();
    }
  }, [versionA, versionB, dispatch]);
  const handleBack = () => {
    navigate(STRUCTURE_ROUTES.HIERARCHY_VERSIONS);
  };
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }
  if (!versionAData || !versionBData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertTriangle size={48} className="mx-auto text-amber-500 mb-3" />
          <p className="text-gray-500">Failed to load version data</p>
          <button onClick={handleBack} className="mt-3 text-blue-600 hover:text-blue-700">
            Back to Versions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compare Hierarchy Versions</h1>
          <p className="text-gray-500 mt-1">Analyze changes between organizational snapshots</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <GitBranch size={16} />
            <span className="font-medium">Version {versionAData.version_number}</span>
            <span className="text-xs text-gray-400">{versionAData.version_type}</span>
          </div>
          <h3 className="font-semibold text-gray-900">{versionAData.name || 'Unnamed'}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <Calendar size={14} />
            <span>Captured: {formatDate(versionAData.effective_from)}</span>
          </div>
          {versionAData.description && (
            <p className="text-sm text-gray-500 mt-2">{versionAData.description}</p>
          )}
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <GitBranch size={16} />
            <span className="font-medium">Version {versionBData.version_number}</span>
            <span className="text-xs text-gray-400">{versionBData.version_type}</span>
            {versionBData.is_current && (
              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Current</span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900">{versionBData.name || 'Unnamed'}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <Calendar size={14} />
            <span>Captured: {formatDate(versionBData.effective_from)}</span>
          </div>
          {versionBData.description && (
            <p className="text-sm text-gray-500 mt-2">{versionBData.description}</p>
          )}
        </div>
      </div>
      {comparison && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Changes Summary</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {comparison.differences?.departments_added?.length || 0}
              </div>
              <div className="text-sm text-gray-500">Departments Added</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {comparison.differences?.departments_removed?.length || 0}
              </div>
              <div className="text-sm text-gray-500">Departments Removed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">
                {comparison.differences?.departments_modified?.length || 0}
              </div>
              <div className="text-sm text-gray-500">Departments Modified</div>
            </div>
          </div>
        </div>
      )}
      <VersionCompareView
        versionA={versionAData}
        versionB={versionBData}
        differences={comparison?.differences}
      />
    </div>
  );
};
export default HierarchyCompare;
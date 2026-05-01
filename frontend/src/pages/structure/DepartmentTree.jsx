import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { GitBranch, Download, RefreshCw, Maximize2 } from 'lucide-react';
import { OrgTreeVisualization, HierarchyControls } from '../../components/structure/hierarchy';
import { ExportOptionsModal } from '../../components/structure/modals';
import { useHierarchyTree, useOrgChartExport } from '../../hooks/structure';
import { fetchOrgChartTree, exportOrgChart } from '../../store/structure';
import { showToast } from '../../store/ui/slices/uiSlice';
import { STRUCTURE_ROUTES } from '../../routes/structure.routes';

const DepartmentTree = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [includeInactive, setIncludeInactive] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { data: treeData, isLoading, refetch } = useHierarchyTree(includeInactive);
  const handleNodeClick = (node) => {
    if (node && node.id) {
      navigate(STRUCTURE_ROUTES.DEPARTMENT_DETAIL(node.id));
    }
  };
  const handleRefresh = () => {
    refetch();
    dispatch(showToast({ message: 'Tree refreshed', type: 'success' }));
  };
  const handleExport = async ({ format, include_inactive, max_depth }) => {
    setIsExporting(true);
    try {
      const result = await dispatch(exportOrgChart({
        format,
        includeInactive: include_inactive,
        maxDepth: max_depth,
      })).unwrap();
      if (result.data?.data) {
        if (format === 'json') {
          const dataStr = JSON.stringify(result.data.data, null, 2);
          const blob = new Blob([dataStr], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `org-chart-${Date.now()}.json`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          URL.revokeObjectURL(url);
        }
      }
      dispatch(showToast({ message: 'Export completed', type: 'success' }));
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Export failed', type: 'error' }));
    } finally {
      setIsExporting(false);
      setShowExportModal(false);
    }
  };
  const chartData = treeData?.departments?.[0] || null;
  
  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Department Tree</h1>
          <p className="text-gray-500 mt-1">Visualize your organizational hierarchy</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button
            onClick={() => setIncludeInactive(!includeInactive)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              includeInactive
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}
          >
            {includeInactive ? 'Showing Inactive' : 'Hide Inactive'}
          </button>
          <button
            onClick={handleRefresh}
            className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-1"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-1"
          >
            <Download size={14} /> Export
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : !chartData ? (
          <div className="text-center py-12">
            <GitBranch size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No department hierarchy data available</p>
            <button
              onClick={() => navigate(STRUCTURE_ROUTES.DEPARTMENT_CREATE)}
              className="mt-3 text-blue-600 hover:text-blue-700 text-sm"
            >
              Create your first department →
            </button>
          </div>
        ) : (
          <div className="relative">
            <OrgTreeVisualization
              data={chartData}
              onNodeClick={handleNodeClick}
              height={600}
            />
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Healthy</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span>Attention Needed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>Critical</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-gray-300" />
          <span>Inactive</span>
        </div>
      </div>
      <ExportOptionsModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        isExporting={isExporting}
      />
    </div>
  );
};
export default DepartmentTree;
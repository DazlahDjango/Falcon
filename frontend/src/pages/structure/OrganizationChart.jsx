import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { GitBranch, Sun, PieChart, Network, RefreshCw, Download, Maximize2 } from 'lucide-react';
import { 
  OrgTreeVisualization, 
  SunburstChart, 
  TreemapView, 
  ForceDirectedGraph,
  HierarchyControls,
  HierarchyExportOptions 
} from '../../components/structure/hierarchy';
import { ExportOptionsModal } from '../../components/structure/modals';
import { useHierarchyTree, useFullOrgChart, useGraphData, useOrgChartExport } from '../../hooks/structure';
import { showToast } from '../../store/ui/slices/uiSlice';
import { ORG_CHART_TYPES, ORG_CHART_TYPE_LABELS } from '../../config/constants/structureConstants';

const OrganizationChart = () => {
  const dispatch = useDispatch();
  const [chartType, setChartType] = useState(ORG_CHART_TYPES.TREE);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { data: treeData, isLoading, refetch } = useHierarchyTree(includeInactive);
  const { data: fullData } = useFullOrgChart();
  const { nodes, links } = useGraphData(treeData);
  const handleNodeClick = (node) => {
    console.log('Node clicked:', node);
    dispatch(showToast({ message: `Selected: ${node.name}`, type: 'info' }));
  };
  const handleRefresh = () => {
    refetch();
    dispatch(showToast({ message: 'Chart refreshed', type: 'success' }));
  };
  const handleExport = async ({ format, include_inactive, max_depth }) => {
    setIsExporting(true);
    try {
      // Export logic
      dispatch(showToast({ message: 'Export completed', type: 'success' }));
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Export failed', type: 'error' }));
    } finally {
      setIsExporting(false);
      setShowExportModal(false);
    }
  };
  // Prepare chart data
  const chartData = treeData?.departments?.[0] || null;
  const sunburstData = chartData ? [chartData] : [];
  const treemapData = treeData?.departments?.map(dept => ({
    name: dept.name,
    value: dept.stats?.employee_count || 1,
    id: dept.id,
    code: dept.code,
  })) || [];
  const renderChart = () => {
    switch (chartType) {
      case ORG_CHART_TYPES.SUNBURST:
        return (
          <SunburstChart
            data={sunburstData}
            onNodeClick={handleNodeClick}
            height={600}
          />
        );
      case ORG_CHART_TYPES.TREEMAP:
        return (
          <TreemapView
            data={treemapData}
            onNodeClick={handleNodeClick}
            height={600}
          />
        );
      case ORG_CHART_TYPES.FORCE:
        return (
          <ForceDirectedGraph
            nodes={nodes}
            links={links}
            onNodeClick={handleNodeClick}
            height={600}
          />
        );
    default:
        return (
          <OrgTreeVisualization
            data={chartData}
            onNodeClick={handleNodeClick}
            height={600}
          />
        );
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organization Chart</h1>
          <p className="text-gray-500 mt-1">Visualize your complete organizational structure</p>
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
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.values(ORG_CHART_TYPES).map((type) => (
          <button
            key={type}
            onClick={() => setChartType(type)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              chartType === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {type === ORG_CHART_TYPES.TREE && <GitBranch size={14} />}
            {type === ORG_CHART_TYPES.SUNBURST && <Sun size={14} />}
            {type === ORG_CHART_TYPES.TREEMAP && <PieChart size={14} />}
            {type === ORG_CHART_TYPES.FORCE && <Network size={14} />}
            {ORG_CHART_TYPE_LABELS[type]}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : !chartData ? (
          <div className="text-center py-12">
            <GitBranch size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No organization data available</p>
          </div>
        ) : (
          renderChart()
        )}
      </div>
      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
        <p>💡 Tip: Click on any node to view details. Use mouse wheel to zoom, drag to pan.</p>
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
export default OrganizationChart;
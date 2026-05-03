import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { GitBranch, ChevronRight, Home, RefreshCw, Download } from 'lucide-react';
import { TeamHierarchyView } from '../../components/structure/team';
import { OrgTreeVisualization } from '../../components/structure/hierarchy';
import { ExportOptionsModal } from '../../components/structure/modals';
import { useTeamHierarchy, useTeamSubtree } from '../../hooks/structure';
import { STRUCTURE_ROUTES } from '../../routes/structure.routes';

const TeamHierarchy = () => {
  const { departmentId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [includeInactive, setIncludeInactive] = useState(false);
  const [viewMode, setViewMode] = useState('tree'); // 'tree', 'chart'
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { data: hierarchy, isLoading, refetch } = useTeamHierarchy(departmentId, includeInactive);
  const { data: subtree } = useTeamSubtree(departmentId);
  const handleRefresh = () => {
    refetch();
  };
  const handleTeamClick = (teamId) => {
    navigate(STRUCTURE_ROUTES.TEAM_DETAIL(teamId));
  };
  const handleExport = async ({ format, include_inactive, max_depth }) => {
    setIsExporting(true);
    try {
      console.log('Exporting:', { format, include_inactive, max_depth });
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
      setShowExportModal(false);
    }
  };
  const chartData = hierarchy ? {
    name: 'Team Hierarchy',
    children: hierarchy
  } : null;

  return (
    <div className="p-6">
      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button onClick={() => navigate('/app/structure')} className="hover:text-blue-600">
            <Home size={14} />
          </button>
          <ChevronRight size={12} />
          <button onClick={() => navigate(STRUCTURE_ROUTES.TEAMS)} className="hover:text-blue-600">
            Teams
          </button>
          <ChevronRight size={12} />
          <span className="text-gray-900 font-medium">Team Hierarchy</span>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Hierarchy</h1>
          <p className="text-gray-500 mt-1">Visualize team structures and reporting relationships</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('tree')}
              className={`px-3 py-1.5 text-sm ${viewMode === 'tree' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600'}`}
            >
              Tree View
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`px-3 py-1.5 text-sm ${viewMode === 'chart' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600'}`}
            >
              Chart View
            </button>
          </div>
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
      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
        </div>
      ) : !hierarchy || hierarchy.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <GitBranch size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No teams found in this hierarchy</p>
          <button
            onClick={() => navigate(STRUCTURE_ROUTES.TEAM_CREATE, { state: { departmentId } })}
            className="mt-3 text-green-600 hover:text-green-700 text-sm font-medium"
          >
            Create your first team →
          </button>
        </div>
      ) : viewMode === 'tree' ? (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <TeamHierarchyView
            teams={hierarchy}
            onSelectTeam={handleTeamClick}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <OrgTreeVisualization
            data={chartData}
            onNodeClick={(node) => handleTeamClick(node.id)}
            height={600}
          />
        </div>
      )}
      <ExportOptionsModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        isExporting={isExporting}
      />
    </div>
  );
};
export default TeamHierarchy;
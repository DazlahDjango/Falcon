import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiRefreshCw,
  FiZoomIn,
  FiZoomOut,
  FiMaximize,
  FiMinimize,
  FiDownload,
  FiUser,
  FiUsers,
  FiBriefcase,
} from 'react-icons/fi';
import { useOrgChart, useDepartments, useDivisions } from '../../../hooks/structure';
import {
  StructureLoading,
  StructureEmptyState,
  StructureStatusBadge,
} from '../common';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './orgchart.css';

export const OrgChartView = () => {
  const navigate = useNavigate();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [viewMode, setViewMode] = useState('tree'); // tree | hierarchy

  const { tree, isLoading, error, fetchTree, clearError } = useOrgChart({ autoFetch: false });
  const { items: departments, fetchAll: fetchDepartments } = useDepartments({ autoFetch: false });
  const { items: divisions, fetchAll: fetchDivisions } = useDivisions({ autoFetch: false });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    await Promise.all([
      fetchTree(),
      fetchDepartments({ page_size: 1000 }),
      fetchDivisions({ page_size: 1000 }),
    ]);
  }, [fetchTree, fetchDepartments, fetchDivisions]);

  const handleRefresh = useCallback(() => {
    loadData();
  }, [loadData]);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoomLevel(1);
  }, []);

  const handleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
  }, []);

  const getNodeIcon = (type) => {
    switch (type) {
      case 'division': return <FiBriefcase size={16} />;
      case 'department': return <FiUsers size={16} />;
      default: return <FiUser size={16} />;
    }
  };

  const getNodeColor = (type) => {
    switch (type) {
      case 'division': return '#3b82f6';
      case 'department': return '#10b981';
      default: return '#8b5cf6';
    }
  };

  const renderNode = (node, level = 0) => {
    if (!node) return null;

    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedNode?.id === node.id;

    return (
      <div key={node.id} className="org-node-wrapper" style={{ marginLeft: level > 0 ? '20px' : '0' }}>
        <div
          className={`org-node ${isSelected ? 'selected' : ''}`}
          onClick={() => handleNodeClick(node)}
          style={{ borderColor: getNodeColor(node.level) }}
        >
          <div className="org-node-icon" style={{ background: getNodeColor(node.level) }}>
            {getNodeIcon(node.level)}
          </div>
          <div className="org-node-content">
            <div className="org-node-code">{node.code || node.job_code}</div>
            <div className="org-node-name">{node.name || node.title}</div>
            {node.is_active === false && (
              <span className="org-node-status inactive">Inactive</span>
            )}
            {node.is_headquarters && (
              <span className="org-node-status hq">HQ</span>
            )}
          </div>
          <div className="org-node-stats">
            {node.child_count !== undefined && (
              <span className="stat-badge">{node.child_count} children</span>
            )}
            {node.current_incumbents_count !== undefined && (
              <span className="stat-badge">{node.current_incumbents_count} incumbents</span>
            )}
          </div>
        </div>
        {hasChildren && (
          <div className="org-children">
            {node.children.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="orgchart-loading">
        <StructureLoading text="Loading organizational chart..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="orgchart-error">
        <p>{error}</p>
        <button onClick={clearError} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  const chartData = tree?.departments || tree?.divisions || [];

  return (
    <div className={`orgchart-container ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="orgchart-header">
        <div className="header-left">
          <h1>Organizational Chart</h1>
          <span className="header-count">{chartData.length} root nodes</span>
        </div>
        <div className="header-right">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'tree' ? 'active' : ''}`}
              onClick={() => setViewMode('tree')}
            >
              Tree View
            </button>
            <button
              className={`toggle-btn ${viewMode === 'hierarchy' ? 'active' : ''}`}
              onClick={() => setViewMode('hierarchy')}
            >
              Hierarchy
            </button>
          </div>
          <button onClick={handleRefresh} className="btn btn-secondary" title="Refresh">
            <FiRefreshCw size={16} />
          </button>
          <button onClick={handleZoomOut} className="btn btn-secondary" title="Zoom Out">
            <FiZoomOut size={16} />
          </button>
          <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
          <button onClick={handleZoomIn} className="btn btn-secondary" title="Zoom In">
            <FiZoomIn size={16} />
          </button>
          <button onClick={handleResetZoom} className="btn btn-secondary" title="Reset Zoom">
            <FiMaximize size={16} />
          </button>
          <button onClick={handleFullscreen} className="btn btn-secondary" title="Fullscreen">
            {isFullscreen ? <FiMinimize size={16} /> : <FiMaximize size={16} />}
          </button>
        </div>
      </div>

      <div className="orgchart-body">
        {chartData.length > 0 ? (
          <div
            className="orgchart-tree"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
          >
            {chartData.map((node) => renderNode(node))}
          </div>
        ) : (
          <StructureEmptyState
            title="No Organizational Data"
            description="No departments or divisions found to display in the organizational chart."
            actionLabel="Create Department"
            onAction={() => navigate(STRUCTURE_ROUTES.DEPARTMENT_CREATE)}
          />
        )}
      </div>

      {selectedNode && (
        <div className="orgchart-sidebar">
          <div className="sidebar-header">
            <h3>{selectedNode.name || selectedNode.title}</h3>
            <button onClick={() => setSelectedNode(null)} className="close-btn">
              ×
            </button>
          </div>
          <div className="sidebar-body">
            <div className="sidebar-field">
              <span className="field-label">Code</span>
              <span className="field-value">{selectedNode.code || selectedNode.job_code || 'N/A'}</span>
            </div>
            <div className="sidebar-field">
              <span className="field-label">Type</span>
              <span className="field-value">{selectedNode.level || 'Department'}</span>
            </div>
            <div className="sidebar-field">
              <span className="field-label">Status</span>
              <StructureStatusBadge
                status={selectedNode.is_active !== false ? 'active' : 'inactive'}
                size="sm"
              />
            </div>
            {selectedNode.headcount_limit && (
              <div className="sidebar-field">
                <span className="field-label">Headcount Limit</span>
                <span className="field-value">{selectedNode.headcount_limit}</span>
              </div>
            )}
            {selectedNode.current_incumbents_count !== undefined && (
              <div className="sidebar-field">
                <span className="field-label">Incumbents</span>
                <span className="field-value">{selectedNode.current_incumbents_count}</span>
              </div>
            )}
            <div className="sidebar-field">
              <span className="field-label">Children</span>
              <span className="field-value">{selectedNode.children?.length || 0}</span>
            </div>
            <button
              onClick={() => navigate(`${STRUCTURE_ROUTES.DEPARTMENT_DETAIL(selectedNode.id)}`)}
              className="btn btn-primary sidebar-btn"
            >
              View Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgChartView;

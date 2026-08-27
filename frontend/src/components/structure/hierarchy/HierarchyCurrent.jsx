import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiRefreshCw, FiArrowLeft, FiGitBranch } from 'react-icons/fi';
import { useHierarchy } from '../../../hooks/structure';
import { StructureLoading, StructureEmptyState } from '../common';
import OrgTreeVisualization from './OrgTreeVisualization';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './hierarchy.css';

export const HierarchyCurrent = () => {
  const navigate = useNavigate();
  const { currentVersion, isLoading, error, fetchCurrent, clearError } = useHierarchy({ autoFetch: false });
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    fetchCurrent();
  }, [fetchCurrent]);

  const handleRefresh = useCallback(() => {
    fetchCurrent();
  }, [fetchCurrent]);

  const handleBack = useCallback(() => {
    navigate(STRUCTURE_ROUTES.HIERARCHY);
  }, [navigate]);

  const transformNode = useCallback((node) => {
    const childrenList = [
      ...(node.divisions || []),
      ...(node.departments || []),
      ...(node.sections || []),
      ...(node.units || []),
      ...(node.children || [])
    ];
    return {
      id: node.id,
      name: node.name || node.title || '',
      code: node.code || '',
      stats: node.stats || {},
      children: childrenList.map(transformNode),
    };
  }, []);

  const transformSnapshotToChartData = useCallback((snapshot) => {
    if (!snapshot) return null;
    
    const rootNodes = [
      ...(snapshot.divisions || []),
      ...(snapshot.departments || []),
      ...(snapshot.sections || []),
      ...(snapshot.units || [])
    ];
    
    if (rootNodes.length === 0) return null;
    
    if (rootNodes.length === 1) {
      return transformNode(rootNodes[0]);
    }
    
    return {
      name: 'Organization',
      code: 'ROOT',
      children: rootNodes.map(transformNode),
    };
  }, [transformNode]);

  const handleViewDetails = useCallback((node) => {
    const level = node.level || 'department';
    if (level === 'division') {
      navigate(STRUCTURE_ROUTES.DIVISION_DETAIL(node.id));
    } else if (level === 'department') {
      navigate(STRUCTURE_ROUTES.DEPARTMENT_DETAIL(node.id));
    } else if (level === 'section') {
      navigate(STRUCTURE_ROUTES.SECTION_DETAIL(node.id));
    } else if (level === 'unit') {
      navigate(STRUCTURE_ROUTES.UNIT_DETAIL(node.id));
    }
  }, [navigate]);

  const chartData = transformSnapshotToChartData(currentVersion?.snapshot);

  if (isLoading) {
    return (
      <div className="hierarchy-detail-loading">
        <StructureLoading text="Loading current hierarchy..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="hierarchy-detail-error">
        <p>{typeof error === 'object' ? (error?.message || error?.detail || JSON.stringify(error)) : String(error || '')}</p>
        <button onClick={clearError} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (!currentVersion || !currentVersion.snapshot) {
    return (
      <StructureEmptyState
        title="No Current Hierarchy"
        description="Could not load the live organization structure."
        actionLabel="Refresh"
        onAction={handleRefresh}
      />
    );
  }

  if (!chartData) {
    return (
      <StructureEmptyState
        title="No Hierarchy Structure Found"
        description="No Divisions, Departments, Sections, or Units are active or present."
        actionLabel="Refresh"
        onAction={handleRefresh}
      />
    );
  }

  return (
    <div className="hierarchy-detail-container">
      <div className="hierarchy-detail-header">
        <div className="header-left">
          <button onClick={handleBack} className="back-btn">
            <FiArrowLeft size={18} />
            Back
          </button>
          <h1>Current Live Hierarchy</h1>
          <span className="version-type-badge type-auto">Live</span>
        </div>
        <div className="header-right">
          <button onClick={handleRefresh} className="btn btn-secondary" title="Refresh">
            <FiRefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      <div className="hierarchy-detail-body" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        <div className="detail-section" style={{ flex: 1, minHeight: '600px' }}>
          <h3><FiGitBranch className="inline-block mr-2" /> Live Organization Chart</h3>
          <OrgTreeVisualization 
            data={chartData} 
            height={600} 
            onNodeClick={(node) => setSelectedNode(node)}
          />
        </div>

        {selectedNode && (
          <div className="hierarchy-info-drawer" style={{
            width: '320px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '20px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            position: 'sticky',
            top: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                Node Details
              </h3>
              <button 
                onClick={() => setSelectedNode(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8', hover: { color: '#64748b' } }}
              >
                &times;
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <span style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Level</span>
                <span style={{ 
                  display: 'inline-block', 
                  padding: '2px 8px', 
                  borderRadius: '4px', 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  textTransform: 'capitalize',
                  backgroundColor: 
                    selectedNode.level === 'division' ? '#eff6ff' :
                    selectedNode.level === 'department' ? '#ecfdf5' :
                    selectedNode.level === 'section' ? '#f5f3ff' : '#fffbeb',
                  color: 
                    selectedNode.level === 'division' ? '#1d4ed8' :
                    selectedNode.level === 'department' ? '#047857' :
                    selectedNode.level === 'section' ? '#6d28d9' : '#b45309'
                }}>
                  {selectedNode.level || 'Department'}
                </span>
              </div>
              
              <div>
                <span style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Code</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{selectedNode.code || 'N/A'}</span>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Name</span>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>{selectedNode.name || 'N/A'}</span>
              </div>

              {selectedNode.id && selectedNode.id !== 'ROOT' && (
                <button
                  onClick={() => handleViewDetails(selectedNode)}
                  className="btn btn-primary"
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '10px', fontSize: '13px', padding: '8px 12px' }}
                >
                  View Details
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HierarchyCurrent;

import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { DashboardCard } from '../common/DashboardCard';
import { TrafficLight } from '../common/TrafficLight';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';

export const OrgTreeWidget = ({ 
  data, 
  loading = false, 
  error = null,
  title = 'Organization Structure',
  onRefresh,
  onUserClick,
  maxDepth = 3,
  defaultExpandLevel = 1
}) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const initializeExpanded = (node, level = 0) => {
    if (level < defaultExpandLevel) {
      expandedNodes.add(node.id);
      if (node.children) {
        node.children.forEach(child => initializeExpanded(child, level + 1));
      }
    }
  };

  React.useEffect(() => {
    if (data && !loading) {
      const newExpanded = new Set();
      initializeExpanded(data, 0);
      setExpandedNodes(newExpanded);
    }
  }, [data, loading]);

  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const filterTree = (node, searchTerm) => {
    if (!searchTerm) return true;
    
    const nameMatch = node.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     node.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     node.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (nameMatch) return true;
    
    if (node.children) {
      return node.children.some(child => filterTree(child, searchTerm));
    }
    
    return false;
  };

  const renderTreeNode = (node, level = 0, isLast = false, isVisible = true) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const shouldShow = filterTree(node, searchTerm);
    
    if (!shouldShow && !isVisible) return null;

    return (
      <div key={node.id} style={{ marginLeft: level * 24, position: 'relative' }}>
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            margin: '4px 0',
            borderRadius: '8px',
            background: level === 0 ? '#f9fafb' : 'transparent',
            cursor: onUserClick ? 'pointer' : 'default',
            transition: 'background 0.2s'
          }}
          onClick={() => onUserClick?.(node.id)}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
          onMouseLeave={(e) => e.currentTarget.style.background = level === 0 ? '#f9fafb' : 'transparent'}
        >
          <div style={{ minWidth: '24px' }}>
            {hasChildren && (
              <button
                onClick={(e) => { e.stopPropagation(); toggleNode(node.id); }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '4px',
                  width: '24px',
                  textAlign: 'center'
                }}
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            )}
          </div>
          
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: node.traffic_light === 'green' ? '#d1fae5' : 
                       node.traffic_light === 'yellow' ? '#fed7aa' : '#fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: node.traffic_light === 'green' ? '#065f46' :
                   node.traffic_light === 'yellow' ? '#92400e' : '#991b1b'
          }}>
            {node.first_name?.[0] || node.email?.[0]?.toUpperCase() || 'U'}
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500 }}>
              {node.first_name} {node.last_name}
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>
              {node.title || node.role || 'Staff'} • {node.department || 'No Department'}
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {node.aggregated_score !== undefined && (
              <div style={{
                fontSize: '13px',
                fontWeight: 600,
                color: node.traffic_light === 'green' ? '#10b981' :
                       node.traffic_light === 'yellow' ? '#f59e0b' : '#ef4444'
              }}>
                {Math.round(node.aggregated_score)}%
              </div>
            )}
            <TrafficLight status={node.traffic_light} size="small" />
            {node.direct_report_count > 0 && (
              <div style={{
                fontSize: '11px',
                color: '#6b7280',
                background: '#f3f4f6',
                padding: '2px 6px',
                borderRadius: '12px'
              }}>
                {node.direct_report_count} reports
              </div>
            )}
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div style={{ marginLeft: '24px', borderLeft: '1px dashed #e5e7eb' }}>
            {node.children.map((child, idx) => 
              renderTreeNode(child, level + 1, idx === node.children.length - 1, shouldShow)
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <LoadingSkeleton type="list" />;
  }

  if (error) {
    return (
      <DashboardCard title={title} error={error} onRefresh={onRefresh}>
        <EmptyState title="Failed to load organization tree" message={error} />
      </DashboardCard>
    );
  }

  if (!data) {
    return (
      <DashboardCard title={title} onRefresh={onRefresh}>
        <EmptyState title="No Organization Data" message="No organization structure available." />
      </DashboardCard>
    );
  }

  const filteredData = searchTerm ? { ...data, children: data.children?.filter(child => filterTree(child, searchTerm)) } : data;

  return (
    <DashboardCard 
      title={title} 
      onRefresh={onRefresh}
      actions={
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '6px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '13px',
            width: '200px'
          }}
        />
      }
    >
      <div style={{ maxHeight: '500px', overflowY: 'auto', padding: '8px 0' }}>
        {renderTreeNode(filteredData)}
      </div>
      {searchTerm && filteredData.children?.length === 0 && (
        <EmptyState title="No matching users" message={`No users found matching "${searchTerm}"`} />
      )}
    </DashboardCard>
  );
};

OrgTreeWidget.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    email: PropTypes.string,
    title: PropTypes.string,
    role: PropTypes.string,
    department: PropTypes.string,
    traffic_light: PropTypes.string,
    aggregated_score: PropTypes.number,
    direct_report_count: PropTypes.number,
    children: PropTypes.array
  }),
  loading: PropTypes.bool,
  error: PropTypes.string,
  title: PropTypes.string,
  onRefresh: PropTypes.func,
  onUserClick: PropTypes.func,
  maxDepth: PropTypes.number,
  defaultExpandLevel: PropTypes.number
};
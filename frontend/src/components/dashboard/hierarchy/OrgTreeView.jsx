import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FiChevronRight, FiChevronDown, FiUser, FiUsers, FiSearch } from 'react-icons/fi';
import { DashboardCard } from '../common/DashboardCard';
import { TrafficLight } from '../common/TrafficLight';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';

export const OrgTreeView = ({ 
  data, 
  loading = false, 
  error = null,
  title = 'Organization Tree',
  onRefresh,
  onUserClick,
  defaultExpandLevel = 1,
  showSearch = true
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

  const toggleNode = (nodeId, e) => {
    e.stopPropagation();
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

  const expandAll = () => {
    const allIds = new Set();
    const collectIds = (node) => {
      allIds.add(node.id);
      if (node.children) {
        node.children.forEach(child => collectIds(child));
      }
    };
    if (data) collectIds(data);
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const filterTree = (node, term) => {
    if (!term) return true;
    
    const nameMatch = node.first_name?.toLowerCase().includes(term.toLowerCase()) ||
                     node.last_name?.toLowerCase().includes(term.toLowerCase()) ||
                     node.email?.toLowerCase().includes(term.toLowerCase()) ||
                     node.title?.toLowerCase().includes(term.toLowerCase());
    
    if (nameMatch) return true;
    
    if (node.children) {
      return node.children.some(child => filterTree(child, term));
    }
    
    return false;
  };

  const renderTreeNode = (node, level = 0, isLast = false) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const matchesSearch = filterTree(node, searchTerm);
    
    if (!matchesSearch && !searchTerm) return null;

    return (
      <div key={node.id} style={{ position: 'relative' }}>
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 12px',
            marginLeft: level * 20,
            borderRadius: '8px',
            background: level === 0 ? '#f8fafc' : 'transparent',
            cursor: onUserClick ? 'pointer' : 'default',
            transition: 'all 0.2s',
            borderLeft: level > 0 ? '2px solid #e2e8f0' : 'none'
          }}
          onClick={() => onUserClick?.(node.id)}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
          onMouseLeave={(e) => e.currentTarget.style.background = level === 0 ? '#f8fafc' : 'transparent'}
        >
          <div style={{ minWidth: '28px' }}>
            {hasChildren && (
              <button
                onClick={(e) => toggleNode(node.id, e)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#64748b'
                }}
              >
                {isExpanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
              </button>
            )}
          </div>
          
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: node.traffic_light === 'green' ? '#dcfce7' : 
                       node.traffic_light === 'yellow' ? '#fef3c7' : '#fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 500,
            color: node.traffic_light === 'green' ? '#166534' :
                   node.traffic_light === 'yellow' ? '#92400e' : '#991b1b'
          }}>
            {node.avatar ? (
              <img src={node.avatar} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
            ) : (
              <FiUser size={18} />
            )}
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {node.first_name} {node.last_name}
              {node.is_manager && (
                <span style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  background: '#e0e7ff',
                  color: '#3730a3',
                  borderRadius: '12px'
                }}>
                  Manager
                </span>
              )}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              {node.title || node.role || 'Staff'} • {node.department || 'No Department'}
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {node.aggregated_score !== undefined && (
              <div style={{
                fontSize: '14px',
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
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                color: '#64748b',
                background: '#f1f5f9',
                padding: '2px 8px',
                borderRadius: '20px'
              }}>
                <FiUsers size={12} />
                <span>{node.direct_report_count}</span>
              </div>
            )}
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {node.children.map((child, idx) => renderTreeNode(child, level + 1, idx === node.children.length - 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <LoadingSkeleton type="list" count={6} />;
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
        <div style={{ display: 'flex', gap: '8px' }}>
          {showSearch && (
            <div style={{ position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '14px' }} />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '6px 12px 6px 32px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '13px',
                  width: '200px'
                }}
              />
            </div>
          )}
          <button
            onClick={expandAll}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: 'white',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: 'white',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Collapse All
          </button>
        </div>
      }
    >
      <div style={{ maxHeight: '600px', overflowY: 'auto', padding: '8px 0' }}>
        {renderTreeNode(filteredData)}
      </div>
      {searchTerm && filteredData.children?.length === 0 && (
        <EmptyState title="No matching users" message={`No users found matching "${searchTerm}"`} />
      )}
    </DashboardCard>
  );
};

OrgTreeView.propTypes = {
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
    is_manager: PropTypes.bool,
    avatar: PropTypes.string,
    children: PropTypes.array
  }),
  loading: PropTypes.bool,
  error: PropTypes.string,
  title: PropTypes.string,
  onRefresh: PropTypes.func,
  onUserClick: PropTypes.func,
  defaultExpandLevel: PropTypes.number,
  showSearch: PropTypes.bool
};
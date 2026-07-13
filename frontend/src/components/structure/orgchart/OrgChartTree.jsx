import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiRefreshCw,
  FiChevronRight,
  FiChevronDown,
  FiSearch,
  FiUsers,
  FiBriefcase,
  FiFolder,
  FiFolderPlus,
} from 'react-icons/fi';
import { useOrgChart, useDepartments, useDivisions } from '../../../hooks/structure';
import {
  StructureLoading,
  StructureEmptyState,
  StructureSearchBar,
  StructureStatusBadge,
} from '../common';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './orgchart.css';

export const OrgChartTree = () => {
  const navigate = useNavigate();
  const [expandedNodes, setExpandedNodes] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTree, setFilteredTree] = useState(null);
  const [treeData, setTreeData] = useState([]);

  const { tree, isLoading, error, fetchTree, clearError } = useOrgChart({ autoFetch: false });
  const { items: allDepartments, fetchAll: fetchDepartments } = useDepartments({ autoFetch: false });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    await Promise.all([
      fetchTree(),
      fetchDepartments({ page_size: 1000 }),
    ]);
  }, [fetchTree, fetchDepartments]);

  useEffect(() => {
    if (tree) {
      setTreeData([
        ...(tree.divisions || []),
        ...(tree.departments || []),
        ...(tree.sections || []),
        ...(tree.units || [])
      ]);
    }
  }, [tree]);

  useEffect(() => {
    if (searchTerm && allDepartments.length > 0) {
      const filtered = allDepartments.filter(
        (dept) =>
          dept.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dept.code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const filteredIds = new Set(filtered.map((d) => d.id));
      const expanded = {};
      filtered.forEach((dept) => {
        let current = dept;
        while (current.parent_id) {
          expanded[current.parent_id] = true;
          current = allDepartments.find((d) => d.id === current.parent_id);
          if (!current) break;
        }
      });
      setExpandedNodes(expanded);
      setFilteredTree(filteredIds);
    } else {
      setFilteredTree(null);
    }
  }, [searchTerm, allDepartments]);

  const toggleNode = useCallback((nodeId) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  }, []);

  const expandAll = useCallback(() => {
    const allExpanded = {};
    const expandRecursive = (nodes) => {
      nodes?.forEach((node) => {
        if (node.children && node.children.length > 0) {
          allExpanded[node.id] = true;
          expandRecursive(node.children);
        }
      });
    };
    expandRecursive(treeData);
    setExpandedNodes(allExpanded);
  }, [treeData]);

  const collapseAll = useCallback(() => {
    setExpandedNodes({});
  }, []);

  const handleRefresh = useCallback(() => {
    loadData();
  }, [loadData]);

  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const handleNodeClick = useCallback((node) => {
    if (node.level === 'division') {
      navigate(STRUCTURE_ROUTES.DIVISION_DETAIL(node.id));
    } else {
      navigate(STRUCTURE_ROUTES.DEPARTMENT_DETAIL(node.id));
    }
  }, [navigate]);

  const isNodeVisible = useCallback((nodeId) => {
    if (!filteredTree) return true;
    return filteredTree.has(nodeId);
  }, [filteredTree]);

  const getNodeIcon = (node) => {
    if (node.level === 'division') return <FiBriefcase size={16} />;
    if (node.level === 'department') return <FiFolder size={16} />;
    return <FiFolderPlus size={16} />;
  };

  const getNodeColor = (node) => {
    if (node.level === 'division') return '#3b82f6';
    if (node.level === 'department') return '#10b981';
    return '#8b5cf6';
  };

  const renderTree = (nodes, level = 0) => {
    if (!nodes || nodes.length === 0) return null;

    return (
      <ul className="org-tree-list">
        {nodes.map((node) => {
          const isVisible = isNodeVisible(node.id);
          const hasChildren = node.children && node.children.length > 0;
          const isExpanded = expandedNodes[node.id];
          const isHighlighted = searchTerm && isVisible;

          if (!isVisible) return null;

          return (
            <li key={node.id} className="org-tree-item" style={{ paddingLeft: `${level * 20}px` }}>
              <div
                className={`org-tree-node ${isHighlighted ? 'highlighted' : ''}`}
                onClick={() => handleNodeClick(node)}
                style={{ borderLeftColor: getNodeColor(node) }}
              >
                <div className="tree-node-left">
                  {hasChildren ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleNode(node.id);
                      }}
                      className="tree-toggle-btn"
                    >
                      {isExpanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
                    </button>
                  ) : (
                    <span className="tree-toggle-placeholder" />
                  )}
                  <span className="tree-node-icon" style={{ color: getNodeColor(node) }}>
                    {getNodeIcon(node)}
                  </span>
                  <span className="tree-node-code">{node.code}</span>
                  <span className="tree-node-name">{node.name || node.title}</span>
                  {node.is_active === false && (
                    <span className="tree-node-badge inactive">Inactive</span>
                  )}
                  {node.is_headquarters && (
                    <span className="tree-node-badge hq">HQ</span>
                  )}
                  {node.is_single_incumbent && (
                    <span className="tree-node-badge single">Single</span>
                  )}
                </div>
                <div className="tree-node-right">
                  <span className="tree-node-stats">
                    {node.children?.length || 0} children
                  </span>
                  {node.current_incumbents_count !== undefined && (
                    <span className="tree-node-stats">
                      <FiUsers size={12} />
                      {node.current_incumbents_count}
                    </span>
                  )}
                </div>
              </div>
              {hasChildren && isExpanded && (
                <div className="org-tree-children">
                  {renderTree(node.children, level + 1)}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  if (isLoading) {
    return (
      <div className="orgchart-tree-loading">
        <StructureLoading text="Loading organizational tree..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="orgchart-tree-error">
        <p>{error}</p>
        <button onClick={clearError} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="orgchart-tree-container">
      <div className="orgchart-tree-header">
        <div className="header-left">
          <h1>Organizational Tree</h1>
          <span className="header-count">{treeData.length} root nodes</span>
        </div>
        <div className="header-right">
          <button onClick={expandAll} className="btn btn-secondary">
            Expand All
          </button>
          <button onClick={collapseAll} className="btn btn-secondary">
            Collapse All
          </button>
          <button onClick={handleRefresh} className="btn btn-secondary" title="Refresh">
            <FiRefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="orgchart-tree-toolbar">
        <StructureSearchBar
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search departments in tree..."
          debounce={300}
        />
        <div className="tree-legend">
          <span className="legend-item">
            <FiBriefcase size={14} />
            Division
          </span>
          <span className="legend-item">
            <FiFolder size={14} />
            Department
          </span>
          <span className="legend-item">
            <FiFolderPlus size={14} className="has-children" />
            Has Children
          </span>
        </div>
      </div>

      <div className="orgchart-tree-body">
        {treeData.length > 0 ? (
          renderTree(treeData)
        ) : (
          <StructureEmptyState
            title="No Organizational Data"
            description="No departments or divisions found to display in the organizational tree."
            actionLabel="Create Department"
            onAction={() => navigate(STRUCTURE_ROUTES.DEPARTMENT_CREATE)}
          />
        )}
      </div>
    </div>
  );
};

export default OrgChartTree;

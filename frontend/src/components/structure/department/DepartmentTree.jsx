import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiChevronRight,
  FiChevronDown,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiFolder,
  FiFolderPlus,
} from 'react-icons/fi';
import { useDepartmentTree, useDepartments } from '../../../hooks/structure';
import { StructureLoading, StructureEmptyState, StructureSearchBar } from '../common';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './department.css';

export const DepartmentTree = () => {
  const navigate = useNavigate();
  const [expandedNodes, setExpandedNodes] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTree, setFilteredTree] = useState(null);

  const { tree, isLoading, error, fetchFullTree, clearError } = useDepartmentTree({ autoFetch: false });
  const { items: allDepartments, fetchAll } = useDepartments({ autoFetch: false });

  useEffect(() => {
    fetchFullTree();
    fetchAll({ page_size: 1000 });
  }, [fetchFullTree, fetchAll]);

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
    expandRecursive(tree?.departments || []);
    setExpandedNodes(allExpanded);
  }, [tree]);

  const collapseAll = useCallback(() => {
    setExpandedNodes({});
  }, []);

  const handleRefresh = useCallback(() => {
    fetchFullTree();
  }, [fetchFullTree]);

  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const handleCreate = useCallback(() => {
    navigate(STRUCTURE_ROUTES.DEPARTMENT_CREATE);
  }, [navigate]);

  const handleNodeClick = useCallback((node) => {
    navigate(STRUCTURE_ROUTES.DEPARTMENT_DETAIL(node.id));
  }, [navigate]);

  const isNodeVisible = useCallback((nodeId) => {
    if (!filteredTree) return true;
    return filteredTree.has(nodeId);
  }, [filteredTree]);

  const renderTree = (nodes, level = 0) => {
    if (!nodes || nodes.length === 0) return null;

    return (
      <ul className="tree-list">
        {nodes.map((node) => {
          const isVisible = isNodeVisible(node.id);
          const hasChildren = node.children && node.children.length > 0;
          const isExpanded = expandedNodes[node.id];
          const isHighlighted = searchTerm && isVisible;

          if (!isVisible) return null;

          return (
            <li key={node.id} className="tree-item" style={{ paddingLeft: `${level * 20}px` }}>
              <div
                className={`tree-node ${isHighlighted ? 'highlighted' : ''}`}
                onClick={() => handleNodeClick(node)}
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
                  <FiFolder className="folder-icon" size={16} />
                  <span className="tree-node-code">{node.code}</span>
                  <span className="tree-node-name">{node.name}</span>
                  {node.is_active === false && (
                    <span className="tree-node-badge inactive">Inactive</span>
                  )}
                  {node.sensitivity_level && node.sensitivity_level !== 'public' && (
                    <span className={`tree-node-badge sensitivity-${node.sensitivity_level}`}>
                      {node.sensitivity_level}
                    </span>
                  )}
                </div>
                <div className="tree-node-right">
                  <span className="tree-node-stats">
                    {node.children?.length || 0} children
                  </span>
                </div>
              </div>
              {hasChildren && isExpanded && (
                <div className="tree-children">
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
      <div className="department-tree-loading">
        <StructureLoading text="Loading department tree..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="department-tree-error">
        <p>{error}</p>
        <button onClick={clearError} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (!tree || !tree.departments || tree.departments.length === 0) {
    return (
      <StructureEmptyState
        title="No Departments Found"
        description="Create your first department to start building your organizational tree."
        actionLabel="Create Department"
        onAction={handleCreate}
      />
    );
  }

  return (
    <div className="department-tree-container">
      <div className="department-tree-header">
        <div className="header-left">
          <h1>Department Tree</h1>
          <span className="header-count">
            {tree.departments?.length || 0} root departments
          </span>
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
          <button onClick={handleCreate} className="btn btn-primary">
            <FiPlus size={16} />
            New Department
          </button>
        </div>
      </div>

      <div className="department-tree-toolbar">
        <StructureSearchBar
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search departments in tree..."
          debounce={300}
        />
        <div className="tree-legend">
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

      <div className="department-tree-body">
        {renderTree(tree.departments)}
      </div>
    </div>
  );
};

export default DepartmentTree;
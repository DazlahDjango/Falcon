import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Building2 } from 'lucide-react';

const DepartmentTreeView = ({ departments, onSelectDepartment, defaultExpanded = false, className = '' }) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };
  const renderNode = (node) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    return (
      <div key={node.id} className="ml-4">
        <div
          className="flex items-center gap-1 py-1 px-2 hover:bg-gray-50 rounded cursor-pointer"
          onClick={() => onSelectDepartment?.(node)}
        >
          {hasChildren && (
            <button
              onClick={(e) => { e.stopPropagation(); toggleNode(node.id); }}
              className="p-0.5 hover:bg-gray-200 rounded"
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
          {!hasChildren && <div className="w-4" />}
          <Building2 size={14} className="text-blue-500" />
          <span className="text-sm font-medium">{node.name}</span>
          <span className="text-xs text-gray-400 ml-2">({node.code})</span>
          {node.employee_count > 0 && (
            <span className="text-xs text-gray-500 ml-auto">{node.employee_count} employees</span>
          )}
        </div>
        {isExpanded && hasChildren && (
          <div className="ml-4 border-l border-gray-200 pl-2">
            {node.children.map(child => renderNode(child))}
          </div>
        )}
      </div>
    );
  };
  if (!departments || departments.length === 0) {
    return <div className="text-center text-gray-500 py-8">No departments found</div>;
  }
  return (
    <div className={`department-tree-view ${className}`}>
      {departments.map(dept => renderNode(dept))}
    </div>
  );
};
export default DepartmentTreeView;
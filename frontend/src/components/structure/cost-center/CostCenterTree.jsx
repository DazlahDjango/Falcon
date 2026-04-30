import React, { useState } from 'react';
import { ChevronRight, ChevronDown, DollarSign, PieChart } from 'lucide-react';

const CostCenterTree = ({ costCenters, onSelect, className = '' }) => {
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
  const buildTree = (items) => {
    const itemMap = new Map();
    const roots = [];
    items?.forEach(item => {
      itemMap.set(item.id, { ...item, children: [] });
    });
    items?.forEach(item => {
      if (item.parent_id && itemMap.has(item.parent_id)) {
        itemMap.get(item.parent_id).children.push(itemMap.get(item.id));
      } else if (!item.parent_id) {
        roots.push(itemMap.get(item.id));
      }
    });
    return roots;
  };
  const renderNode = (node) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const utilization = node.budget_amount 
      ? Math.round(((node.budget_amount - (node.remaining_budget || 0)) / node.budget_amount) * 100)
      : 0;

    return (
      <div key={node.id} className="cost-center-tree">
        <div
          className="cost-center-node flex items-center gap-2 cursor-pointer"
          onClick={() => onSelect?.(node)}
        >
          {hasChildren && (
            <button
              onClick={(e) => { e.stopPropagation(); toggleNode(node.id); }}
              className="p-0.5 hover:bg-gray-100 rounded"
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
          {!hasChildren && <div className="w-4" />}
          <DollarSign size={14} className="text-purple-500" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">{node.code}</span>
              <span className="text-sm">{node.name}</span>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${utilization >= 90 ? 'bg-red-500' : utilization >= 75 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(100, utilization)}%` }}
                />
              </div>
              <span className="text-xs text-gray-400">{utilization}% used</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {node.is_shared && <PieChart size={12} />}
            <span>{node.fiscal_year}</span>
          </div>
        </div>
        {isExpanded && hasChildren && (
          <div className="ml-6">
            {node.children.map(child => renderNode(child))}
          </div>
        )}
      </div>
    );
  };
  const tree = buildTree(costCenters);
  return (
    <div className={`cost-center-tree-container ${className}`}>
      {tree.map(root => renderNode(root))}
    </div>
  );
};
export default CostCenterTree;
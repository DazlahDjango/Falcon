import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

const OrgTreeNode = ({ node, renderNode, onNodeClick, defaultExpanded = false, depth = 0 }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasChildren = node.children && node.children.length > 0;
  const toggleExpand = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };
  const handleClick = (e) => {
    e.stopPropagation();
    if (onNodeClick) {
      onNodeClick(node, depth);
    }
  };
  return (
    <div className="org-tree-node" style={{ marginLeft: depth > 0 ? '1.25rem' : '0' }}>
      <div className="org-tree-node-content" onClick={handleClick}>
        {hasChildren && (
          <button className="org-tree-node-toggle" onClick={toggleExpand}>
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )}
        {!hasChildren && <div className="org-tree-node-toggle" />}
        {renderNode(node, depth, expanded)}
      </div>
      {expanded && hasChildren && (
        <div className="org-tree-children">
          {node.children.map((child, index) => (
            <OrgTreeNode
              key={child.id || index}
              node={child}
              renderNode={renderNode}
              onNodeClick={onNodeClick}
              defaultExpanded={defaultExpanded}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrgTreeNode;
import React, { useState } from 'react';
import { FiChevronRight, FiChevronDown, FiTarget, FiUsers, FiUser } from 'react-icons/fi';

const CascadeTree = ({ tree, onNodeClick }) => {
    const [expanded, setExpanded] = useState({});

    const toggleExpand = (id) => {
        setExpanded({ ...expanded, [id]: !expanded[id] });
    };

    const renderNode = (node, level = 0) => {
        const isExpanded = expanded[node.id];
        const hasChildren = node.children && node.children.length > 0;

        return (
            <div key={node.id} style={{ marginLeft: level * 24 }}>
                <div className="kpi-cascade-tree-node" onClick={() => onNodeClick?.(node)}>
                    <div className="kpi-cascade-tree-node-icon">
                        {hasChildren && (
                            <button 
                                className="kpi-cascade-tree-expand"
                                onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }}
                            >
                                {isExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
                            </button>
                        )}
                        {node.level === 'ORGANIZATION' && <FiTarget size={16} />}
                        {node.level === 'DEPARTMENT' && <FiUsers size={16} />}
                        {node.level === 'INDIVIDUAL' && <FiUser size={16} />}
                    </div>
                    <div className="kpi-cascade-tree-node-content">
                        <div className="kpi-cascade-tree-node-name">{node.name}</div>
                        <div className="kpi-cascade-tree-node-value">{node.target_value}</div>
                        {node.contribution && (
                            <div className="kpi-cascade-tree-node-contribution">
                                {node.contribution}% of parent
                            </div>
                        )}
                    </div>
                </div>
                {hasChildren && isExpanded && (
                    <div className="kpi-cascade-tree-children">
                        {node.children.map(child => renderNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    if (!tree) {
        return <div className="kpi-cascade-tree-empty">No cascade tree available</div>;
    }

    return (
        <div className="kpi-cascade-tree">
            <h3>Target Cascade Tree</h3>
            <div className="kpi-cascade-tree-container">
                {renderNode(tree)}
            </div>
        </div>
    );
};

export default CascadeTree;
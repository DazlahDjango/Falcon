import React, { useState } from "react";
import { FiChevronDown, FiChevronRight, FiUser, FiUsers } from "react-icons/fi";
import TeamMemberCard from './components/TeamMemberCard';

const TeamTreeNode = ({ node, level = 0, searchTerm = '', onMemberSelect }) => {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;
    const matchesSearch = searchTerm === '' ||
        node.name?.toLowerCase().include(searchTerm.toLowerCase()) ||
        node.email?.toLowerCase().include(searchTerm.toLowerCase());
    if (!matchesSearch && !hasChildren) return null;
    const shouldShowChidren = matchesSearch || expanded;
    return (
        <div className="tree-node" style={{ paddingLeft: `${level * 24}px` }}>
            <div className="tree-node-content">
                <div className="tree-node-toggle">
                    {hasChildren && (
                        <button onClick={() => setExpanded(!expanded)} className="toggle-btn">
                            {expanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
                        </button>
                    )}
                    {!hasChildren && <span className="toggle-placeholder" />}
                </div>
                <div className="tree-node-label" onClick={() => onMemberSelect(node)}>
                    <div className="node-icon">
                        {hasChildren ? <FiUsers size={16} /> : <FiUser size={16} />}
                    </div>
                    <div className="node-info">
                        <span className="node-name">{node.name}</span>
                        <span className="node-role">{node.role_display}</span>
                        <span className="node-email">{node.email}</span>
                    </div>
                </div>
            </div>
            
            {hasChildren && shouldShowChildren && (
                <div className="tree-node-children">
                    {node.children.map(child => (
                        <TeamTreeNode 
                            key={child.id}
                            node={child}
                            level={level + 1}
                            searchTerm={searchTerm}
                            onMemberSelect={onMemberSelect}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
const TeamTree = ({ data, searchTerm = '', onMemberSelect }) => {
    if (!data || !data.root) {
        return (
            <div className="team-tree-empty">
                <p>No team hierarchy available</p>
            </div>
        );
    }
    
    return (
        <div className="team-tree">
            <div className="tree-header">
                <h3>Organization Structure</h3>
                <p className="tree-stats">{data.total_members} total members</p>
            </div>
            <div className="tree-container">
                <TeamTreeNode 
                    node={data.root}
                    level={0}
                    searchTerm={searchTerm}
                    onMemberSelect={onMemberSelect}
                />
            </div>
        </div>
    );
};
export default TeamTree;
import React, { useState } from 'react';
import { FiChevronDown, FiChevronRight, FiUsers, FiLock } from 'react-icons/fi';

const RoleHierarchyNode = ({ role, level = 0, onSelect, selectedId }) => {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = role.children && role.children.length > 0;
    return (
        <div className="hierarchy-node" style={{ paddingLeft: `${level * 24}px` }}>
            <div className={`node-content ${selectedId === role.id ? 'selected' : ''}`} onClick={() => onSelect(role)}>
                <div className="node-toggle">
                    {hasChildren && (
                        <button onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
                            {expanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
                        </button>
                    )}
                </div>
                <div className="node-icon">
                    {role.is_system ? <FiLock size={14} /> : <FiUsers size={14} />}
                </div>
                <div className="node-info">
                    <span className="node-name">{role.name}</span>
                    <span className="node-code">{role.code}</span>
                    {role.user_count > 0 && (
                        <span className="node-count">{role.user_count} users</span>
                    )}
                </div>
            </div>
            {hasChildren && expanded && (
                <div className="node-children">
                    {role.children.map(child => (
                        <RoleHierarchyNode 
                            key={child.id}
                            role={child}
                            level={level + 1}
                            onSelect={onSelect}
                            selectedId={selectedId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const RoleHierarchy = ({ roles, onRoleSelect, selectedRoleId }) => {
    const buildHierarchy = (rolesList) => {
        const map = {};
        const roots = [];
        rolesList.forEach(role => {
            if (role.parent_id && map[role.parent_id]) {
                map[role.parent_id].children.push(map[role.id]);
            } else {
                roots.push(map[role.id]);
            }
        });
        return roots;
    };
    const hierarchy = buildHierarchy(roles);
    if (roles.length === 0) {
        return (
            <div className="role-hierarchy empty">
                <p>No roles available</p>
            </div>
        );
    }
    return (
        <div className="role-hierarchy">
            <h3>Role Hierarchy</h3>
            <div className="hierarchy-tree">
                {hierarchy.map(root => (
                    <RoleHierarchyNode 
                        key={root.id}
                        role={root}
                        onSelect={onRoleSelect}
                        selectedId={selectedRoleId}
                    />
                ))}
            </div>
        </div>
    );
};
export default RoleHierarchy;
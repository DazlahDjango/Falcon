import React, { useState } from 'react';
import { 
    FiChevronRight, 
    FiChevronDown, 
    FiTarget, 
    FiUsers, 
    FiUser, 
    FiLayers, 
    FiGrid, 
    FiCornerDownRight, 
    FiSearch, 
    FiMaximize2, 
    FiMinimize2 
} from 'react-icons/fi';

const CascadeTree = ({ tree, onNodeClick }) => {
    const [expanded, setExpanded] = useState({});
    const [defaultExpanded, setDefaultExpanded] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const toggleExpand = (id) => {
        const currentState = expanded[id] !== undefined ? expanded[id] : defaultExpanded;
        setExpanded(prev => ({ ...prev, [id]: !currentState }));
    };

    const expandAll = (node) => {
        setDefaultExpanded(true);
        const newExpanded = {};
        const collectIds = (n) => {
            if (!n) return;
            newExpanded[n.id] = true;
            if (n.children) {
                n.children.forEach(collectIds);
            }
        };
        collectIds(node);
        setExpanded(newExpanded);
    };

    const collapseAll = (node) => {
        setDefaultExpanded(false);
        const newExpanded = {};
        const collectIds = (n) => {
            if (!n) return;
            newExpanded[n.id] = false;
            if (n.children) {
                n.children.forEach(collectIds);
            }
        };
        collectIds(node);
        setExpanded(newExpanded);
    };

    const formatCurrency = (val) => {
        if (val === undefined || val === null) return '-';
        return Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const getNodeLevelBadge = (level) => {
        const lvl = (level || '').toUpperCase();
        if (lvl === 'ORGANIZATION' || lvl === 'ORG') {
            return { label: 'Organization Target', bg: '#dbeafe', color: '#1e40af', icon: <FiTarget size={14} /> };
        }
        if (lvl === 'DIVISION') {
            return { label: 'Division Level', bg: '#e0e7ff', color: '#3730a3', icon: <FiLayers size={14} /> };
        }
        if (lvl === 'DEPARTMENT') {
            return { label: 'Department Level', bg: '#fae8ff', color: '#86198f', icon: <FiUsers size={14} /> };
        }
        if (lvl === 'SECTION') {
            return { label: 'Section Level', bg: '#fce7f3', color: '#9d174d', icon: <FiGrid size={14} /> };
        }
        if (lvl === 'UNIT') {
            return { label: 'Unit Level', bg: '#fef3c7', color: '#92400e', icon: <FiCornerDownRight size={14} /> };
        }
        return { label: 'Individual Employee', bg: '#dcfce7', color: '#166534', icon: <FiUser size={14} /> };
    };

    const matchesSearch = (node, query) => {
        if (!query) return true;
        const q = query.toLowerCase();
        const nameMatch = (node.user_name || '').toLowerCase().includes(q);
        const emailMatch = (node.user_email || '').toLowerCase().includes(q);
        const childMatch = node.children && node.children.some(c => matchesSearch(c, query));
        return nameMatch || emailMatch || childMatch;
    };

    const renderNode = (node, depth = 0) => {
        if (!node) return null;
        if (searchTerm && !matchesSearch(node, searchTerm)) return null;

        const isExpanded = expanded[node.id] !== undefined ? expanded[node.id] : defaultExpanded;
        const hasChildren = node.children && node.children.length > 0;
        const badge = getNodeLevelBadge(node.level);

        return (
            <div key={node.id} style={{ marginLeft: depth > 0 ? 20 : 0, marginTop: 10 }}>
                <div 
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#ffffff',
                        border: depth === 0 ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        boxShadow: depth === 0 ? '0 4px 6px -1px rgba(59, 130, 246, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                    }}
                    onClick={() => onNodeClick?.(node)}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {hasChildren ? (
                            <button 
                                onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }}
                                style={{
                                    border: 'none',
                                    background: '#f1f5f9',
                                    borderRadius: '6px',
                                    width: '26px',
                                    height: '26px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: '#475569'
                                }}
                            >
                                {isExpanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
                            </button>
                        ) : (
                            <div style={{ width: '26px' }} />
                        )}

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                                    {node.user_name || node.user_email || 'Unassigned Target Owner'}
                                </span>
                                <span 
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontSize: '0.72rem',
                                        fontWeight: 600,
                                        background: badge.bg,
                                        color: badge.color
                                    }}
                                >
                                    {badge.icon}
                                    {badge.label}
                                </span>
                            </div>

                            {node.user_email && (
                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                    {node.user_email}
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>
                            ${formatCurrency(node.target_value)}
                        </div>

                        {node.contribution !== undefined && node.contribution !== null && (
                            <div style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600, marginTop: '2px' }}>
                                {node.contribution}% of parent
                                {node.rule && <span style={{ color: '#94a3b8', fontWeight: 400, marginLeft: '6px' }}>({node.rule})</span>}
                            </div>
                        )}
                    </div>
                </div>

                {hasChildren && isExpanded && (
                    <div style={{ borderLeft: '2px dashed #cbd5e1', marginLeft: 13, paddingLeft: 8 }}>
                        {node.children.map(child => renderNode(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    if (!tree) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', background: '#ffffff', borderRadius: '12px' }}>
                <FiTarget size={36} color="#94a3b8" style={{ marginBottom: '12px' }} />
                <h4>No Cascade Tree Available</h4>
                <p style={{ fontSize: '0.85rem' }}>Select an annual target to inspect its structural cascade hierarchy.</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Tree Controls Bar */}
            <div 
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    background: '#ffffff',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0'
                }}
            >
                <div style={{ position: 'relative', minWidth: '240px' }}>
                    <FiSearch size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
                    <input 
                        type="text"
                        placeholder="Filter nodes by owner or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '8px 12px 8px 32px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.85rem',
                            width: '100%',
                            outline: 'none'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                        onClick={() => expandAll(tree)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#334155',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        <FiMaximize2 size={12} />
                        Expand All
                    </button>
                    <button 
                        onClick={() => collapseAll(tree)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#334155',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        <FiMinimize2 size={12} />
                        Collapse All
                    </button>
                </div>
            </div>

            {/* Tree Nodes List */}
            <div style={{ background: '#f8fafc', borderRadius: '12px' }}>
                {renderNode(tree)}
            </div>
        </div>
    );
};

export default CascadeTree;
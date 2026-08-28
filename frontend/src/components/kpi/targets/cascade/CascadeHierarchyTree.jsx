import React, { useState } from 'react';
import { 
    FiChevronRight, 
    FiChevronDown, 
    FiTarget, 
    FiLayers, 
    FiUsers, 
    FiGrid, 
    FiCornerDownRight, 
    FiUser, 
    FiSearch, 
    FiMaximize2, 
    FiMinimize2, 
    FiEye 
} from 'react-icons/fi';

const CascadeHierarchyTree = ({ tree, onNodeSelect }) => {
    const [expanded, setExpanded] = useState({});
    const [defaultExpanded, setDefaultExpanded] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [levelFilter, setLevelFilter] = useState('ALL'); // ALL, DIVISION, DEPARTMENT, SECTION, UNIT, INDIVIDUAL

    const toggleExpand = (id) => {
        const current = expanded[id] !== undefined ? expanded[id] : defaultExpanded;
        setExpanded(prev => ({ ...prev, [id]: !current }));
    };

    const expandAll = (node) => {
        setDefaultExpanded(true);
        const map = {};
        const collect = (n) => {
            if (!n) return;
            map[n.id] = true;
            if (n.children) n.children.forEach(collect);
        };
        collect(node);
        setExpanded(map);
    };

    const collapseAll = (node) => {
        setDefaultExpanded(false);
        const map = {};
        const collect = (n) => {
            if (!n) return;
            map[n.id] = false;
            if (n.children) n.children.forEach(collect);
        };
        collect(node);
        setExpanded(map);
    };

    const formatCurrency = (val) => {
        if (val === undefined || val === null) return '-';
        return Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const getLevelMeta = (level) => {
        const lvl = (level || '').toUpperCase();
        switch (lvl) {
            case 'ORGANIZATION':
            case 'ORG':
                return { label: 'Organization Target', bg: '#1e293b', color: '#f8fafc', icon: <FiTarget size={14} />, border: '#334155' };
            case 'DIVISION':
                return { label: 'Division Target & Director', bg: '#1e1b4b', color: '#818cf8', icon: <FiLayers size={14} />, border: '#3730a3' };
            case 'DEPARTMENT':
                return { label: 'Department Target & Manager', bg: '#4c1d95', color: '#e9d5ff', icon: <FiUsers size={14} />, border: '#6b21a8' };
            case 'SECTION':
                return { label: 'Section Target & Lead', bg: '#831843', color: '#fbcfe8', icon: <FiGrid size={14} />, border: '#9d174d' };
            case 'UNIT':
                return { label: 'Unit Target & Leader', bg: '#78350f', color: '#fde68a', icon: <FiCornerDownRight size={14} />, border: '#92400e' };
            case 'INDIVIDUAL':
            default:
                return { label: 'Individual Employee Target', bg: '#064e3b', color: '#a7f3d0', icon: <FiUser size={14} />, border: '#047857' };
        }
    };

    const matchesSearch = (node, query) => {
        if (!query) return true;
        const q = query.toLowerCase();
        const nameMatch = (node.user_name || '').toLowerCase().includes(q);
        const emailMatch = (node.user_email || '').toLowerCase().includes(q);
        const levelMatch = (node.level || '').toLowerCase().includes(q);
        const childMatch = node.children && node.children.some(c => matchesSearch(c, query));
        return nameMatch || emailMatch || levelMatch || childMatch;
    };

    const passesLevelFilter = (node) => {
        if (levelFilter === 'ALL') return true;
        const nodeLvl = (node.level || '').toUpperCase();
        if (nodeLvl === levelFilter) return true;
        return node.children && node.children.some(c => passesLevelFilter(c));
    };

    const renderNode = (node, depth = 0) => {
        if (!node) return null;
        if (searchTerm && !matchesSearch(node, searchTerm)) return null;
        if (!passesLevelFilter(node)) return null;

        const isExpanded = expanded[node.id] !== undefined ? expanded[node.id] : defaultExpanded;
        const hasChildren = node.children && node.children.length > 0;
        const meta = getLevelMeta(node.level);

        return (
            <div key={node.id} style={{ marginLeft: depth > 0 ? 24 : 0, marginTop: 12 }}>
                {/* Node Card - Dark Modern UI */}
                <div 
                    style={{
                        background: '#0f172a',
                        borderRadius: '12px',
                        padding: '14px 18px',
                        border: `1px solid ${meta.border}`,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        {hasChildren ? (
                            <button 
                                onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }}
                                style={{
                                    border: 'none',
                                    background: '#1e293b',
                                    color: '#94a3b8',
                                    borderRadius: '6px',
                                    width: '28px',
                                    height: '28px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                {isExpanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
                            </button>
                        ) : (
                            <div style={{ width: '28px' }} />
                        )}

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.95rem' }}>
                                    {node.user_name || 'Target Lead'}
                                </span>
                                <span 
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        padding: '3px 10px',
                                        borderRadius: '14px',
                                        fontSize: '0.73rem',
                                        fontWeight: 600,
                                        background: meta.bg,
                                        color: meta.color,
                                        border: `1px solid ${meta.border}`
                                    }}
                                >
                                    {meta.icon}
                                    {meta.label}
                                </span>
                            </div>

                            {node.user_email && (
                                <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                    {node.user_email}
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: '1.1rem' }}>
                                ${formatCurrency(node.target_value)}
                            </div>
                            {node.contribution !== undefined && node.contribution !== null && (
                                <div style={{ color: '#38bdf8', fontSize: '0.78rem', fontWeight: 600, marginTop: '2px' }}>
                                    {node.contribution}% of parent
                                    {node.rule && <span style={{ color: '#64748b', fontWeight: 400, marginLeft: '6px' }}>({node.rule})</span>}
                                </div>
                            )}
                        </div>

                        {onNodeSelect && (
                            <button 
                                onClick={() => onNodeSelect(node)}
                                style={{
                                    background: '#1e293b',
                                    border: '1px solid #334155',
                                    color: '#38bdf8',
                                    padding: '6px 10px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '0.78rem',
                                    fontWeight: 600
                                }}
                                title="View Subtree"
                            >
                                <FiEye size={14} />
                                View
                            </button>
                        )}
                    </div>
                </div>

                {/* Subtree Children */}
                {hasChildren && isExpanded && (
                    <div style={{ borderLeft: '2px dashed #334155', marginLeft: 14, paddingLeft: 10 }}>
                        {node.children.map(child => renderNode(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    if (!tree) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', background: '#0f172a', borderRadius: '12px' }}>
                <FiTarget size={40} color="#38bdf8" style={{ marginBottom: '12px' }} />
                <h3>No Structural Hierarchy Tree Available</h3>
                <p style={{ fontSize: '0.85rem' }}>Select an organizational annual target to inspect the structural cascade breakdown.</p>
            </div>
        );
    }

    return (
        <div style={{ background: '#090d16', padding: '20px', borderRadius: '16px', color: '#f8fafc' }}>
            {/* Header & Controls Bar */}
            <div 
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginBottom: '16px',
                    padding: '14px 18px',
                    background: '#0f172a',
                    borderRadius: '12px',
                    border: '1px solid #1e293b'
                }}
            >
                {/* Level Filter Tabs */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {[
                        { id: 'ALL', label: 'All Levels' },
                        { id: 'DIVISION', label: 'Divisions' },
                        { id: 'DEPARTMENT', label: 'Departments' },
                        { id: 'SECTION', label: 'Sections' },
                        { id: 'UNIT', label: 'Units' },
                        { id: 'INDIVIDUAL', label: 'Individuals' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setLevelFilter(tab.id)}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                background: levelFilter === tab.id ? '#2563eb' : '#1e293b',
                                color: levelFilter === tab.id ? '#ffffff' : '#94a3b8',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ position: 'relative' }}>
                        <FiSearch size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: '#64748b' }} />
                        <input 
                            type="text"
                            placeholder="Filter by owner..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                padding: '6px 10px 6px 30px',
                                borderRadius: '6px',
                                border: '1px solid #334155',
                                background: '#1e293b',
                                color: '#f8fafc',
                                fontSize: '0.8rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <button 
                        onClick={() => expandAll(tree)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid #334155',
                            background: '#1e293b',
                            color: '#f8fafc',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        <FiMaximize2 size={12} />
                        Expand
                    </button>
                    <button 
                        onClick={() => collapseAll(tree)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid #334155',
                            background: '#1e293b',
                            color: '#f8fafc',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        <FiMinimize2 size={12} />
                        Collapse
                    </button>
                </div>
            </div>

            {/* Tree Content */}
            <div>
                {renderNode(tree)}
            </div>
        </div>
    );
};

export default CascadeHierarchyTree;

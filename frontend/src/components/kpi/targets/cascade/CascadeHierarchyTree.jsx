import React, { useState } from 'react';
import { 
    FiChevronRight, 
    FiChevronDown, 
    FiGlobe, 
    FiLayers, 
    FiUsers, 
    FiGrid, 
    FiCornerDownRight, 
    FiUser, 
    FiSearch, 
    FiRefreshCw, 
    FiDownload, 
    FiMaximize2, 
    FiMinimize2,
    FiTool,
    FiCheckCircle,
    FiSliders
} from 'react-icons/fi';

const LEVEL_CONFIG = {
    ORGANIZATION: {
        label: 'ORGANIZATION TARGET',
        subLabel: 'Organization Level',
        badgeBg: '#ede9fe',
        badgeColor: '#6d28d9',
        iconBg: '#7c3aed',
        iconColor: '#ffffff',
        icon: FiGlobe,
        defaultTitle: 'Chief Executive Officer',
    },
    ORG: {
        label: 'ORGANIZATION TARGET',
        subLabel: 'Organization Level',
        badgeBg: '#ede9fe',
        badgeColor: '#6d28d9',
        iconBg: '#7c3aed',
        iconColor: '#ffffff',
        icon: FiGlobe,
        defaultTitle: 'Chief Executive Officer',
    },
    DIVISION: {
        label: 'DIVISION',
        subLabel: 'Division Level',
        badgeBg: '#dbeafe',
        badgeColor: '#1d4ed8',
        iconBg: '#2563eb',
        iconColor: '#ffffff',
        icon: FiLayers,
        defaultTitle: 'Division Director',
    },
    DEPARTMENT: {
        label: 'DEPARTMENT',
        subLabel: 'Department Level',
        badgeBg: '#d1fae5',
        badgeColor: '#047857',
        iconBg: '#10b981',
        iconColor: '#ffffff',
        icon: FiUsers,
        defaultTitle: 'Department Manager',
    },
    SECTION: {
        label: 'SECTION',
        subLabel: 'Section Level',
        badgeBg: '#fef3c7',
        badgeColor: '#b45309',
        iconBg: '#f59e0b',
        iconColor: '#ffffff',
        icon: FiGrid,
        defaultTitle: 'Section Head',
    },
    UNIT: {
        label: 'UNIT',
        subLabel: 'Unit Level',
        badgeBg: '#ffedd5',
        badgeColor: '#c2410c',
        iconBg: '#f97316',
        iconColor: '#ffffff',
        icon: FiCornerDownRight,
        defaultTitle: 'Unit Lead',
    },
    INDIVIDUAL: {
        label: 'INDIVIDUAL',
        subLabel: 'Individual Contributor',
        badgeBg: '#f1f5f9',
        badgeColor: '#475569',
        iconBg: '#64748b',
        iconColor: '#ffffff',
        icon: FiUser,
        defaultTitle: 'Individual Contributor',
    },
};

const getLevelMeta = (levelStr) => {
    const key = (levelStr || 'INDIVIDUAL').toUpperCase();
    return LEVEL_CONFIG[key] || LEVEL_CONFIG.INDIVIDUAL;
};

const formatCurrency = (val, unit) => {
    if (val === undefined || val === null || isNaN(val)) return '0.00';
    const formatted = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
    if (unit && unit !== '$' && unit !== 'USD') {
        return `${unit} ${formatted}`;
    }
    return `$${formatted}`;
};

const formatPercent = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '0.00%';
    return Number(val).toFixed(2) + '%';
};

const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
};

import LeadCascadeActionModal from './LeadCascadeActionModal';

const CascadeHierarchyTree = ({ tree, unit, onNodeSelect, onRefresh, onExport, onRepair, onVerifyIntegrity }) => {
    const [expanded, setExpanded] = useState({});
    const [defaultExpanded, setDefaultExpanded] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [levelFilter, setLevelFilter] = useState('ALL');
    const [year, setYear] = useState('2026');
    const [actionNode, setActionNode] = useState(null);

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

    const matchesSearch = (node, query) => {
        if (!query) return true;
        const q = query.toLowerCase();
        const nameMatch = (node.user_name || node.name || '').toLowerCase().includes(q);
        const codeMatch = (node.code || node.id || '').toLowerCase().includes(q);
        const emailMatch = (node.user_email || '').toLowerCase().includes(q);
        const childMatch = node.children && node.children.some(c => matchesSearch(c, query));
        return nameMatch || codeMatch || emailMatch || childMatch;
    };

    const passesLevelFilter = (node) => {
        if (levelFilter === 'ALL') return true;
        const nodeLvl = (node.level || '').toUpperCase();
        if (nodeLvl === levelFilter) return true;
        return node.children && node.children.some(c => passesLevelFilter(c));
    };

    const renderNodeCard = (node, depth = 0) => {
        if (!node) return null;
        if (searchTerm && !matchesSearch(node, searchTerm)) return null;
        if (!passesLevelFilter(node)) return null;

        const isExpanded = expanded[node.id] !== undefined ? expanded[node.id] : defaultExpanded;
        const hasChildren = node.children && node.children.length > 0;
        const meta = getLevelMeta(node.level);
        const LevelIcon = meta.icon;

        // Real Data Calculations
        const targetAssigned = Number(node.target_value || 0);
        const achievedValue = (node.achieved_value !== undefined && node.achieved_value !== null) 
            ? Number(node.achieved_value) 
            : 0;
        const achievedPercentage = targetAssigned > 0 ? (achievedValue / targetAssigned) * 100 : (node.achievement_percentage || 0);
        
        const calculationLogic = (node.calculation_logic || tree?.calculation_logic || 'HIGHER_IS_BETTER').toUpperCase();
        let varianceValue = 0;
        if (calculationLogic === 'LOWER_IS_BETTER') {
            varianceValue = achievedValue - targetAssigned;
        } else {
            varianceValue = Math.max(0, targetAssigned - achievedValue);
        }

        const nodeUnit = node.unit || node.kpi_unit || tree?.unit || tree?.kpi_unit || unit;
        const leadName = node.user_name || node.lead_name || node.user_email || 'Executive Lead';
        const leadTitle = node.lead_title || node.user_role || meta.defaultTitle;
        const membersCount = node.members_count !== undefined ? node.members_count : (hasChildren ? node.children.length : null);
        const initials = getInitials(leadName);

        return (
            <div key={node.id} style={{ position: 'relative', marginTop: depth === 0 ? 0 : '16px' }}>
                {/* Node Row Card */}
                <div 
                    style={{
                        background: '#ffffff',
                        borderRadius: '14px',
                        border: '1px solid #e2e8f0',
                        boxShadow: depth === 0 ? '0 4px 12px rgba(0, 0, 0, 0.04)' : '0 2px 6px rgba(0, 0, 0, 0.02)',
                        padding: '16px 20px',
                        display: 'grid',
                        gridTemplateColumns: 'minmax(260px, 1.4fr) minmax(110px, 0.8fr) minmax(140px, 1.1fr) minmax(110px, 0.8fr) minmax(180px, 1.2fr) minmax(90px, 0.6fr) 40px',
                        alignItems: 'center',
                        gap: '16px',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        zIndex: 2,
                    }}
                    onClick={() => onNodeSelect?.(node)}
                >
                    {/* Col 1: Icon Box + Badge + Title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        {/* Square Icon Box */}
                        <div 
                            style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '12px',
                                background: meta.iconBg,
                                color: meta.iconColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                boxShadow: `0 4px 10px ${meta.iconBg}40`,
                            }}
                        >
                            <LevelIcon size={22} />
                        </div>

                        {/* Title & Level Badge */}
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span 
                                    style={{
                                        fontSize: '0.68rem',
                                        fontWeight: 800,
                                        letterSpacing: '0.5px',
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                        background: meta.badgeBg,
                                        color: meta.badgeColor,
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    {meta.label}
                                </span>
                            </div>
                            <h4 
                                style={{ 
                                    margin: '4px 0 0 0', 
                                    fontSize: depth === 0 ? '1.05rem' : '0.95rem', 
                                    fontWeight: 700, 
                                    color: '#0f172a',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {(node.name && node.name !== leadName) 
                                    ? node.name 
                                    : ((node.level || '').toUpperCase() === 'INDIVIDUAL' 
                                        ? leadName 
                                        : `${leadName}'s ${(meta.label || '').toLowerCase().replace(' target', '')}`)} {node.code ? `(${node.code})` : ''}
                            </h4>
                            {depth === 0 && (
                                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>
                                    {meta.subLabel}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Col 2: Target Assigned */}
                    <div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                            Target Assigned
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                            {formatCurrency(targetAssigned, nodeUnit)}
                        </div>
                    </div>

                    {/* Col 3: Achieved */}
                    <div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                            Achieved
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
                            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#16a34a' }}>
                                {formatCurrency(achievedValue, nodeUnit)}
                            </span>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#16a34a' }}>
                                ({formatPercent(achievedPercentage)})
                            </span>
                        </div>
                    </div>

                    {/* Col 4: Variance */}
                    <div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                            Variance
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#dc2626', marginTop: '2px' }}>
                            {formatCurrency(varianceValue, nodeUnit)}
                        </div>
                    </div>

                    {/* Col 5: Lead Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div 
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                color: '#ffffff',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                border: '2px solid #ffffff',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            }}
                        >
                            {initials}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                                Lead
                            </div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {leadName}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {leadTitle}
                            </div>
                        </div>
                    </div>

                    {/* Col 6: Members */}
                    <div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                            Members
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            {membersCount !== null ? (
                                <>
                                    <FiUsers size={14} color="#64748b" />
                                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                                        {membersCount}
                                    </span>
                                </>
                            ) : (
                                <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>—</span>
                            )}
                        </div>
                    </div>

                    {/* Col 7: Lead Action & Expand/Collapse Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                            onClick={(e) => { e.stopPropagation(); setActionNode(node); }}
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                background: '#ffffff',
                                color: '#2563eb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                            }}
                            title="Manage Lead Cascade Actions (Sub-allocate, Verify, Rollback)"
                        >
                            <FiSliders size={15} />
                        </button>
                        {hasChildren ? (
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    border: '1px solid #e2e8f0',
                                    background: '#f8fafc',
                                    color: '#475569',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                {isExpanded ? <FiChevronDown size={18} /> : <FiChevronRight size={18} />}
                            </button>
                        ) : (
                            <div style={{ width: '32px' }} />
                        )}
                    </div>
                </div>

                {/* Subtree Children (with connecting line graph layout) */}
                {hasChildren && isExpanded && (
                    <div 
                        style={{ 
                            marginLeft: '22px', 
                            paddingLeft: '24px', 
                            borderLeft: '2px solid #cbd5e1',
                            marginTop: '6px',
                            position: 'relative',
                        }}
                    >
                        {node.children.map((child, index) => (
                            <div key={child.id} style={{ position: 'relative' }}>
                                {/* Horizontal connecting line elbow */}
                                <div 
                                    style={{
                                        position: 'absolute',
                                        left: '-24px',
                                        top: '38px',
                                        width: '24px',
                                        height: '2px',
                                        background: '#cbd5e1',
                                    }}
                                />
                                {renderNodeCard(child, depth + 1)}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    if (!tree) {
        return (
            <div style={{ padding: '60px', textAlign: 'center', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <FiGlobe size={48} color="#94a3b8" style={{ marginBottom: '16px' }} />
                <h3 style={{ margin: 0, color: '#0f172a', fontWeight: 700 }}>No Cascade Tree Available</h3>
                <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                    Select an annual organization target to visualize its structural cascade hierarchy.
                </p>
            </div>
        );
    }

    return (
        <div style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            {/* Top Toolbar */}
            <div 
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                    marginBottom: '20px',
                    background: '#ffffff',
                    padding: '16px 20px',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                }}
            >
                {/* Search & Level Filter Pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
                    <div style={{ position: 'relative', minWidth: '220px' }}>
                        <FiSearch size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
                        <input 
                            type="text"
                            placeholder="Filter nodes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                padding: '8px 12px 8px 36px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                fontSize: '0.85rem',
                                outline: 'none',
                                width: '100%',
                                background: '#f8fafc',
                                color: '#0f172a',
                            }}
                        />
                    </div>

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
                                    borderRadius: '8px',
                                    border: levelFilter === tab.id ? '1px solid #2563eb' : '1px solid #e2e8f0',
                                    background: levelFilter === tab.id ? '#eff6ff' : '#ffffff',
                                    color: levelFilter === tab.id ? '#1d4ed8' : '#64748b',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Actions (Year, Expand, Refresh, Export) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        style={{
                            padding: '8px 14px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#0f172a',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                        }}
                    >
                        <option value="2024">FY 2024</option>
                        <option value="2025">FY 2025</option>
                        <option value="2026">FY 2026</option>
                    </select>

                    <button 
                        onClick={() => expandAll(tree)}
                        title="Expand All"
                        style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#334155',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                        }}
                    >
                        <FiMaximize2 size={14} />
                        Expand
                    </button>

                    <button 
                        onClick={() => collapseAll(tree)}
                        title="Collapse All"
                        style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#334155',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                        }}
                    >
                        <FiMinimize2 size={14} />
                        Collapse
                    </button>

                    {onVerifyIntegrity && (
                        <button
                            onClick={onVerifyIntegrity}
                            style={{
                                padding: '8px 14px',
                                borderRadius: '8px',
                                border: '1px solid #0284c7',
                                background: '#f0f9ff',
                                color: '#0369a1',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                            }}
                            title="Verify Split Integrity"
                        >
                            <FiCheckCircle size={15} />
                            Verify
                        </button>
                    )}

                    {onRepair && (
                        <button
                            onClick={() => onRepair(year)}
                            style={{
                                padding: '8px 14px',
                                borderRadius: '8px',
                                border: '1px solid #d97706',
                                background: '#fffbeb',
                                color: '#b45309',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                            }}
                            title="Repair Structural Maps"
                        >
                            <FiTool size={15} />
                            Repair
                        </button>
                    )}

                    {onRefresh && (
                        <button
                            onClick={onRefresh}
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                background: '#ffffff',
                                color: '#2563eb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                            }}
                            title="Refresh Data"
                        >
                            <FiRefreshCw size={16} />
                        </button>
                    )}


                    {onExport && (
                        <button
                            onClick={onExport}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                background: '#2563eb',
                                color: '#ffffff',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)',
                            }}
                        >
                            <FiDownload size={15} />
                            Export
                        </button>
                    )}
                </div>
            </div>

            {/* Tree Render */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {renderNodeCard(tree)}
            </div>

            {/* Lead Cascade Action Modal */}
            {actionNode && (
                <LeadCascadeActionModal
                    node={actionNode}
                    unit={unit}
                    year={year}
                    onClose={() => setActionNode(null)}
                    onRefreshTree={onRefresh}
                />
            )}
        </div>
    );
};

export default CascadeHierarchyTree;

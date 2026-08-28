import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiTarget, FiPlus, FiSearch, FiFolder, FiExternalLink, FiUser, FiBarChart2 } from 'react-icons/fi';

const CategoryDetailModal = ({ category, onClose, onAddKpi }) => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    if (!category) return null;

    const kpis = category.kpis || [];
    const kpisCount = category.kpis_count ?? kpis.length;

    const filteredKpis = kpis.filter(kpi => 
        kpi.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kpi.kpi_type_display?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kpi.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleKpiClick = (kpiId) => {
        onClose();
        navigate(`/kpi/kpis/${kpiId}`);
    };

    const handleAddKpiClick = () => {
        onClose();
        if (onAddKpi) {
            onAddKpi(category);
        } else {
            navigate('/kpi/kpis/create', { state: { categoryId: category.id, categoryName: category.name } });
        }
    };

    return (
        <div 
            className="kpi-modal-overlay" 
            style={{ 
                position: 'fixed', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                backgroundColor: 'rgba(15, 23, 42, 0.65)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                zIndex: 1100, 
                backdropFilter: 'blur(4px)',
                padding: '20px'
            }}
        >
            <div 
                className="kpi-modal-content" 
                style={{ 
                    background: '#ffffff', 
                    borderRadius: '16px', 
                    width: '100%', 
                    maxWidth: '850px', 
                    maxHeight: '90vh', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
                    overflow: 'hidden'
                }}
            >
                {/* Modal Header */}
                <div 
                    style={{ 
                        padding: '24px 28px', 
                        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
                        color: '#ffffff',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div 
                            style={{ 
                                width: '48px', 
                                height: '48px', 
                                borderRadius: '12px', 
                                background: category.color || 'rgba(59, 130, 246, 0.2)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: '#38bdf8'
                            }}
                        >
                            <FiFolder size={24} />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc' }}>
                                    {category.name}
                                </h2>
                                <span 
                                    style={{ 
                                        padding: '4px 10px', 
                                        borderRadius: '20px', 
                                        fontSize: '0.75rem', 
                                        fontWeight: 600, 
                                        background: 'rgba(56, 189, 248, 0.15)', 
                                        color: '#38bdf8',
                                        border: '1px solid rgba(56, 189, 248, 0.3)'
                                    }}
                                >
                                    {category.category_type_display || category.category_type}
                                </span>
                            </div>
                            {category.description && (
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#94a3b8' }}>
                                    {category.description}
                                </p>
                            )}
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        style={{ 
                            background: 'rgba(255, 255, 255, 0.1)', 
                            border: 'none', 
                            color: '#94a3b8', 
                            width: '36px', 
                            height: '36px', 
                            borderRadius: '50%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                        }}
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Sub-header Controls */}
                <div 
                    style={{ 
                        padding: '16px 28px', 
                        borderBottom: '1px solid #e2e8f0', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        background: '#f8fafc',
                        gap: '16px'
                    }}
                >
                    <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
                        <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
                        <input 
                            type="text"
                            placeholder="Search KPIs in category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ 
                                width: '100%', 
                                padding: '8px 12px 8px 36px', 
                                borderRadius: '8px', 
                                border: '1px solid #cbd5e1', 
                                fontSize: '0.875rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>
                            Total KPIs: <span style={{ color: '#2563eb' }}>{kpisCount}</span>
                        </span>
                        <button 
                            onClick={handleAddKpiClick}
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px', 
                                padding: '8px 16px', 
                                background: '#2563eb', 
                                color: '#ffffff', 
                                borderRadius: '8px', 
                                border: 'none', 
                                fontWeight: 600, 
                                fontSize: '0.85rem', 
                                cursor: 'pointer',
                                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
                            }}
                        >
                            <FiPlus size={16} /> Add KPI
                        </button>
                    </div>
                </div>

                {/* Body Content */}
                <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
                    {filteredKpis.length === 0 ? (
                        <div 
                            style={{ 
                                textAlign: 'center', 
                                padding: '48px 20px', 
                                background: '#f8fafc', 
                                borderRadius: '12px', 
                                border: '2px dashed #e2e8f0'
                            }}
                        >
                            <div 
                                style={{ 
                                    width: '56px', 
                                    height: '56px', 
                                    borderRadius: '50%', 
                                    background: '#eff6ff', 
                                    color: '#3b82f6', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    margin: '0 auto 16px auto'
                                }}
                            >
                                <FiTarget size={28} />
                            </div>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>
                                {searchTerm ? 'No KPIs Match Your Search' : 'No KPIs in this Category Yet'}
                            </h3>
                            <p style={{ margin: '0 0 20px 0', fontSize: '0.875rem', color: '#64748b' }}>
                                {searchTerm 
                                    ? `No KPIs matching "${searchTerm}" were found in ${category.name}.`
                                    : `Start creating KPIs for ${category.name} to track organizational objectives.`
                                }
                            </p>
                            <button 
                                onClick={handleAddKpiClick}
                                style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '8px', 
                                    padding: '10px 20px', 
                                    background: '#2563eb', 
                                    color: '#ffffff', 
                                    borderRadius: '8px', 
                                    border: 'none', 
                                    fontWeight: 600, 
                                    cursor: 'pointer'
                                }}
                            >
                                <FiPlus size={18} /> Add First KPI
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {filteredKpis.map(kpi => (
                                <div 
                                    key={kpi.id}
                                    onClick={() => handleKpiClick(kpi.id)}
                                    style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between', 
                                        padding: '16px', 
                                        borderRadius: '12px', 
                                        border: '1px solid #e2e8f0', 
                                        background: '#ffffff',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = '#93c5fd';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.1)';
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = '#e2e8f0';
                                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div 
                                            style={{ 
                                                width: '40px', 
                                                height: '40px', 
                                                borderRadius: '10px', 
                                                background: '#eff6ff', 
                                                color: '#2563eb', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}
                                        >
                                            <FiTarget size={20} />
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>
                                                    {kpi.name}
                                                </h4>
                                                <span 
                                                    style={{ 
                                                        padding: '2px 8px', 
                                                        borderRadius: '6px', 
                                                        fontSize: '0.7rem', 
                                                        fontWeight: 600, 
                                                        background: '#f1f5f9', 
                                                        color: '#475569',
                                                        textTransform: 'uppercase'
                                                    }}
                                                >
                                                    {kpi.kpi_type_display || kpi.kpi_type}
                                                </span>
                                            </div>
                                            {kpi.description && (
                                                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                                                    {kpi.description}
                                                </p>
                                            )}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                                                {kpi.owner_name && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <FiUser size={12} /> {kpi.owner_name}
                                                    </span>
                                                )}
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <FiBarChart2 size={12} /> Unit: {kpi.unit || 'Score'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb', fontWeight: 600, fontSize: '0.85rem' }}>
                                        View KPI <FiExternalLink size={14} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div 
                    style={{ 
                        padding: '16px 28px', 
                        borderTop: '1px solid #e2e8f0', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'flex-end',
                        background: '#f8fafc'
                    }}
                >
                    <button 
                        onClick={onClose}
                        style={{ 
                            padding: '8px 20px', 
                            borderRadius: '8px', 
                            border: '1px solid #cbd5e1', 
                            background: '#ffffff', 
                            color: '#475569', 
                            fontWeight: 600, 
                            cursor: 'pointer'
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategoryDetailModal;

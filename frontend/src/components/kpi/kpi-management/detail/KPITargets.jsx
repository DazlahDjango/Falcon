import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiPlus, FiEdit, FiTrash2, FiChevronDown, FiChevronRight, FiGitMerge, FiUser, FiX, FiSave, FiShare2 } from 'react-icons/fi';
import { FolderTree } from 'lucide-react';
import { fetchTargets, createTarget, updateTarget, deleteTarget, selectTargets, selectTargetLoading } from '../../../../store/kpi';
import useReferenceData from '../../../../hooks/kpi/useReferenceData';
import KPILoading from '../../common/KPILoading';
import KPIEmptyState from '../../common/KPIEmptyState';
import KPIConfirmDialog from '../../common/KPIConfirmDialog';
import CascadeTreeModal from '../../targets/cascade/CascadeTreeModal';


const KPITargets = ({ kpiId, kpi }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { users } = useReferenceData(['users']);
    const [showForm, setShowForm] = useState(false);
    const [editingTarget, setEditingTarget] = useState(null);
    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const [expandedTargets, setExpandedTargets] = useState({});
    const [viewTreeTarget, setViewTreeTarget] = useState(null);

    // Form state
    const currentYear = new Date().getFullYear();
    const [formUserId, setFormUserId] = useState('');
    const [formYear, setFormYear] = useState(currentYear);
    const [formTargetValue, setFormTargetValue] = useState('');
    const [formNotes, setFormNotes] = useState('');
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const targets = useSelector(selectTargets);
    const loading = useSelector(selectTargetLoading);

    useEffect(() => {
        dispatch(fetchTargets({ kpi: kpiId }));
    }, [dispatch, kpiId]);

    const openCreateForm = () => {
        setEditingTarget(null);
        setFormUserId(kpi?.owner || (users[0]?.id || ''));
        setFormYear(currentYear);
        setFormTargetValue(kpi?.target_max || kpi?.target_min || '');
        setFormNotes('');
        setFormError('');
        setShowForm(true);
    };

    const openEditForm = (target) => {
        setEditingTarget(target);
        setFormUserId(target.user || target.user_id || '');
        setFormYear(target.year || currentYear);
        setFormTargetValue(target.target_value || '');
        setFormNotes(target.notes || '');
        setFormError('');
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingTarget(null);
        setFormError('');
    };

    const toggleExpand = (targetId) => {
        setExpandedTargets(prev => ({ ...prev, [targetId]: !prev[targetId] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formUserId) {
            setFormError('Please select a target assignee user');
            return;
        }
        if (!formTargetValue || parseFloat(formTargetValue) <= 0) {
            setFormError('Please enter a valid target value greater than 0');
            return;
        }

        setSubmitting(true);
        setFormError('');
        try {
            const payload = {
                kpi: kpiId,
                user: formUserId,
                year: parseInt(formYear),
                target_value: parseFloat(formTargetValue),
                notes: formNotes
            };

            if (editingTarget) {
                await dispatch(updateTarget({ id: editingTarget.id, data: payload })).unwrap();
            } else {
                await dispatch(createTarget(payload)).unwrap();
            }
            closeForm();
            dispatch(fetchTargets({ kpi: kpiId }));
        } catch (err) {
            setFormError(err.message || 'Failed to save target. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        await dispatch(deleteTarget(deleteTargetId)).unwrap();
        setDeleteTargetId(null);
        dispatch(fetchTargets({ kpi: kpiId }));
    };

    if (loading) {
        return <KPILoading size="sm" text="Loading targets..." />;
    }

    return (
        <div className="kpi-targets-section">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                    <h3 style={{ margin: 0 }}>Annual Targets & Cascades</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                        Expand any annual target or click the tree icon to view structural breakdown allocations.
                    </p>
                </div>
                <button
                    className="add-btn"
                    onClick={openCreateForm}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        background: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
                    }}
                >
                    <FiPlus size={16} />
                    Add Target
                </button>
            </div>

            {targets.length === 0 ? (
                <KPIEmptyState
                    icon="🎯"
                    title="No Targets"
                    description="No annual targets have been set for this KPI"
                    actionText="Set Target"
                    onAction={openCreateForm}
                />
            ) : (
                <div className="targets-table" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                                <th style={{ padding: '10px 12px', width: '40px' }}></th>
                                <th style={{ padding: '10px 12px' }}>Target Owner</th>
                                <th style={{ padding: '10px 12px' }}>Year</th>
                                <th style={{ padding: '10px 12px' }}>Annual Amount</th>
                                <th style={{ padding: '10px 12px' }}>Cascades</th>
                                <th style={{ padding: '10px 12px' }}>Status</th>
                                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {targets.map(target => {
                                const isExpanded = expandedTargets[target.id];
                                const cascades = target.child_cascades || [];
                                const cascadesCount = target.cascades_count ?? cascades.length;

                                return (
                                    <React.Fragment key={target.id}>
                                        <tr style={{ borderBottom: '1px solid #e2e8f0', background: isExpanded ? '#f1f5f9' : 'transparent' }}>
                                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                                <button
                                                    onClick={() => toggleExpand(target.id)}
                                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
                                                    title={isExpanded ? 'Collapse Cascades' : 'View Cascades'}
                                                >
                                                    {isExpanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
                                                </button>
                                            </td>
                                            <td style={{ padding: '10px 12px', fontWeight: 500 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <FiUser size={14} color="#3b82f6" />
                                                    {target.user_full_name || target.user_email || 'Organization Executive'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '10px 12px' }}>{target.year}</td>
                                            <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0f172a' }}>
                                                {kpi?.unit && kpi.unit !== '$' && kpi.unit !== 'USD' 
                                                    ? `${kpi.unit} ${Number(target.target_value).toLocaleString()}` 
                                                    : `$${Number(target.target_value).toLocaleString()}`}
                                            </td>
                                            <td style={{ padding: '10px 12px' }}>
                                                <span
                                                    onClick={() => toggleExpand(target.id)}
                                                    style={{
                                                        cursor: 'pointer',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: 4,
                                                        padding: '3px 8px',
                                                        borderRadius: 12,
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        background: cascadesCount > 0 ? '#e0f2fe' : '#f1f5f9',
                                                        color: cascadesCount > 0 ? '#0369a1' : '#64748b'
                                                    }}
                                                >
                                                    <FiGitMerge size={12} />
                                                    {cascadesCount} {cascadesCount === 1 ? 'Cascade' : 'Cascades'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '10px 12px' }}>
                                                <span className={`status-badge ${target.is_approved ? 'approved' : 'pending'}`}>
                                                    {target.is_approved ? 'Approved' : 'Pending'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                                                <button
                                                    className="tree-btn"
                                                    onClick={() => setViewTreeTarget(target)}
                                                    style={{ marginRight: 8, cursor: 'pointer', background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd', borderRadius: '6px', padding: '5px 8px' }}
                                                    title="View Target Cascade Tree"
                                                >
                                                    <FolderTree size={14} />
                                                </button>
                                                <button
                                                    className="cascade-btn"
                                                    onClick={() => navigate(`/kpi/targets/cascade?targetId=${target.id}`)}
                                                    style={{ marginRight: 8, cursor: 'pointer', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '5px 8px' }}
                                                    title="Cascade Target"
                                                >
                                                    <FiShare2 size={14} />
                                                </button>
                                                <button className="edit-btn" onClick={() => openEditForm(target)} style={{ marginRight: 8, cursor: 'pointer' }}>
                                                    <FiEdit size={14} />
                                                </button>
                                                <button className="delete-btn" onClick={() => setDeleteTargetId(target.id)} style={{ cursor: 'pointer' }}>
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>

                                        {/* Expanded Cascade Sub-table */}
                                        {isExpanded && (
                                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                                                <td colSpan={7} style={{ padding: '12px 16px 16px 48px' }}>
                                                    <div style={{ background: '#ffffff', borderRadius: 6, padding: 12, border: '1px solid #e2e8f0' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                                            <h5 style={{ margin: 0, color: '#475569', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
                                                                <FiGitMerge size={14} color="#0284c7" />
                                                                Cascaded Target Breakdown ({target.year})
                                                            </h5>
                                                            <button
                                                                onClick={() => setViewTreeTarget(target)}
                                                                style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '6px',
                                                                    padding: '4px 10px',
                                                                    background: '#0284c7',
                                                                    color: '#ffffff',
                                                                    border: 'none',
                                                                    borderRadius: '6px',
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: 600,
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                <FolderTree size={14} />
                                                                View Hierarchy Tree
                                                            </button>
                                                        </div>
                                                        {cascades.length === 0 ? (
                                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', padding: '6px 0' }}>
                                                                No child targets have been cascaded from this target yet.
                                                            </div>
                                                        ) : (
                                                            <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                                                                <thead>
                                                                    <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'left' }}>
                                                                        <th style={{ padding: '6px 8px' }}>Target Leader / Owner</th>
                                                                        <th style={{ padding: '6px 8px' }}>Level</th>
                                                                        <th style={{ padding: '6px 8px' }}>Target Amount</th>
                                                                        <th style={{ padding: '6px 8px' }}>Contribution</th>
                                                                        <th style={{ padding: '6px 8px' }}>Rule Applied</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {cascades.map((cascade, idx) => {
                                                                        const lvl = (cascade.level_display || cascade.level || 'CHILD TARGET').toUpperCase();
                                                                        let lvlBg = '#f1f5f9';
                                                                        let lvlColor = '#334155';
                                                                        if (lvl.includes('DIV')) { lvlBg = '#e0e7ff'; lvlColor = '#3730a3'; }
                                                                        else if (lvl.includes('DEPT')) { lvlBg = '#fae8ff'; lvlColor = '#86198f'; }
                                                                        else if (lvl.includes('SEC')) { lvlBg = '#fce7f3'; lvlColor = '#9d174d'; }
                                                                        else if (lvl.includes('UNIT')) { lvlBg = '#fef3c7'; lvlColor = '#92400e'; }
                                                                        else if (lvl.includes('INDIV') || lvl.includes('EMP')) { lvlBg = '#dcfce7'; lvlColor = '#166534'; }

                                                                        return (
                                                                            <tr key={cascade.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                                                <td style={{ padding: '6px 8px', fontWeight: 600, color: '#1e293b' }}>
                                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                                        <FiUser size={12} color="#0284c7" />
                                                                                        {cascade.target_owner_name || cascade.user_name || 'Target Lead'}
                                                                                    </div>
                                                                                </td>
                                                                                <td style={{ padding: '6px 8px' }}>
                                                                                    <span style={{ padding: '3px 8px', borderRadius: 12, background: lvlBg, color: lvlColor, fontSize: '0.7rem', fontWeight: 600 }}>
                                                                                        {lvl}
                                                                                    </span>
                                                                                </td>
                                                                                <td style={{ padding: '6px 8px', fontWeight: 700, color: '#0f172a' }}>
                                                                                    {cascade.target_amount ? (
                                                                                        kpi?.unit && kpi.unit !== '$' && kpi.unit !== 'USD'
                                                                                            ? `${kpi.unit} ${Number(cascade.target_amount).toLocaleString()}`
                                                                                            : `$${Number(cascade.target_amount).toLocaleString()}`
                                                                                    ) : '-'}
                                                                                </td>
                                                                                <td style={{ padding: '6px 8px', color: '#2563eb', fontWeight: 600 }}>
                                                                                    {cascade.contribution_percentage}%
                                                                                </td>
                                                                                <td style={{ padding: '6px 8px', color: '#64748b' }}>
                                                                                    {cascade.rule_name || 'Standard Split'}
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                </tbody>
                                                            </table>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Target Modal Form */}
            {showForm && (
                <div
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
                        zIndex: 1200,
                        backdropFilter: 'blur(4px)',
                        padding: '20px'
                    }}
                >
                    <div
                        style={{
                            background: '#ffffff',
                            borderRadius: '16px',
                            width: '100%',
                            maxWidth: '560px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            overflow: 'hidden'
                        }}
                    >
                        <div
                            style={{
                                padding: '20px 24px',
                                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}
                        >
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
                                {editingTarget ? 'Edit Annual Target' : 'Set Annual Target'}
                            </h3>
                            <button
                                onClick={closeForm}
                                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                            {formError && (
                                <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#fef2f2', color: '#dc2626', fontSize: '0.85rem', marginBottom: '16px', border: '1px solid #fecaca' }}>
                                    {formError}
                                </div>
                            )}

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                    Target Assignee (User) *
                                </label>
                                <select
                                    value={formUserId}
                                    onChange={(e) => setFormUserId(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                                >
                                    <option value="">Select Target Assignee...</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>
                                            {u.first_name ? `${u.first_name} ${u.last_name}` : u.email} ({u.role || 'Staff'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                        Target Year *
                                    </label>
                                    <select
                                        value={formYear}
                                        onChange={(e) => setFormYear(e.target.value)}
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                                    >
                                        {[currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                        Annual Target Amount *
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder={`Target (${kpi?.unit || 'Units'})`}
                                        value={formTargetValue}
                                        onChange={(e) => setFormTargetValue(e.target.value)}
                                        required
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                    Notes / Strategic Context (Optional)
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Enter strategic context or notes for this annual target..."
                                    value={formNotes}
                                    onChange={(e) => setFormNotes(e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    disabled={submitting}
                                    style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#ffffff', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                    <FiSave size={16} />
                                    {submitting ? 'Saving...' : 'Save Target'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Cascade Breakdown Tree Modal */}
            {viewTreeTarget && (
                <CascadeTreeModal
                    targetId={viewTreeTarget.id}
                    targetName={`${viewTreeTarget.kpi_name || viewTreeTarget.kpi?.name || kpi?.name || 'KPI Target'} (${viewTreeTarget.year})`}
                    onClose={() => setViewTreeTarget(null)}
                />
            )}

            <KPIConfirmDialog
                isOpen={!!deleteTargetId}
                title="Delete Target"
                message="Are you sure you want to delete this target?"
                confirmText="Delete"
                type="danger"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTargetId(null)}
            />
        </div>
    );
};

export default KPITargets;
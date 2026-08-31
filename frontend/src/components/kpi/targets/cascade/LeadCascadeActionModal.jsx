import React, { useState, useEffect } from 'react';
import { 
    FiX, FiLayers, FiCheckCircle, FiTool, FiRotateCcw, FiPlus, 
    FiTrash2, FiAlertTriangle, FiCheck, FiUsers, FiSliders
} from 'react-icons/fi';
import { useTargetCascade, useCascadeRules, useReferenceData } from '../../../../hooks/kpi';
import { useDivisions, useDepartments, useSections, useUnits, useEmployments } from '../../../../hooks/structure';

const normalizeList = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.employments)) return data.employments;
    return [];
};

const LeadCascadeActionModal = ({ node, kpi, year = 2026, onClose, onRefreshTree }) => {
    const { 
        cascadeFromOrg, 
        rollbackOrgCascade, 
        repairCascade, 
        verifyCascadeIntegrity,
        loading,
        submitting
    } = useTargetCascade();

    const { rules } = useCascadeRules();
    const { users } = useReferenceData(['users']);

    const { items: divisions } = useDivisions();
    const { items: departments } = useDepartments();
    const { items: sections } = useSections();
    const { items: units } = useUnits();
    const { items: rawEmployments } = useEmployments();

    const [activeTab, setActiveTab] = useState('cascade'); // 'cascade' | 'verify' | 'rollback'
    const [subEntityType, setSubEntityType] = useState('DEPARTMENT');
    const [selectedRuleId, setSelectedRuleId] = useState('');
    const [allocations, setAllocations] = useState([]);
    const [employments, setEmployments] = useState([]);
    const [statusMessage, setStatusMessage] = useState(null);
    const [confirmRollbackText, setConfirmRollbackText] = useState('');
    const [rollbackError, setRollbackError] = useState(null);

    useEffect(() => {
        if (rules && rules.length > 0) {
            const defRule = rules.find(r => r.is_default) || rules[0];
            setSelectedRuleId(defRule.id);
        }
    }, [rules]);

    useEffect(() => {
        setEmployments(normalizeList(rawEmployments));
    }, [rawEmployments]);

    // Determine default sub-entity type based on current node level
    useEffect(() => {
        if (!node) return;
        const level = (node.level || 'ORGANIZATION').toUpperCase();
        if (level === 'ORGANIZATION') setSubEntityType('DIVISION');
        else if (level === 'DIVISION') setSubEntityType('DEPARTMENT');
        else if (level === 'DEPARTMENT') setSubEntityType('SECTION');
        else if (level === 'SECTION') setSubEntityType('UNIT');
        else setSubEntityType('INDIVIDUAL');
    }, [node]);

    const getAvailableEntities = () => {
        if (subEntityType === 'DIVISION') return normalizeList(divisions);
        if (subEntityType === 'DEPARTMENT') return normalizeList(departments);
        if (subEntityType === 'SECTION') return normalizeList(sections);
        if (subEntityType === 'UNIT') return normalizeList(units);
        return [];
    };

    const addAllocationRow = () => {
        setAllocations([...allocations, { entity_id: '', user_id: '', contribution_percentage: 0 }]);
    };

    const removeAllocationRow = (index) => {
        setAllocations(allocations.filter((_, i) => i !== index));
    };

    const updateAllocationRow = (index, field, value) => {
        const updated = [...allocations];
        updated[index][field] = value;

        if (field === 'entity_id' && value && subEntityType !== 'INDIVIDUAL') {
            const entList = getAvailableEntities();
            const selectedEntity = entList.find(e => String(e.id) === String(value));
            const leaderUserId = selectedEntity?.leader?.user_id || selectedEntity?.manager_id || selectedEntity?.director_id;
            
            if (leaderUserId) {
                updated[index].user_id = leaderUserId;
            } else {
                const levelKey = `${subEntityType.toLowerCase()}_id`;
                const empMatch = employments.find(emp => String(emp[levelKey]) === String(value));
                if (empMatch?.user_id) {
                    updated[index].user_id = empMatch.user_id;
                }
            }
        }
        setAllocations(updated);
    };

    const totalPercentage = allocations.reduce((sum, a) => sum + (parseFloat(a.contribution_percentage) || 0), 0);

    const handleAutoDistribute = () => {
        if (allocations.length === 0) return;
        const equalShare = parseFloat((100 / allocations.length).toFixed(2));
        const updated = allocations.map((a, idx) => ({
            ...a,
            contribution_percentage: idx === allocations.length - 1 
                ? parseFloat((100 - equalShare * (allocations.length - 1)).toFixed(2)) 
                : equalShare
        }));
        setAllocations(updated);
    };

    const handleExecuteCascade = async (e) => {
        e.preventDefault();
        setStatusMessage(null);

        if (!node?.id) {
            setStatusMessage({ type: 'error', text: 'Target node is invalid' });
            return;
        }

        if (allocations.length === 0) {
            setStatusMessage({ type: 'warning', text: 'Please add at least one sub-allocation target' });
            return;
        }

        if (Math.abs(totalPercentage - 100) > 0.01) {
            setStatusMessage({ type: 'error', text: `Total allocation is ${totalPercentage.toFixed(2)}%. It must equal 100.00%` });
            return;
        }

        try {
            const targetsPayload = allocations.map(a => ({
                entity_type: subEntityType,
                entity_id: a.entity_id || a.user_id,
                user_id: a.user_id || a.entity_id,
                parent_target_id: node.id,
                contribution_percentage: parseFloat(a.contribution_percentage)
            }));

            await cascadeFromOrg({
                organization_target: node.id,
                cascade_rule: selectedRuleId,
                targets: targetsPayload
            });

            setStatusMessage({ type: 'success', text: `Successfully cascaded ${targetsPayload.length} sub-targets!` });
            if (onRefreshTree) onRefreshTree();
        } catch (err) {
            console.error('Lead cascade submit error:', err);
            setStatusMessage({ type: 'error', text: err?.message || 'Cascade execution failed.' });
        }
    };

    const handleVerifyIntegrity = async () => {
        setStatusMessage(null);
        if (!node?.id) return;
        try {
            const report = await verifyCascadeIntegrity(node.id);
            if (report?.valid) {
                setStatusMessage({ type: 'success', text: `Split Integrity 100% Valid (Total Contribution: ${report.total_contribution || 100}%)` });
            } else {
                setStatusMessage({ type: 'warning', text: `Integrity Issue: ${report?.issues?.[0]?.reason || 'Sub-target allocation gap detected'}` });
            }
        } catch (err) {
            setStatusMessage({ type: 'error', text: err?.message || 'Integrity check failed' });
        }
    };

    const handleRepairStructure = async () => {
        setStatusMessage(null);
        const kpiId = kpi?.id || node?.kpi_id;
        if (!kpiId) {
            setStatusMessage({ type: 'warning', text: 'KPI context is missing for structural repair' });
            return;
        }
        try {
            const result = await repairCascade(kpiId, year);
            setStatusMessage({ type: 'success', text: `Structure Repaired! Rebuilt ${result.maps_created} cascade maps across ${result.parents} parent nodes.` });
            if (onRefreshTree) onRefreshTree();
        } catch (err) {
            setStatusMessage({ type: 'error', text: err?.message || 'Repair operation failed' });
        }
    };

    const handleExecuteRollback = async () => {
        setRollbackError(null);
        if (confirmRollbackText !== 'ROLLBACK') {
            setRollbackError('Please type "ROLLBACK" to confirm');
            return;
        }
        try {
            await rollbackOrgCascade(node.id);
            setStatusMessage({ type: 'success', text: 'Cascade maps successfully rolled back for this target branch!' });
            if (onRefreshTree) onRefreshTree();
            setTimeout(() => onClose(), 1200);
        } catch (err) {
            setRollbackError(err?.message || 'Rollback failed.');
        }
    };

    const unitStr = node?.unit || kpi?.unit || 'KES';
    const formattedTargetVal = `${unitStr} ${Number(node?.target_value || 0).toLocaleString()}`;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1400,
            backdropFilter: 'blur(5px)',
            padding: '20px'
        }} onClick={onClose}>
            <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                width: '95%',
                maxWidth: '850px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
                overflow: 'hidden'
            }} onClick={(e) => e.stopPropagation()}>
                
                {/* Header */}
                <div style={{
                    padding: '20px 24px',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #334155'
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{
                                padding: '3px 10px',
                                borderRadius: '12px',
                                background: '#2563eb',
                                color: '#ffffff',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                textTransform: 'uppercase'
                            }}>
                                {node?.level || 'NODE'} TARGET
                            </span>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
                                {node?.name || 'Target Node'}
                            </h3>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
                            Target Assigned: <strong style={{ color: '#38bdf8' }}>{formattedTargetVal}</strong> | Lead: {node?.user_name || node?.lead_name || 'Executive Lead'}
                        </p>
                    </div>

                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                        <FiX size={22} />
                    </button>
                </div>

                {/* Status Banner */}
                {statusMessage && (
                    <div style={{
                        padding: '10px 24px',
                        background: statusMessage.type === 'success' ? '#dcfce7' : statusMessage.type === 'warning' ? '#fef3c7' : '#fee2e2',
                        color: statusMessage.type === 'success' ? '#15803d' : statusMessage.type === 'warning' ? '#b45309' : '#b91c1c',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        borderBottom: '1px solid #e2e8f0'
                    }}>
                        {statusMessage.type === 'success' ? <FiCheckCircle size={16} /> : <FiAlertTriangle size={16} />}
                        <span>{statusMessage.text}</span>
                    </div>
                )}

                {/* Navigation Tabs */}
                <div style={{
                    display: 'flex',
                    borderBottom: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    padding: '0 24px'
                }}>
                    <button
                        onClick={() => setActiveTab('cascade')}
                        style={{
                            padding: '12px 18px',
                            border: 'none',
                            borderBottom: activeTab === 'cascade' ? '2px solid #2563eb' : '2px solid transparent',
                            background: 'transparent',
                            color: activeTab === 'cascade' ? '#2563eb' : '#64748b',
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <FiLayers size={16} />
                        Cascade & Sub-Allocate
                    </button>
                    <button
                        onClick={() => setActiveTab('verify')}
                        style={{
                            padding: '12px 18px',
                            border: 'none',
                            borderBottom: activeTab === 'verify' ? '2px solid #2563eb' : '2px solid transparent',
                            background: 'transparent',
                            color: activeTab === 'verify' ? '#2563eb' : '#64748b',
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <FiTool size={16} />
                        Verify & Self-Repair
                    </button>
                    <button
                        onClick={() => setActiveTab('rollback')}
                        style={{
                            padding: '12px 18px',
                            border: 'none',
                            borderBottom: activeTab === 'rollback' ? '2px solid #ef4444' : '2px solid transparent',
                            background: 'transparent',
                            color: activeTab === 'rollback' ? '#ef4444' : '#64748b',
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <FiRotateCcw size={16} />
                        Rollback Target
                    </button>
                </div>

                {/* Tab Content Body */}
                <div style={{ padding: '24px', overflowY: 'auto', flex: 1, background: '#ffffff' }}>
                    {activeTab === 'cascade' && (
                        <form onSubmit={handleExecuteCascade}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                                        Sub-Allocate Target To:
                                    </label>
                                    <select
                                        value={subEntityType}
                                        onChange={(e) => { setSubEntityType(e.target.value); setAllocations([]); }}
                                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                                    >
                                        <option value="DIVISION">Divisions</option>
                                        <option value="DEPARTMENT">Departments</option>
                                        <option value="SECTION">Sections</option>
                                        <option value="UNIT">Units</option>
                                        <option value="INDIVIDUAL">Direct Individual Staff</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                                        Split Rule Strategy:
                                    </label>
                                    <select
                                        value={selectedRuleId}
                                        onChange={(e) => setSelectedRuleId(e.target.value)}
                                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                                    >
                                        {rules.map(r => (
                                            <option key={r.id} value={r.id}>
                                                {r.name} ({r.rule_type})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Sub-Allocations Table */}
                            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                                    Sub-Target Allocations ({allocations.length})
                                </h4>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        type="button"
                                        onClick={handleAutoDistribute}
                                        disabled={allocations.length === 0}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '6px',
                                            border: '1px solid #cbd5e1',
                                            background: '#f8fafc',
                                            color: '#334155',
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        <FiSliders size={13} />
                                        Auto Distribute Equally
                                    </button>
                                    <button
                                        type="button"
                                        onClick={addAllocationRow}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '6px',
                                            border: 'none',
                                            background: '#2563eb',
                                            color: '#ffffff',
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        <FiPlus size={13} />
                                        Add Target Node
                                    </button>
                                </div>
                            </div>

                            {allocations.length === 0 ? (
                                <div style={{
                                    padding: '30px',
                                    borderRadius: '12px',
                                    border: '2px dashed #e2e8f0',
                                    textAlign: 'center',
                                    color: '#64748b',
                                    fontSize: '0.88rem'
                                }}>
                                    No sub-target allocations added yet. Click <strong>"Add Target Node"</strong> to start cascading.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                                    {allocations.map((alloc, idx) => {
                                        const availableEnts = getAvailableEntities();
                                        return (
                                            <div key={idx} style={{
                                                display: 'grid',
                                                gridTemplateColumns: '1.4fr 1.4fr 120px 40px',
                                                gap: '10px',
                                                alignItems: 'center',
                                                background: '#f8fafc',
                                                padding: '10px 14px',
                                                borderRadius: '8px',
                                                border: '1px solid #e2e8f0'
                                            }}>
                                                {/* Entity / User Select */}
                                                <div>
                                                    {subEntityType !== 'INDIVIDUAL' ? (
                                                        <select
                                                            value={alloc.entity_id}
                                                            onChange={(e) => updateAllocationRow(idx, 'entity_id', e.target.value)}
                                                            style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                                                        >
                                                            <option value="">Select {subEntityType.toLowerCase()}...</option>
                                                            {availableEnts.map(e => (
                                                                <option key={e.id} value={e.id}>{e.name} ({e.code || 'Unit'})</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <select
                                                            value={alloc.user_id}
                                                            onChange={(e) => updateAllocationRow(idx, 'user_id', e.target.value)}
                                                            style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                                                        >
                                                            <option value="">Select Staff...</option>
                                                            {users.map(u => (
                                                                <option key={u.id} value={u.id}>{u.get_full_name ? u.get_full_name() : u.email}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </div>

                                                {/* Assigned Lead */}
                                                <div>
                                                    <select
                                                        value={alloc.user_id}
                                                        onChange={(e) => updateAllocationRow(idx, 'user_id', e.target.value)}
                                                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                                                    >
                                                        <option value="">Assign Lead...</option>
                                                        {users.map(u => (
                                                            <option key={u.id} value={u.id}>{u.first_name ? `${u.first_name} ${u.last_name}` : u.email}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Contribution % */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        max="100"
                                                        value={alloc.contribution_percentage}
                                                        onChange={(e) => updateAllocationRow(idx, 'contribution_percentage', e.target.value)}
                                                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}
                                                    />
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>%</span>
                                                </div>

                                                {/* Delete Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => removeAllocationRow(idx)}
                                                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Total Bar */}
                            <div style={{
                                padding: '12px 16px',
                                borderRadius: '8px',
                                background: Math.abs(totalPercentage - 100) < 0.01 ? '#f0fdf4' : '#fef2f2',
                                border: `1px solid ${Math.abs(totalPercentage - 100) < 0.01 ? '#bbf7d0' : '#fecaca'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '20px'
                            }}>
                                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: Math.abs(totalPercentage - 100) < 0.01 ? '#166534' : '#991b1b' }}>
                                    Total Contribution Percentage:
                                </span>
                                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: Math.abs(totalPercentage - 100) < 0.01 ? '#166534' : '#991b1b' }}>
                                    {totalPercentage.toFixed(2)}%
                                </span>
                            </div>

                            {/* Action Submit */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || allocations.length === 0}
                                    style={{
                                        padding: '9px 20px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: '#2563eb',
                                        color: '#ffffff',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <FiCheck size={16} />
                                    {submitting ? 'Executing Cascade...' : 'Save & Cascade Target'}
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'verify' && (
                        <div>
                            <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '20px' }}>
                                Verify mathematical split accuracy across child nodes or self-heal reporting maps if organizational structure changes occurred.
                            </p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={handleVerifyIntegrity}
                                    disabled={loading || submitting}
                                    style={{
                                        padding: '10px 18px',
                                        borderRadius: '8px',
                                        border: '1px solid #0284c7',
                                        background: '#e0f2fe',
                                        color: '#0369a1',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <FiCheckCircle size={16} />
                                    Verify Split Integrity (100%)
                                </button>
                                <button
                                    onClick={handleRepairStructure}
                                    disabled={loading || submitting}
                                    style={{
                                        padding: '10px 18px',
                                        borderRadius: '8px',
                                        border: '1px solid #d97706',
                                        background: '#fef3c7',
                                        color: '#b45309',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <FiTool size={16} />
                                    Repair Structure Maps
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'rollback' && (
                        <div>
                            <div style={{
                                padding: '16px',
                                borderRadius: '10px',
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                color: '#991b1b',
                                marginBottom: '20px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, marginBottom: '6px' }}>
                                    <FiAlertTriangle size={18} />
                                    Danger Zone: Target Rollback
                                </div>
                                <p style={{ margin: 0, fontSize: '0.85rem' }}>
                                    Rolling back will delete downstream target allocations generated under this node and restore original parent target state. This action is irreversible before target lock activation.
                                </p>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                                    Type <strong>ROLLBACK</strong> to confirm:
                                </label>
                                <input
                                    type="text"
                                    value={confirmRollbackText}
                                    onChange={(e) => setConfirmRollbackText(e.target.value)}
                                    placeholder="Type ROLLBACK here"
                                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                                />
                                {rollbackError && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{rollbackError}</span>}
                            </div>

                            <button
                                onClick={handleExecuteRollback}
                                disabled={submitting}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: '#ef4444',
                                    color: '#ffffff',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <FiRotateCcw size={16} />
                                {submitting ? 'Rolling back...' : 'Confirm Rollback'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeadCascadeActionModal;

import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiSave } from 'react-icons/fi';
import { useCascadeRules, useReferenceData } from '../../../../hooks/kpi';
import { useDivisions, useDepartments, useSections, useUnits, useEmployments } from '../../../../hooks/structure';

const normalizeList = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.employments)) return data.employments;
    return [];
};

const CascadeMapping = ({ orgTarget, onCascade, loading }) => {
    const { rules } = useCascadeRules();
    const { users } = useReferenceData(['users']);

    const { items: divisions } = useDivisions();
    const { items: departments } = useDepartments();
    const { items: sections } = useSections();
    const { items: units } = useUnits();
    const { items: rawEmployments } = useEmployments();

    const [targetType, setTargetType] = useState('DEPARTMENT');
    const [selectedRule, setSelectedRule] = useState('');
    const [entities, setEntities] = useState([]);
    const [employments, setEmployments] = useState([]);
    const [allocations, setAllocations] = useState([]);
    const [allocationError, setAllocationError] = useState(null);

    useEffect(() => {
        if (rules && rules.length > 0) {
            const defRule = rules.find(r => r.is_default) || rules[0];
            setSelectedRule(defRule.id);
        }
    }, [rules]);

    useEffect(() => {
        setEmployments(normalizeList(rawEmployments));
    }, [rawEmployments]);

    useEffect(() => {
        if (targetType === 'DIVISION') setEntities(normalizeList(divisions));
        else if (targetType === 'DEPARTMENT') setEntities(normalizeList(departments));
        else if (targetType === 'SECTION') setEntities(normalizeList(sections));
        else if (targetType === 'UNIT') setEntities(normalizeList(units));
        else setEntities([]);
        setAllocations([]);
    }, [targetType, divisions, departments, sections, units]);

    const addAllocation = () => {
        setAllocations([...allocations, { entity_id: '', user_id: '', contribution_percentage: 0 }]);
    };

    const removeAllocation = (index) => {
        setAllocations(allocations.filter((_, i) => i !== index));
    };

    const updateAllocation = (index, field, value) => {
        const updated = [...allocations];
        updated[index][field] = value;

        if (field === 'entity_id' && value && targetType !== 'INDIVIDUAL') {
            const selectedEntity = entities.find(e => String(e.id) === String(value));
            const leaderUserId = selectedEntity?.leader?.user_id || selectedEntity?.manager_id || selectedEntity?.director_id;
            
            if (leaderUserId) {
                updated[index].user_id = leaderUserId;
            } else {
                const levelKey = `${targetType.toLowerCase()}_id`;
                const mgrEmp = employments.find(emp => String(emp[levelKey]) === String(value) && (emp.is_manager || emp.is_executive));
                if (mgrEmp?.user_id) {
                    updated[index].user_id = mgrEmp.user_id;
                } else {
                    const entityEmp = employments.find(emp => String(emp[levelKey]) === String(value));
                    if (entityEmp?.user_id) {
                        updated[index].user_id = entityEmp.user_id;
                    }
                }
            }
        }

        setAllocations(updated);
    };

    const getFilteredUsersForEntity = (entityId) => {
        if (targetType === 'INDIVIDUAL') return users;

        const selectedEntity = entities.find(e => String(e.id) === String(entityId));
        const levelKey = `${targetType.toLowerCase()}_id`;
        
        const matchingEmps = entityId 
            ? employments.filter(emp => String(emp[levelKey]) === String(entityId))
            : employments.filter(emp => emp[levelKey]);

        const leaderUserId = selectedEntity?.leader?.user_id || selectedEntity?.manager_id || selectedEntity?.director_id;

        const userMap = new Map();

        if (leaderUserId) {
            const leaderUser = users.find(u => String(u.id) === String(leaderUserId));
            if (leaderUser) {
                const title = selectedEntity?.leader?.title || 'Lead / Manager';
                userMap.set(String(leaderUser.id), { ...leaderUser, isLead: true, leadTitle: title });
            }
        }

        matchingEmps.forEach(emp => {
            if (!emp.user_id) return;
            const uIdStr = String(emp.user_id);
            const userObj = users.find(u => String(u.id) === uIdStr);
            if (userObj) {
                const existing = userMap.get(uIdStr);
                const isLead = existing ? existing.isLead : (emp.is_manager || emp.is_executive);
                const title = existing?.leadTitle || emp.position_title || (emp.is_manager ? 'Manager' : 'Staff');
                userMap.set(uIdStr, {
                    ...userObj,
                    isLead,
                    leadTitle: title
                });
            }
        });

        let resultUsers = Array.from(userMap.values());

        if (resultUsers.length === 0) {
            resultUsers = users.map(u => ({
                ...u,
                isLead: String(u.id) === String(leaderUserId),
                leadTitle: 'Lead'
            }));
        }

        return resultUsers.sort((a, b) => {
            if (a.isLead && !b.isLead) return -1;
            if (!a.isLead && b.isLead) return 1;
            const nameA = a.first_name ? `${a.first_name} ${a.last_name}` : a.email;
            const nameB = b.first_name ? `${b.first_name} ${b.last_name}` : b.email;
            return nameA.localeCompare(nameB);
        });
    };

    const totalPercentage = allocations.reduce((sum, a) => sum + (parseFloat(a.contribution_percentage) || 0), 0);

    const autoDistribute = () => {
        if (allocations.length === 0) return;
        const equalShare = parseFloat((100 / allocations.length).toFixed(2));
        const updated = allocations.map((a, idx) => ({
            ...a,
            contribution_percentage: idx === allocations.length - 1 
                ? parseFloat((100 - equalShare * (allocations.length - 1)).toFixed(2)) 
                : equalShare
        }));
        setAllocations(updated);
        setAllocationError(null);
    };

    const handleCascade = () => {
        if (!selectedRule) {
            setAllocationError('Please select a Cascade Rule');
            return;
        }
        if (allocations.length === 0) {
            setAllocationError('Please add at least one target allocation row');
            return;
        }
        if (Math.round(totalPercentage) !== 100) {
            setAllocationError(`Total allocation is ${totalPercentage.toFixed(1)}% — it must equal exactly 100%.`);
            return;
        }
        setAllocationError(null);
        const targets = allocations.map(a => ({
            entity_type: targetType,
            entity_id: targetType === 'INDIVIDUAL' ? null : a.entity_id,
            user_id: targetType === 'INDIVIDUAL' ? a.entity_id : a.user_id,
            contribution_percentage: parseFloat(a.contribution_percentage)
        }));
        onCascade({
            organization_target: orgTarget.id,
            cascade_rule: selectedRule,
            targets
        });
    };

    return (
        <div className="kpi-cascade-department">
            <div className="kpi-cascade-department-header">
                <h3>Cascade Target to Sub-levels</h3>
                <div className="kpi-cascade-department-target">
                    Org Target: <strong>{Number(orgTarget?.target_value).toLocaleString()} ({orgTarget?.kpi_name})</strong>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                    <label>Select Cascade Rule *</label>
                    <select value={selectedRule} onChange={(e) => setSelectedRule(e.target.value)}>
                        <option value="">Choose a rule...</option>
                        {rules?.map(r => (
                            <option key={r.id} value={r.id}>{r.name} ({r.rule_type_display})</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Select Target Level *</label>
                    <select value={targetType} onChange={(e) => setTargetType(e.target.value)}>
                        <option value="DIVISION">Division Level</option>
                        <option value="DEPARTMENT">Department Level</option>
                        <option value="SECTION">Section Level</option>
                        <option value="UNIT">Unit Level</option>
                        <option value="INDIVIDUAL">Individual level</option>
                    </select>
                </div>
            </div>

            <div className="kpi-cascade-department-users">
                <div className="kpi-cascade-users-header" style={{ gridTemplateColumns: '2fr 2fr 1fr 40px' }}>
                    <span>Target Node / Entity</span>
                    <span>Representative / Owner</span>
                    <span>Allocation %</span>
                    <span></span>
                </div>
                {allocations.map((alloc, index) => {
                    const filteredUsers = getFilteredUsersForEntity(alloc.entity_id);
                    return (
                        <div key={index} className="kpi-cascade-user-row" style={{ gridTemplateColumns: '2fr 2fr 1fr 40px' }}>
                            {targetType === 'INDIVIDUAL' ? (
                                <select 
                                    value={alloc.entity_id}
                                    onChange={(e) => updateAllocation(index, 'entity_id', e.target.value)}
                                >
                                    <option value="">Select User...</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.first_name ? `${u.first_name} ${u.last_name}` : u.email}</option>
                                    ))}
                                </select>
                            ) : (
                                <select 
                                    value={alloc.entity_id}
                                    onChange={(e) => updateAllocation(index, 'entity_id', e.target.value)}
                                >
                                    <option value="">Select Entity ({targetType})...</option>
                                    {entities.map(e => (
                                        <option key={e.id} value={e.id}>{e.name} ({e.code})</option>
                                    ))}
                                </select>
                            )}

                            {targetType === 'INDIVIDUAL' ? (
                                <div style={{ color: 'var(--kpi-gray-500)', fontSize: '0.85rem' }}>Same as Target Node</div>
                            ) : (
                                <select 
                                    value={alloc.user_id}
                                    onChange={(e) => updateAllocation(index, 'user_id', e.target.value)}
                                >
                                    <option value="">Select Owner / Manager...</option>
                                    {filteredUsers.map(u => (
                                        <option key={u.id} value={u.id}>
                                            {u.isLead ? '⭐ ' : ''}
                                            {u.first_name ? `${u.first_name} ${u.last_name}` : u.email}
                                            {u.isLead ? ` (${u.leadTitle || 'Lead'})` : ''}
                                        </option>
                                    ))}
                                </select>
                            )}

                            <input 
                                type="number"
                                min="0"
                                max="100"
                                value={alloc.contribution_percentage}
                                onChange={(e) => updateAllocation(index, 'contribution_percentage', parseFloat(e.target.value) || 0)}
                            />
                            <button onClick={() => removeAllocation(index)}>
                                <FiTrash2 size={14} />
                            </button>
                        </div>
                    );
                })}

                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <button className="kpi-cascade-add-user" onClick={addAllocation}>
                        <FiPlus size={14} />
                        Add Target Allocation Row
                    </button>
                    {allocations.length > 0 && (
                        <button 
                            type="button"
                            onClick={autoDistribute}
                            style={{
                                padding: '8px 14px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                background: '#f8fafc',
                                color: '#2563eb',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                cursor: 'pointer'
                            }}
                        >
                            ⚡ Auto-Distribute 100% Equal Split
                        </button>
                    )}
                </div>
                <div className="kpi-cascade-total" style={{ marginTop: '12px', fontWeight: 600, color: totalPercentage === 100 ? '#16a34a' : '#dc2626' }}>
                    Total Allocated: {totalPercentage.toFixed(1)}% {totalPercentage !== 100 && '(Must equal 100%)'}
                </div>
            </div>

            <div className="kpi-cascade-actions">
                {allocationError && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        color: 'var(--kpi-danger)', fontSize: '0.85rem',
                        marginBottom: '0.5rem', fontWeight: 600
                    }}>
                        ⚠️ {allocationError}
                    </div>
                )}
                <button
                    className="kpi-cascade-submit"
                    onClick={handleCascade}
                    disabled={loading}
                    style={{
                        opacity: loading ? 0.7 : 1,
                        cursor: 'pointer',
                        background: '#16a34a'
                    }}
                >
                    <FiSave size={14} />
                    {loading ? 'Cascading...' : 'Cascade Targets'}
                </button>
            </div>
        </div>
    );
};

export default CascadeMapping;
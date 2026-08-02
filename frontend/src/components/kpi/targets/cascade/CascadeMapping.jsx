import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiSave } from 'react-icons/fi';
import { useCascadeRules, useReferenceData } from '../../../../hooks/kpi';
import { divisionService, departmentService, sectionService, unitService } from '../../../../services/structure';

const normalizeList = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.data)) return data.data;
    return [];
};

const CascadeMapping = ({ orgTarget, onCascade, loading }) => {
    const { rules } = useCascadeRules();
    const { users } = useReferenceData(['users']);

    const [targetType, setTargetType] = useState('DEPARTMENT');
    const [selectedRule, setSelectedRule] = useState('');
    const [entities, setEntities] = useState([]);
    const [allocations, setAllocations] = useState([]);
    const [allocationError, setAllocationError] = useState(null);

    useEffect(() => {
        if (rules && rules.length > 0) {
            const defRule = rules.find(r => r.is_default) || rules[0];
            setSelectedRule(defRule.id);
        }
    }, [rules]);

    useEffect(() => {
        const loadEntities = async () => {
            try {
                let data;
                if (targetType === 'DIVISION') data = await divisionService.list({ is_active: true });
                else if (targetType === 'DEPARTMENT') data = await departmentService.list({ is_active: true });
                else if (targetType === 'SECTION') data = await sectionService.list({ is_active: true });
                else if (targetType === 'UNIT') data = await unitService.list({ is_active: true });
                setEntities(normalizeList(data));
            } catch (err) {
                console.error(err);
                setEntities([]);
            }
        };
        if (targetType !== 'INDIVIDUAL') loadEntities();
        setAllocations([]);
    }, [targetType]);

    const addAllocation = () => {
        setAllocations([...allocations, { entity_id: '', user_id: '', contribution_percentage: 0 }]);
    };

    const removeAllocation = (index) => {
        setAllocations(allocations.filter((_, i) => i !== index));
    };

    const updateAllocation = (index, field, value) => {
        const updated = [...allocations];
        updated[index][field] = value;
        setAllocations(updated);
    };

    const totalPercentage = allocations.reduce((sum, a) => sum + (parseFloat(a.contribution_percentage) || 0), 0);

    const handleCascade = () => {
        if (totalPercentage !== 100) {
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
                    Org Target: <strong>{orgTarget?.target_value} ({orgTarget?.kpi_name})</strong>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                    <label>Select Cascade Rule</label>
                    <select value={selectedRule} onChange={(e) => setSelectedRule(e.target.value)}>
                        <option value="">Choose a rule...</option>
                        {rules?.map(r => (
                            <option key={r.id} value={r.id}>{r.name} ({r.rule_type_display})</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Select Target Level</label>
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
                {allocations.map((alloc, index) => (
                    <div key={index} className="kpi-cascade-user-row" style={{ gridTemplateColumns: '2fr 2fr 1fr 40px' }}>
                        {targetType === 'INDIVIDUAL' ? (
                            <select 
                                value={alloc.entity_id}
                                onChange={(e) => updateAllocation(index, 'entity_id', e.target.value)}
                            >
                                <option value="">Select User...</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                                ))}
                            </select>
                        ) : (
                            <select 
                                value={alloc.entity_id}
                                onChange={(e) => updateAllocation(index, 'entity_id', e.target.value)}
                            >
                                <option value="">Select Entity...</option>
                                {entities.map(e => (
                                    <option key={e.id} value={e.id}>{e.name}</option>
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
                                <option value="">Select Owner...</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.full_name}</option>
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
                ))}

                <button className="kpi-cascade-add-user" onClick={addAllocation}>
                    <FiPlus size={14} />
                    Add Target Allocation Row
                </button>
                <div className="kpi-cascade-total">
                    Total Allocated: {totalPercentage}% {totalPercentage !== 100 && '(Must equal 100%)'}
                </div>
            </div>

            <div className="kpi-cascade-actions">
                {allocationError && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        color: 'var(--kpi-danger)', fontSize: '0.85rem',
                        marginBottom: '0.5rem'
                    }}>
                        ⚠️ {allocationError}
                    </div>
                )}
                <button
                    className="kpi-cascade-submit"
                    onClick={handleCascade}
                    disabled={totalPercentage !== 100 || !selectedRule || loading}
                >
                    <FiSave size={14} />
                    {loading ? 'Cascading...' : 'Cascade Targets'}
                </button>
            </div>
        </div>
    );
};

export default CascadeMapping;
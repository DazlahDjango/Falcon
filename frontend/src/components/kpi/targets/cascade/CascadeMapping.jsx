import React, { useState } from 'react';
import { FiArrowRight, FiSave } from 'react-icons/fi';

const CascadeMapping = ({ orgTarget, departments, users, onCascade, loading }) => {
    const [selectedDept, setSelectedDept] = useState(null);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [weights, setWeights] = useState({});

    const handleCascade = () => {
        onCascade({
            deptTargetId: selectedDept,
            userIds: selectedUsers,
            weights
        });
    };

    return (
        <div className="kpi-cascade-mapping">
            <div className="kpi-cascade-step">
                <div className="kpi-cascade-step-number">1</div>
                <div className="kpi-cascade-step-content">
                    <h4>Organization Target</h4>
                    <div className="kpi-cascade-target-info">
                        <strong>{orgTarget?.kpi_name}</strong>
                        <span>Target: {orgTarget?.target_value}</span>
                    </div>
                </div>
            </div>
            
            <FiArrowRight className="kpi-cascade-arrow" />
            
            <div className="kpi-cascade-step">
                <div className="kpi-cascade-step-number">2</div>
                <div className="kpi-cascade-step-content">
                    <h4>Select Department</h4>
                    <select 
                        className="kpi-cascade-select"
                        value={selectedDept || ''}
                        onChange={(e) => setSelectedDept(e.target.value)}
                    >
                        <option value="">Choose department...</option>
                        {departments?.map(dept => (
                            <option key={dept.id} value={dept.id}>
                                {dept.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            
            <FiArrowRight className="kpi-cascade-arrow" />
            
            <div className="kpi-cascade-step">
                <div className="kpi-cascade-step-number">3</div>
                <div className="kpi-cascade-step-content">
                    <h4>Select Team Members</h4>
                    <select 
                        multiple
                        className="kpi-cascade-select-multiple"
                        value={selectedUsers}
                        onChange={(e) => {
                            const options = Array.from(e.target.selectedOptions, option => option.value);
                            setSelectedUsers(options);
                        }}
                    >
                        {users?.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.full_name} ({user.email})
                            </option>
                        ))}
                    </select>
                    <div className="hint">Hold Ctrl/Cmd to select multiple</div>
                </div>
            </div>
            
            <div className="kpi-cascade-actions">
                <button 
                    className="kpi-cascade-submit"
                    onClick={handleCascade}
                    disabled={!selectedDept || loading}
                >
                    <FiSave size={14} />
                    {loading ? 'Cascading...' : 'Cascade Targets'}
                </button>
            </div>
        </div>
    );
};

export default CascadeMapping;
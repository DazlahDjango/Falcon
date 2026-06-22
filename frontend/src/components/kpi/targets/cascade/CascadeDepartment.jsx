import React, { useState } from 'react';
import { FiSave, FiPlus, FiTrash2 } from 'react-icons/fi';

const CascadeDepartment = ({ deptTarget, users, onCascade, loading }) => {
    const [userAllocations, setUserAllocations] = useState([]);
    const [totalPercentage, setTotalPercentage] = useState(0);

    const addUser = () => {
        setUserAllocations([...userAllocations, { userId: '', percentage: 0 }]);
    };

    const removeUser = (index) => {
        const newAllocations = userAllocations.filter((_, i) => i !== index);
        setUserAllocations(newAllocations);
        updateTotal(newAllocations);
    };

    const updateUser = (index, field, value) => {
        const newAllocations = [...userAllocations];
        newAllocations[index][field] = value;
        setUserAllocations(newAllocations);
        updateTotal(newAllocations);
    };

    const updateTotal = (allocations) => {
        const total = allocations.reduce((sum, a) => sum + (parseFloat(a.percentage) || 0), 0);
        setTotalPercentage(total);
    };

    const handleCascade = () => {
        if (totalPercentage !== 100) {
            alert('Total percentage must equal 100%');
            return;
        }
        const weights = {};
        userAllocations.forEach(a => {
            weights[a.userId] = a.percentage;
        });
        onCascade({ userIds: userAllocations.map(a => a.userId), weights });
    };

    return (
        <div className="kpi-cascade-department">
            <div className="kpi-cascade-department-header">
                <h3>Cascade to Team Members</h3>
                <div className="kpi-cascade-department-target">
                    Department Target: <strong>{deptTarget?.target_value}</strong>
                </div>
            </div>
            
            <div className="kpi-cascade-department-users">
                <div className="kpi-cascade-users-header">
                    <span>Team Member</span>
                    <span>Allocation %</span>
                    <span></span>
                </div>
                {userAllocations.map((alloc, index) => (
                    <div key={index} className="kpi-cascade-user-row">
                        <select 
                            value={alloc.userId}
                            onChange={(e) => updateUser(index, 'userId', e.target.value)}
                        >
                            <option value="">Select user...</option>
                            {users?.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.full_name}
                                </option>
                            ))}
                        </select>
                        <input 
                            type="number"
                            step="1"
                            min="0"
                            max="100"
                            value={alloc.percentage}
                            onChange={(e) => updateUser(index, 'percentage', parseFloat(e.target.value))}
                        />
                        <button onClick={() => removeUser(index)}>
                            <FiTrash2 size={14} />
                        </button>
                    </div>
                ))}
                <button className="kpi-cascade-add-user" onClick={addUser}>
                    <FiPlus size={14} />
                    Add Team Member
                </button>
                <div className="kpi-cascade-total">
                    Total: {totalPercentage}% {totalPercentage !== 100 && '(Must equal 100%)'}
                </div>
            </div>
            
            <div className="kpi-cascade-actions">
                <button 
                    className="kpi-cascade-submit"
                    onClick={handleCascade}
                    disabled={totalPercentage !== 100 || loading}
                >
                    <FiSave size={14} />
                    {loading ? 'Cascading...' : 'Cascade to Team'}
                </button>
            </div>
        </div>
    );
};

export default CascadeDepartment;
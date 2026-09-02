import React from 'react';
import { FiEdit2, FiLock } from 'react-icons/fi';

const MonthlyPhasingTable = ({ phasing, onValueChange, canEdit, monthlyValues, onChange, readOnly }) => {
    const items = phasing || monthlyValues || [];
    const editable = canEdit !== undefined ? canEdit : (!readOnly);

    const handleSingleValueChange = (monthNum, val) => {
        const numVal = isNaN(val) ? 0 : val;
        if (onValueChange) {
            onValueChange(monthNum, numVal);
        } else if (onChange) {
            const updated = items.map(p => p.month === monthNum ? { ...p, target_value: numVal } : p);
            onChange(updated);
        }
    };

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
        <div className="kpi-phasing-table-container">
            <table className="kpi-phasing-table">
                <thead>
                    <tr>
                        <th>Month</th>
                        <th>Target Value</th>
                        <th>% of Annual</th>
                        <th>Cumulative</th>
                        {editable && <th>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {months.map((month, index) => {
                        const monthNum = index + 1;
                        const phasingItem = items.find(p => p.month === monthNum);
                        const value = Number(phasingItem?.target_value || 0);
                        const total = items.reduce((sum, p) => sum + Number(p.target_value || 0), 0) || 1;
                        const percentage = total > 0 ? (value / total) * 100 : 0;
                        const cumulative = items.slice(0, index + 1).reduce((sum, p) => sum + Number(p.target_value || 0), 0) || 0;
                        
                        return (
                            <tr key={monthNum}>
                                <td>{month}</td>
                                <td>
                                    {editable && !phasingItem?.is_locked ? (
                                        <input 
                                            type="number"
                                            className="kpi-phasing-input"
                                            value={value}
                                            onChange={(e) => handleSingleValueChange(monthNum, parseFloat(e.target.value))}
                                            step="0.01"
                                        />
                                    ) : (
                                        <span className={phasingItem?.is_locked ? 'locked' : ''}>
                                            {value}
                                            {phasingItem?.is_locked && <FiLock size={12} className="lock-icon" />}
                                        </span>
                                    )}
                                </td>
                                <td>{Number(percentage || 0).toFixed(1)}%</td>
                                <td>{Number(cumulative || 0).toFixed(2)}</td>
                                {canEdit && (
                                    <td>
                                        {!phasingItem?.is_locked && (
                                            <FiEdit2 size={14} className="edit-icon" />
                                        )}
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default MonthlyPhasingTable;
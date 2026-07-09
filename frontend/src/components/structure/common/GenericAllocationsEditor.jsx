import React from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import ParentUnitSelect from '../common/ParentUnitSelect';

const GenericAllocationsEditor = ({ allocations, onChange, disabled }) => {
  const handleAdd = () => {
    onChange([...(allocations || []), { model_name: 'department', object_id: '', allocation_percentage: 100 }]);
  };

  const handleRemove = (index) => {
    const newAllocations = [...(allocations || [])];
    newAllocations.splice(index, 1);
    onChange(newAllocations);
  };

  const handleChange = (index, field, value) => {
    const newAllocations = [...(allocations || [])];
    newAllocations[index] = { ...newAllocations[index], [field]: value };
    
    // Auto-adjust percentages if one is changed to something < 100
    if (field === 'allocation_percentage') {
      const total = newAllocations.reduce((sum, a, i) => i !== index ? sum + Number(a.allocation_percentage || 0) : sum, 0);
      const val = Number(value);
      if (total + val > 100) {
         // Could adjust others here, but let's just let validation handle it or just set it
      }
    }
    
    onChange(newAllocations);
  };

  return (
    <div className="allocations-editor">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4>Budget Allocations</h4>
        <button type="button" onClick={handleAdd} disabled={disabled} className="btn btn-sm btn-outline">
          <FiPlus /> Add Allocation
        </button>
      </div>
      
      {(!allocations || allocations.length === 0) ? (
        <p className="form-hint" style={{ fontStyle: 'italic', color: '#666' }}>No allocations set. The cost center will be independent.</p>
      ) : (
        <table className="table" style={{ width: '100%', marginBottom: '1rem' }}>
          <thead>
            <tr>
              <th>Type</th>
              <th>Unit</th>
              <th>Percentage (%)</th>
              <th style={{ width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {allocations.map((alloc, index) => (
              <tr key={index}>
                <td>
                  <select 
                    value={alloc.model_name} 
                    onChange={(e) => handleChange(index, 'model_name', e.target.value)}
                    disabled={disabled}
                    className="form-control"
                    style={{ padding: '0.25rem' }}
                  >
                    <option value="division">Division</option>
                    <option value="department">Department</option>
                    <option value="section">Section</option>
                    <option value="unit">Unit</option>
                  </select>
                </td>
                <td>
                  <ParentUnitSelect
                    value={alloc.object_id}
                    onChange={(v) => handleChange(index, 'object_id', v)}
                    parentLevel={alloc.model_name}
                    placeholder={`Select ${alloc.model_name}`}
                    disabled={disabled}
                    className="form-control"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={alloc.allocation_percentage}
                    onChange={(e) => handleChange(index, 'allocation_percentage', e.target.value)}
                    disabled={disabled}
                    className="form-control"
                    style={{ padding: '0.25rem' }}
                  />
                </td>
                <td>
                  <button type="button" onClick={() => handleRemove(index)} disabled={disabled} className="btn btn-sm btn-icon text-danger" style={{ background: 'transparent', border: 'none' }}>
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      {allocations && allocations.length > 0 && (
        <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
          Total: {allocations.reduce((sum, a) => sum + Number(a.allocation_percentage || 0), 0).toFixed(2)}%
          {allocations.reduce((sum, a) => sum + Number(a.allocation_percentage || 0), 0) > 100 && (
            <span style={{ color: 'red', marginLeft: '10px' }}>(Exceeds 100%!)</span>
          )}
        </div>
      )}
    </div>
  );
};

export default GenericAllocationsEditor;

import React, { useState } from 'react';
import { Save, X, AlertCircle } from 'lucide-react';

const AllocationEditor = ({ allocations, totalBudget, onSave, onCancel, className = '' }) => {
  const [localAllocations, setLocalAllocations] = useState(
    allocations.map(a => ({ ...a, percentage: a.percentage || 0 }))
  );
  const [error, setError] = useState('');
  const totalPercentage = localAllocations.reduce((sum, a) => sum + a.percentage, 0);
  const isValid = Math.abs(totalPercentage - 100) <= 0.01;
  const handlePercentageChange = (id, value) => {
    const numValue = Math.min(100, Math.max(0, parseFloat(value) || 0));
    setLocalAllocations(prev => prev.map(a => 
      a.id === id ? { ...a, percentage: numValue } : a
    ));
    const newTotal = localAllocations.reduce((sum, a) => 
      sum + (a.id === id ? numValue : a.percentage), 0
    );
    if (Math.abs(newTotal - 100) > 0.01) {
      setError(`Total allocation must equal 100%. Current: ${newTotal}%`);
    } else {
      setError('');
    }
  };
  const getAmount = (percentage) => {
    return totalBudget ? (totalBudget * (percentage / 100)).toLocaleString() : 0;
  };

  return (
    <div className={`allocation-editor bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Allocation Editor</h4>
        <div className="flex items-center gap-2">
          <button onClick={onCancel} className="p-1 text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {localAllocations.map((allocation) => (
          <div key={allocation.id} className="allocation-row">
            <div className="flex-1">
              <div className="font-medium text-sm">{allocation.name}</div>
              <div className="text-xs text-gray-400">{allocation.code}</div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={allocation.percentage}
                onChange={(e) => handlePercentageChange(allocation.id, e.target.value)}
                className="allocation-slider w-32"
              />
              <input
                type="number"
                min="0"
                max="100"
                step="5"
                value={allocation.percentage}
                onChange={(e) => handlePercentageChange(allocation.id, e.target.value)}
                className="w-16 px-2 py-1 border border-gray-300 rounded-md text-sm text-center"
              />
              <span className="allocation-percentage">%</span>
            </div>
            <div className="text-xs text-gray-400 w-24 text-right">
              {getAmount(allocation.percentage)}
            </div>
          </div>
        ))}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Total</span>
            <span className={`font-mono ${isValid ? 'text-green-600' : 'text-red-600'}`}>
              {totalPercentage}%
            </span>
          </div>
          {error && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-red-600 text-xs">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(localAllocations)}
          disabled={!isValid}
          className="px-3 py-1.5 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
        >
          <Save size={14} /> Save Allocations
        </button>
      </div>
    </div>
  );
};
export default AllocationEditor;
import React, { useState } from 'react';
import { Plus, X, Save, AlertCircle } from 'lucide-react';
import EmployeeAvatar from '../common/EmployeeAvatar';
import ReportingBadge from '../common/ReportingBadge';
import ReportingWeightSlider from './ReportingWeightSlider';

const DottedLineManager = ({ employee, dottedLines, availableManagers, onAdd, onRemove, onUpdateWeight, className = '' }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [selectedWeight, setSelectedWeight] = useState(0.3);
  const [error, setError] = useState('');
  const handleAdd = async () => {
    if (!selectedManagerId) {
      setError('Please select a manager');
      return;
    }
    const totalWeight = [...dottedLines, { reporting_weight: selectedWeight }].reduce((sum, l) => sum + (l.reporting_weight || 0), 0);
    if (totalWeight > 1) {
      setError('Total reporting weight cannot exceed 100%');
      return;
    }
    setError('');
    await onAdd(selectedManagerId, selectedWeight);
    setIsAdding(false);
    setSelectedManagerId('');
    setSelectedWeight(0.3);
  };
  const availableManagersList = availableManagers?.filter(
    m => !dottedLines?.some(dl => dl.manager_user_id === m.user_id)
  );
  if (!employee) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {dottedLines && dottedLines.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Current Dotted Line Managers</h4>
          {dottedLines.map((line, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <EmployeeAvatar user={line.manager} size="sm" />
                <div>
                  <div className="font-medium text-sm">{line.manager?.name || line.manager_user_id}</div>
                  <div className="text-xs text-gray-500">{line.manager?.position_title}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ReportingWeightSlider
                  value={line.reporting_weight}
                  onChange={(weight) => onUpdateWeight(line.id, weight)}
                  size="sm"
                />
                <button
                  onClick={() => onRemove(line.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Add New Dotted Line Manager */}
      {!isAdding ? (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center justify-center gap-2 p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
        >
          <Plus size={16} />
          <span className="text-sm">Add Dotted Line Manager</span>
        </button>
      ) : (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-blue-800">Add Dotted Line Manager</h4>
            <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>
          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-red-600 text-xs">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}
          <select
            value={selectedManagerId}
            onChange={(e) => setSelectedManagerId(e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm mb-3"
          >
            <option value="">Select a manager...</option>
            {availableManagersList?.map(manager => (
              <option key={manager.user_id} value={manager.user_id}>
                {manager.name || manager.user_id} - {manager.position_title}
              </option>
            ))}
          </select>
          <div className="mb-3">
            <label className="block text-xs text-gray-600 mb-1">Reporting Weight</label>
            <ReportingWeightSlider
              value={selectedWeight}
              onChange={setSelectedWeight}
              size="md"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!selectedManagerId}
            className="w-full py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save size={14} /> Add Manager
          </button>
        </div>
      )}
    </div>
  );
};
export default DottedLineManager;
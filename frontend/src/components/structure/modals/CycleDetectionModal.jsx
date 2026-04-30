import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle, RotateCcw, GitBranch } from 'lucide-react';

const CycleDetectionModal = ({ isOpen, onClose, cycles, onRepair, isRepairing = false, className = '' }) => {
  const [selectedCycles, setSelectedCycles] = useState([]);
  if (!isOpen) return null;
  const hasCycles = cycles && (cycles.department_cycles > 0 || cycles.team_cycles > 0);
  const handleToggleCycle = (cycleId) => {
    setSelectedCycles(prev =>
      prev.includes(cycleId) ? prev.filter(id => id !== cycleId) : [...prev, cycleId]
    );
  };
  const handleSelectAll = () => {
    const allCycleIds = [
      ...(cycles?.department_cycle_details?.map(c => `dept_${c.id}`) || []),
      ...(cycles?.team_cycle_details?.map(c => `team_${c.id}`) || []),
    ];
    if (selectedCycles.length === allCycleIds.length) {
      setSelectedCycles([]);
    } else {
      setSelectedCycles(allCycleIds);
    }
  };
  const handleRepair = () => {
    onRepair(selectedCycles);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-container modal-container-lg ${className}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-2 text-red-600">
            <GitBranch size={18} />
            <h3 className="text-lg font-semibold">Circular Reference Detection</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          {!hasCycles ? (
            <div className="text-center py-8">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
              <h4 className="text-lg font-medium text-gray-900">No Cycles Detected</h4>
              <p className="text-gray-500 mt-1">Your organizational hierarchy is healthy</p>
            </div>
          ) : (
            <>
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
                <div className="text-sm text-red-800">
                  <p className="font-medium">Circular references detected in hierarchy</p>
                  <p className="mt-1">These cycles can cause infinite loops in reporting chains.</p>
                </div>
              </div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-gray-700">
                  {cycles.department_cycles} Department Cycles | {cycles.team_cycles} Team Cycles
                </div>
                <button onClick={handleSelectAll} className="text-xs text-blue-600 hover:text-blue-700">
                  {selectedCycles.length === (cycles.department_cycles + cycles.team_cycles) ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {/* Department Cycles */}
                {cycles.department_cycle_details?.map(cycle => (
                  <div key={`dept_${cycle.id}`} className="p-3 bg-white border border-red-200 rounded-lg">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCycles.includes(`dept_${cycle.id}`)}
                        onChange={() => handleToggleCycle(`dept_${cycle.id}`)}
                        className="mt-0.5 rounded"
                      />
                      <div className="flex-1">
                        <div className="font-mono text-sm font-medium">Department: {cycle.id}</div>
                        <div className="text-xs text-gray-500 mt-1 break-all">{cycle.path}</div>
                      </div>
                    </label>
                  </div>
                ))}
                {/* Team Cycles */}
                {cycles.team_cycle_details?.map(cycle => (
                  <div key={`team_${cycle.id}`} className="p-3 bg-white border border-red-200 rounded-lg">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCycles.includes(`team_${cycle.id}`)}
                        onChange={() => handleToggleCycle(`team_cycle.id`)}
                        className="mt-0.5 rounded"
                      />
                      <div className="flex-1">
                        <div className="font-mono text-sm font-medium">Team: {cycle.id}</div>
                        <div className="text-xs text-gray-500 mt-1 break-all">{cycle.path}</div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="modal-footer">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            disabled={isRepairing}
          >
            Close
          </button>
          {hasCycles && (
            <button
              onClick={handleRepair}
              disabled={selectedCycles.length === 0 || isRepairing}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
            >
              <RotateCcw size={14} />
              {isRepairing ? 'Repairing...' : `Repair (${selectedCycles.length})`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default CycleDetectionModal;
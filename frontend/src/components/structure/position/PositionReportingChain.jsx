import React from 'react';
import { ChevronRight, User } from 'lucide-react';

const PositionReportingChain = ({ managers, subordinates, onSelectPosition, className = '' }) => {
  const renderChainNode = (position, isManager = true) => {
    if (!position) return null;
    return (
      <div
        className="chain-node cursor-pointer hover:bg-gray-50 rounded px-2 py-1"
        onClick={() => onSelectPosition?.(position.id)}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
            <User size={12} className="text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-sm">{position.title}</div>
            <div className="text-xs text-gray-500">{position.job_code}</div>
          </div>
        </div>
        {isManager && managers && managers.length > 0 && (
          <ChevronRight size={14} className="text-gray-400 ml-auto" />
        )}
      </div>
    );
  };

  return (
    <div className={`position-reporting-chain ${className}`}>
      {managers && managers.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-medium text-gray-500 mb-2">Reporting To</div>
          <div className="space-y-1">
            {managers.map(manager => renderChainNode(manager, true))}
          </div>
        </div>
      )}
      <div className="my-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
        {renderChainNode({ title: 'Current Position', job_code: '-' }, false)}
      </div>
      {subordinates && subordinates.length > 0 && (
        <div className="mt-4">
          <div className="text-xs font-medium text-gray-500 mb-2">Direct Reports</div>
          <div className="space-y-1">
            {subordinates.map(sub => renderChainNode(sub, false))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionReportingChain;
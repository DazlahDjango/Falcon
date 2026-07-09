import React from 'react';
import { Layers, Users } from 'lucide-react';

const UnitCard = ({ unit, onClick, className = '' }) => {
  if (!unit) return null;

  return (
    <div 
      className={`unit-card bg-white border border-gray-200 rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:border-green-500 cursor-pointer ${className}`} 
      onClick={() => onClick?.(unit)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            <span className="font-mono">{unit.code}</span>
            {unit.name && <span>•</span>}
            <span>{unit.name}</span>
          </span>
          {unit.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{unit.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unit.is_active ? (
            <span className="w-2 h-2 rounded-full bg-green-500" title="Active" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-red-500" title="Inactive" />
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Users size={14} className="text-gray-400" />
          <span className="font-medium">{unit.headcount || 0}</span>
          <span className="text-gray-500">employees</span>
        </div>
        {unit.headcount_limit && (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Layers size={14} className="text-gray-400" />
            <span className="text-gray-500">Limit:</span>
            <span className="font-medium">{unit.headcount_limit}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnitCard;

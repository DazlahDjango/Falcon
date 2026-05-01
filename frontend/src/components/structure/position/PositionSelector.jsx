import React, { useState } from 'react';
import { ChevronDown, Briefcase } from 'lucide-react';

const PositionSelector = ({ value, onChange, positions, placeholder = 'Select position', className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectedPosition = positions?.find(p => p.id === value);
  const filteredPositions = positions?.filter(pos =>
    pos.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pos.job_code.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleSelect = (position) => {
    onChange(position.id);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="flex items-center gap-2">
          <Briefcase size={14} className="text-gray-400" />
          <span className={selectedPosition ? 'text-gray-900' : 'text-gray-500'}>
            {selectedPosition ? `${selectedPosition.job_code} - ${selectedPosition.title}` : placeholder}
          </span>
        </div>
        <ChevronDown size={16} className="text-gray-400" />
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="p-2 border-b">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or code..."
              className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredPositions?.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">No positions found</div>
            ) : (
              filteredPositions?.map(pos => (
                <div
                  key={pos.id}
                  onClick={() => handleSelect(pos)}
                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                >
                  <div className="font-medium">{pos.title}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <span className="font-mono">{pos.job_code}</span>
                    <span>• Level {pos.level}</span>
                    {pos.grade && <span>• Grade {pos.grade}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default PositionSelector;
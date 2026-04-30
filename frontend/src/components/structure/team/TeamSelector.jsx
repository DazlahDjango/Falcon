import React, { useState, useEffect } from 'react';
import { ChevronDown, Users } from 'lucide-react';

const TeamSelector = ({ value, onChange, teams, placeholder = 'Select team', disabled = false, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectedTeam = teams?.find(t => t.id === value);
  const filteredTeams = teams?.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.code.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleSelect = (team) => {
    onChange(team.id);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : ''
        }`}
      >
        <div className="flex items-center gap-2">
          <Users size={14} className="text-gray-400" />
          <span className={selectedTeam ? 'text-gray-900' : 'text-gray-500'}>
            {selectedTeam ? `${selectedTeam.code} - ${selectedTeam.name}` : placeholder}
          </span>
        </div>
        <ChevronDown size={16} className="text-gray-400" />
      </button>
      {isOpen && !disabled && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="p-2 border-b">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search teams..."
              className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredTeams?.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">No teams found</div>
            ) : (
              filteredTeams?.map(team => (
                <div
                  key={team.id}
                  onClick={() => handleSelect(team)}
                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm border-b last:border-b-0"
                >
                  <div className="font-medium">{team.name}</div>
                  <div className="text-xs text-gray-500">{team.code}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamSelector;
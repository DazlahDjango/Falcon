import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const DepartmentSelector = ({ value, onChange, departments, placeholder = 'Select department', className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectedDepartment = departments?.find(d => d.id === value);
  const filteredDepartments = departments?.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.code.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleSelect = (department) => {
    onChange(department.id);
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
        <span className={selectedDepartment ? 'text-gray-900' : 'text-gray-500'}>
          {selectedDepartment ? `${selectedDepartment.code} - ${selectedDepartment.name}` : placeholder}
        </span>
        <ChevronDown size={16} className="text-gray-400" />
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="p-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search departments..."
              className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredDepartments?.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">No departments found</div>
            ) : (
              filteredDepartments?.map(dept => (
                <div
                  key={dept.id}
                  onClick={() => handleSelect(dept)}
                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                >
                  <div className="font-medium">{dept.name}</div>
                  <div className="text-xs text-gray-500">{dept.code}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentSelector;
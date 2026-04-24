import React from 'react';

const DepartmentCard = ({ department, onEdit, onDelete, onViewSubDepartments }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="text-md font-semibold text-gray-900">{department.name}</h3>
            {department.code && (
              <span className="text-xs text-gray-500">({department.code})</span>
            )}
          </div>
          {department.description && (
            <p className="text-sm text-gray-500 mt-1">{department.description}</p>
          )}
          <div className="mt-2 flex items-center space-x-3 text-xs text-gray-400">
            {department.manager_name && (
              <span>👤 Manager: {department.manager_name}</span>
            )}
            {department.parent_name && (
              <span>📁 Parent: {department.parent_name}</span>
            )}
          </div>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => onViewSubDepartments(department)}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="View Sub-departments"
          >
            📁
          </button>
          <button
            onClick={() => onEdit(department)}
            className="p-1 text-indigo-600 hover:text-indigo-800"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(department)}
            className="p-1 text-red-600 hover:text-red-800"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepartmentCard;
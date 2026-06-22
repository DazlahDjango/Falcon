// src/components/reviews/cycles/create/CycleDepartmentSelector.jsx
import React from 'react';
import { useDepartments } from '../../../../hooks/structure';
import { CheckSquare, Square } from 'lucide-react';

const CycleDepartmentSelector = ({ selected = [], includeAll = true, onChange }) => {
  const { data: departmentsPage } = useDepartments({ page: 1, pageSize: 1000 });
  const departments = departmentsPage?.results;

  const handleIncludeAll = () => {
    onChange({ include_all_departments: !includeAll });
  };

  const handleToggleDepartment = (deptId) => {
    const newSelected = selected.includes(deptId)
      ? selected.filter((id) => id !== deptId)
      : [...selected, deptId];
    onChange({ included_departments: newSelected });
  };

  return (
    <div className="cycle-department-selector">
      <h3 className="cycle-department-selector-title">Departments</h3>
      
      <label className="cycle-department-selector-all">
        <input
          type="checkbox"
          checked={includeAll}
          onChange={handleIncludeAll}
        />
        Include All Departments
      </label>

      {!includeAll && (
        <div className="cycle-department-selector-list">
          {departments?.map((dept) => (
            <label key={dept.id} className="cycle-department-selector-item">
              <input
                type="checkbox"
                checked={selected.includes(dept.id)}
                onChange={() => handleToggleDepartment(dept.id)}
              />
              {dept.name}
            </label>
          ))}
          {departments?.length === 0 && (
            <div className="cycle-department-selector-empty">
              No departments available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CycleDepartmentSelector;
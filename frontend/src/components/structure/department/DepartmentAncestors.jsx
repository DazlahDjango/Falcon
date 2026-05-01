import React from 'react';
import { ChevronRight } from 'lucide-react';

const DepartmentAncestors = ({ ancestors, onSelect, className = '' }) => {
  if (!ancestors || ancestors.length === 0) {
    return null;
  }
  return (
    <div className={`department-ancestors ${className}`}>
      {ancestors.map((ancestor, index) => (
        <React.Fragment key={ancestor.id}>
          <button
            onClick={() => onSelect?.(ancestor)}
            className="hover:text-blue-600 hover:underline transition-colors"
          >
            {ancestor.name}
          </button>
          {index < ancestors.length - 1 && <ChevronRight size={12} />}
        </React.Fragment>
      ))}
    </div>
  );
};
export default DepartmentAncestors;
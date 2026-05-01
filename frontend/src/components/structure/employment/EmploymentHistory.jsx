import React from 'react';
import { Calendar } from 'lucide-react';
import EmploymentCard from './EmploymentCard';

const EmploymentHistory = ({ employments, onSelectEmployment, className = '' }) => {
  if (!employments || employments.length === 0) {
    return <div className="text-center text-gray-500 py-4">No employment history</div>;
  }
  const sortedEmployments = [...employments].sort((a, b) =>
    new Date(b.effective_from) - new Date(a.effective_from)
  );
  
  return (
    <div className={`employment-history ${className}`}>
      {sortedEmployments.map((employment, index) => (
        <div key={employment.id || index} className="history-timeline-node">
          <div className="history-timeline-dot" />
          <div className="ml-4">
            <EmploymentCard
              employment={employment}
              onSelect={onSelectEmployment}
              className="mb-3"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmploymentHistory;
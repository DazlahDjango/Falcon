// src/components/reviews/dashboard/executive/DepartmentRankings.jsx
import React from 'react';
import { Building, TrendingUp, TrendingDown, Award } from 'lucide-react';

const DepartmentRankings = ({ rankings = [] }) => {
  if (!rankings || rankings.length === 0) {
    return (
      <div className="department-rankings">
        <h3 className="department-rankings-title">
          <Building size={18} />
          Department Rankings
        </h3>
        <div className="department-rankings-empty">
          <p>No data available</p>
        </div>
      </div>
    );
  }

  const topRankings = rankings.slice(0, 10);

  return (
    <div className="department-rankings">
      <h3 className="department-rankings-title">
        <Building size={18} />
        Department Rankings
      </h3>
      <div className="department-rankings-list">
        {topRankings.map((dept, index) => (
          <div key={index} className="department-rankings-item">
            <div className="department-rankings-item-left">
              <span className="department-rankings-item-rank">#{index + 1}</span>
              <span className="department-rankings-item-name">{dept.department}</span>
            </div>
            <div className="department-rankings-item-right">
              <span className="department-rankings-item-score">{dept.average_score}%</span>
              <span className="department-rankings-item-employees">
                {dept.employee_count} employees
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DepartmentRankings;
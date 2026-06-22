// src/components/reviews/final-ratings/list/FinalRatingTable.jsx
import React from 'react';
import { Eye, Award, AlertTriangle, CheckCircle } from 'lucide-react';
import { ReviewStatusBadge, ReviewScoreGauge } from '../../common';

const FinalRatingTable = ({ data, onView }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  };

  return (
    <div className="final-rating-table-container">
      <table className="final-rating-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Cycle</th>
            <th>Final Score</th>
            <th>Rating</th>
            <th>Status</th>
            <th>Actions</th>
            <th>Promotion</th>
            <th>PIP</th>
          </tr>
        </thead>
        <tbody>
          {data.map((rating) => (
            <tr key={rating.id} className="final-rating-table-row" onClick={() => onView(rating.id)}>
              <td className="final-rating-table-employee">
                <div className="final-rating-table-employee-info">
                  <div className="final-rating-table-avatar">
                    {rating.employee_name?.charAt(0) || 'E'}
                  </div>
                  <div>
                    <div className="final-rating-table-employee-name">{rating.employee_name}</div>
                    <div className="final-rating-table-employee-email">{rating.employee_email}</div>
                  </div>
                </div>
              </td>
              <td className="final-rating-table-cycle">{rating.review_cycle_name}</td>
              <td className="final-rating-table-score">
                <div className="final-rating-table-score-display">
                  <span className="final-rating-table-score-value" style={{ color: getScoreColor(rating.final_score) }}>
                    {rating.final_score !== null ? `${rating.final_score}%` : '—'}
                  </span>
                  <div className="final-rating-table-score-bar">
                    <div
                      className="final-rating-table-score-fill"
                      style={{
                        width: `${rating.final_score || 0}%`,
                        backgroundColor: getScoreColor(rating.final_score),
                      }}
                    />
                  </div>
                </div>
              </td>
              <td>
                {rating.final_rating_label ? (
                  <span
                    className="final-rating-table-rating-label"
                    style={{ color: rating.final_rating_color || '#6b7280' }}
                  >
                    {rating.final_rating_label}
                  </span>
                ) : (
                  '—'
                )}
              </td>
              <td><ReviewStatusBadge status={rating.status} size="sm" /></td>
              <td>
                <button
                  className="final-rating-table-action-btn"
                  onClick={(e) => { e.stopPropagation(); onView(rating.id); }}
                  aria-label="View"
                >
                  <Eye size={16} />
                </button>
              </td>
              <td>
                {rating.promotion_recommended ? (
                  <span className="final-rating-table-badge promotion">
                    <Award size={14} />
                  </span>
                ) : (
                  <span className="final-rating-table-badge none">—</span>
                )}
              </td>
              <td>
                {rating.pip_recommended ? (
                  <span className="final-rating-table-badge pip">
                    <AlertTriangle size={14} />
                  </span>
                ) : (
                  <span className="final-rating-table-badge none">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FinalRatingTable;
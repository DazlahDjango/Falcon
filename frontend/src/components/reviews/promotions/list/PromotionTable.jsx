// src/components/reviews/promotions/list/PromotionTable.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, TrendingUp, User, Calendar } from 'lucide-react';
import { ReviewStatusBadge } from '../../common';
import { usePromotions } from '../../../../hooks/reviews';

const PromotionTable = ({ data }) => {
  const navigate = useNavigate();
  const { deletePromotion, canManage } = usePromotions();

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete promotion for "${name}"?`)) {
      await deletePromotion(id);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#22c55e';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="promotion-table-container">
      <table className="promotion-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Current → Recommended</th>
            <th>Priority</th>
            <th>Recommended Date</th>
            <th>Status</th>
            <th>Salary</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((promotion) => (
            <tr key={promotion.id} className="promotion-table-row" onClick={() => navigate(`/reviews/promotions/${promotion.id}`)}>
              <td className="promotion-table-employee">
                <div className="promotion-table-employee-info">
                  <div className="promotion-table-avatar">
                    {promotion.employee_name?.charAt(0) || 'E'}
                  </div>
                  <div>
                    <div className="promotion-table-employee-name">{promotion.employee_name}</div>
                    <div className="promotion-table-employee-email">{promotion.employee_email}</div>
                  </div>
                </div>
              </td>
              <td className="promotion-table-roles">
                <div className="promotion-table-roles-content">
                  <span className="promotion-table-current">{promotion.current_role}</span>
                  <TrendingUp size={14} className="promotion-table-arrow" />
                  <span className="promotion-table-recommended">{promotion.recommended_role}</span>
                </div>
              </td>
              <td>
                <span
                  className="promotion-table-priority"
                  style={{ backgroundColor: getPriorityColor(promotion.priority) }}
                >
                  {promotion.priority}
                </span>
              </td>
              <td>{formatDate(promotion.recommended_date)}</td>
              <td><ReviewStatusBadge status={promotion.status} size="sm" /></td>
              <td className="promotion-table-salary">
                {promotion.proposed_salary ? `$${promotion.proposed_salary.toLocaleString()}` : '—'}
              </td>
              <td className="promotion-table-actions">
                <button
                  className="promotion-table-action-btn"
                  onClick={(e) => { e.stopPropagation(); navigate(`/reviews/promotions/${promotion.id}`); }}
                  aria-label="View"
                >
                  <Eye size={16} />
                </button>
                {canManage && (
                  <>
                    <button
                      className="promotion-table-action-btn"
                      onClick={(e) => { e.stopPropagation(); navigate(`/reviews/promotions/${promotion.id}/edit`); }}
                      aria-label="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="promotion-table-action-btn danger"
                      onClick={(e) => { e.stopPropagation(); handleDelete(promotion.id, promotion.employee_name); }}
                      aria-label="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PromotionTable;
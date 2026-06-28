// src/components/reviews/coefficients/list/CoefficientTable.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Eye, Calculator, Users, Building, User, Calendar } from 'lucide-react';
import { ReviewStatusBadge } from '../../common';
import { useCoefficients } from '../../../../hooks/reviews';

const CoefficientTable = ({ data }) => {
  const navigate = useNavigate();
  const { deleteCoefficient, activate, deactivate, canManage } = useCoefficients();

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteCoefficient(id);
    }
  };

  const handleActivate = async (id) => {
    await activate(id);
  };

  const handleDeactivate = async (id) => {
    await deactivate(id);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'individual':
        return <User size={14} />;
      case 'department':
        return <Building size={14} />;
      case 'position':
        return <Users size={14} />;
      default:
        return <Users size={14} />;
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      individual: 'Individual',
      department: 'Department',
      position: 'Position',
    };
    return labels[type] || type;
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
    <div className="coefficient-table-container">
      <table className="coefficient-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Value</th>
            <th>Applied To</th>
            <th>Valid From</th>
            <th>Valid To</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((coefficient) => (
            <tr key={coefficient.id} className="coefficient-table-row">
              <td className="coefficient-table-type">
                <div className="coefficient-table-type-content">
                  {getTypeIcon(coefficient.coefficient_type)}
                  <span>{getTypeLabel(coefficient.coefficient_type)}</span>
                </div>
              </td>
              <td className="coefficient-table-value">
                <span className="coefficient-table-value-number">
                  ×{coefficient.value}
                </span>
              </td>
              <td className="coefficient-table-applied">
                {coefficient.user_name || coefficient.department_name || coefficient.position_title || '—'}
              </td>
              <td className="coefficient-table-date">{formatDate(coefficient.valid_from)}</td>
              <td className="coefficient-table-date">{formatDate(coefficient.valid_to)}</td>
              <td>
                <ReviewStatusBadge status={coefficient.is_active ? 'active' : 'inactive'} size="sm" />
              </td>
              <td className="coefficient-table-actions">
                <button
                  className="coefficient-table-action-btn"
                  onClick={() => navigate(`/reviews/coefficients/${coefficient.id}`)}
                  aria-label="View"
                >
                  <Eye size={16} />
                </button>
                {canManage && (
                  <>
                    {coefficient.is_active ? (
                      <button
                        className="coefficient-table-action-btn warning"
                        onClick={() => handleDeactivate(coefficient.id)}
                        aria-label="Deactivate"
                      >
                        <Calculator size={16} />
                      </button>
                    ) : (
                      <button
                        className="coefficient-table-action-btn success"
                        onClick={() => handleActivate(coefficient.id)}
                        aria-label="Activate"
                      >
                        <Calculator size={16} />
                      </button>
                    )}
                    <button
                      className="coefficient-table-action-btn"
                      onClick={() => navigate(`/reviews/coefficients/${coefficient.id}/edit`)}
                      aria-label="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="coefficient-table-action-btn danger"
                      onClick={() => handleDelete(coefficient.id, coefficient.name)}
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

export default CoefficientTable;
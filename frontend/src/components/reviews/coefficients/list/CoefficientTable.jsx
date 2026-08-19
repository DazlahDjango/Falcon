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
      division: 'Division',
      department: 'Department',
      section: 'Section',
      unit: 'Unit',
      position: 'Position',
      individual: 'Individual',
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
                {coefficient.target_name || coefficient.user_name || coefficient.division_name || coefficient.department_name || coefficient.section_name || coefficient.unit_name || coefficient.position_title || '—'}
              </td>
              <td className="coefficient-table-date">{formatDate(coefficient.valid_from)}</td>
              <td className="coefficient-table-date">{formatDate(coefficient.valid_to)}</td>
              <td>
                {canManage ? (
                  <label className="flex items-center gap-1 cursor-pointer select-none" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={coefficient.is_active || false}
                      onChange={() => coefficient.is_active ? handleDeactivate(coefficient.id) : handleActivate(coefficient.id)}
                      className="w-3.5 h-3.5 cursor-pointer accent-blue-600"
                    />
                    <span className={`text-xs ${coefficient.is_active ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                      {coefficient.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </label>
                ) : (
                  <ReviewStatusBadge status={coefficient.is_active ? 'active' : 'inactive'} size="sm" />
                )}
              </td>
              <td className="coefficient-table-actions">
                {canManage && (
                  <>
                    <button
                      className="coefficient-table-action-btn"
                      onClick={() => navigate(`/reviews/coefficients/${coefficient.id}/edit`)}
                      aria-label="Edit"
                      title="Edit Coefficient"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="coefficient-table-action-btn danger"
                      onClick={() => handleDelete(coefficient.id, coefficient.user_name || coefficient.department_name || coefficient.position_title || 'this coefficient')}
                      aria-label="Delete"
                      title="Delete Coefficient"
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
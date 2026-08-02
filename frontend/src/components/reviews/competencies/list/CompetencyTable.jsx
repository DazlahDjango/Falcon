// src/components/reviews/competencies/list/CompetencyTable.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, Copy } from 'lucide-react';
import { ReviewStatusBadge } from '../../common';
import { useCompetencies } from '../../../../hooks/reviews';

const CompetencyTable = ({ data }) => {
  const navigate = useNavigate();
  const { deleteCompetency, cloneCompetency, activate, deactivate, patch, canManage } = useCompetencies();

  const handleDelete = async (id, name, usageCount) => {
    if (usageCount > 0) {
      alert('Cannot delete a competency that is currently in use.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteCompetency(id);
    }
  };

  const handleClone = async (id, name) => {
    if (window.confirm(`Are you sure you want to clone "${name}"?`)) {
      try {
        await cloneCompetency(id);
      } catch (err) {
        console.error('Failed to clone competency:', err);
      }
    }
  };

  const handleToggleActive = async (e, competency) => {
    e.stopPropagation();
    try {
      if (competency.is_active) {
        if (competency.usage_count > 0) {
          alert('Cannot deactivate a competency that has active ratings.');
          return;
        }
        await deactivate(competency.id);
      } else {
        await activate(competency.id);
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleToggleRequired = async (e, competency) => {
    e.stopPropagation();
    try {
      await patch(competency.id, { is_required: !competency.is_required });
    } catch (err) {
      console.error('Failed to toggle required status:', err);
    }
  };

  return (
    <div className="competency-table-container">
      <table className="competency-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Category</th>
            <th>Default Weight</th>
            <th>Status</th>
            <th>Required</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((competency) => (
            <tr key={competency.id} className="competency-table-row">
              <td className="competency-table-name">{competency.name}</td>
              <td className="competency-table-type">{competency.competency_type?.replace('_', ' ').toUpperCase()}</td>
              <td>{competency.category_name || '—'}</td>
              <td className="competency-table-weight">{competency.default_weight}%</td>
              <td>
                {canManage ? (
                  <label className="flex items-center gap-1 cursor-pointer select-none" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={competency.is_active || false}
                      onChange={(e) => handleToggleActive(e, competency)}
                      className="w-3.5 h-3.5 cursor-pointer accent-blue-600"
                    />
                    <span className={`text-xs ${competency.is_active ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                      {competency.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </label>
                ) : (
                  <ReviewStatusBadge status={competency.is_active ? 'active' : 'inactive'} size="sm" />
                )}
              </td>
              <td>
                {canManage ? (
                  <label className="flex items-center gap-1 cursor-pointer select-none" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={competency.is_required || false}
                      onChange={(e) => handleToggleRequired(e, competency)}
                      className="w-3.5 h-3.5 cursor-pointer accent-blue-600"
                    />
                    <span className={`text-xs ${competency.is_required ? 'text-yellow-600 font-medium' : 'text-gray-500'}`}>
                      Required
                    </span>
                  </label>
                ) : (
                  competency.is_required ? '✅' : '—'
                )}
              </td>
              <td className="competency-table-actions">
                <button className="competency-table-action-btn" onClick={() => navigate(`/reviews/competencies/${competency.id}`)} aria-label="View" title="View Details">
                  <Eye size={16} />
                </button>
                {canManage && (
                  <>
                    <button
                      className="competency-table-action-btn"
                      onClick={() => handleClone(competency.id, competency.name)}
                      aria-label="Clone"
                      title="Clone Competency"
                    >
                      <Copy size={16} />
                    </button>
                    <button className="competency-table-action-btn" onClick={() => navigate(`/reviews/competencies/${competency.id}/edit`)} aria-label="Edit" title="Edit Competency">
                      <Edit size={16} />
                    </button>
                    <button
                      className="competency-table-action-btn danger"
                      onClick={() => handleDelete(competency.id, competency.name, competency.usage_count)}
                      aria-label="Delete"
                      disabled={competency.usage_count > 0}
                      title={competency.usage_count > 0 ? 'Competency is in use and cannot be deleted' : 'Delete Competency'}
                      style={{
                        opacity: competency.usage_count > 0 ? 0.4 : 1,
                        cursor: competency.usage_count > 0 ? 'not-allowed' : 'pointer'
                      }}
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

export default CompetencyTable;
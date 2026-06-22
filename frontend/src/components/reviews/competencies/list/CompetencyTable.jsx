// src/components/reviews/competencies/list/CompetencyTable.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { ReviewStatusBadge } from '../../common';
import { useCompetencies } from '../../../../hooks/reviews';

const CompetencyTable = ({ data }) => {
  const navigate = useNavigate();
  const { deleteCompetency, canManage } = useCompetencies();

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteCompetency(id);
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
              <td><ReviewStatusBadge status={competency.is_active ? 'active' : 'inactive'} size="sm" /></td>
              <td>{competency.is_required ? '✅' : '—'}</td>
              <td className="competency-table-actions">
                <button className="competency-table-action-btn" onClick={() => navigate(`/reviews/competencies/${competency.id}`)} aria-label="View">
                  <Eye size={16} />
                </button>
                {canManage && (
                  <>
                    <button className="competency-table-action-btn" onClick={() => navigate(`/reviews/competencies/${competency.id}/edit`)} aria-label="Edit">
                      <Edit size={16} />
                    </button>
                    <button className="competency-table-action-btn danger" onClick={() => handleDelete(competency.id, competency.name)} aria-label="Delete">
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
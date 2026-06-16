// src/components/reviews/cycles/list/CycleTable.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Eye, Calendar } from 'lucide-react';
import { ReviewStatusBadge } from '../../common';
import { useCycles } from '../../../../hooks/reviews';

const CycleTable = ({ data }) => {
  const navigate = useNavigate();
  const { deleteCycle, canManage } = useCycles();

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteCycle(id);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="cycle-table-container">
      <table className="cycle-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Progress</th>
            <th>Participants</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((cycle) => (
            <tr key={cycle.id} className="cycle-table-row">
              <td className="cycle-table-name">
                <div className="cycle-table-name-content">
                  <span>{cycle.name}</span>
                </div>
              </td>
              <td className="cycle-table-type">
                {cycle.cycle_type?.replace('_', ' ').toUpperCase() || 'Custom'}
              </td>
              <td>{formatDate(cycle.start_date)}</td>
              <td>{formatDate(cycle.end_date)}</td>
              <td><ReviewStatusBadge status={cycle.status} /></td>
              <td>
                <div className="cycle-table-progress">
                  <div className="cycle-table-progress-bar">
                    <div
                      className="cycle-table-progress-fill"
                      style={{ width: `${cycle.progress || 0}%` }}
                    />
                  </div>
                  <span className="cycle-table-progress-text">{cycle.progress || 0}%</span>
                </div>
              </td>
              <td className="cycle-table-participants">
                {cycle.participants_count || 0}
              </td>
              <td className="cycle-table-actions">
                <button
                  className="cycle-table-action-btn"
                  onClick={() => navigate(`/reviews/cycles/${cycle.id}`)}
                  aria-label="View"
                >
                  <Eye size={16} />
                </button>
                {canManage && (
                  <>
                    <button
                      className="cycle-table-action-btn"
                      onClick={() => navigate(`/reviews/cycles/${cycle.id}/edit`)}
                      aria-label="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="cycle-table-action-btn danger"
                      onClick={() => handleDelete(cycle.id, cycle.name)}
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

export default CycleTable;
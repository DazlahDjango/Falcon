// src/components/reviews/pips/list/PIPTable.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Eye } from 'lucide-react';
import { ReviewStatusBadge } from '../../common';
import { usePIP } from '../../../../hooks/reviews';

const PIPTable = ({ data }) => {
  const navigate = useNavigate();
  const { deletePIP, canManage } = usePIP();

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      await deletePIP(id);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      minor: '#6b7280',
      moderate: '#f59e0b',
      severe: '#ef4444',
      critical: '#dc2626',
    };
    return colors[severity] || '#6b7280';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="pip-table-container">
      <table className="pip-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Employee</th>
            <th>Severity</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Progress</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((pip) => (
            <tr key={pip.id} className="pip-table-row">
              <td className="pip-table-title">{pip.title}</td>
              <td className="pip-table-employee">{pip.employee_name}</td>
              <td>
                <span
                  className="pip-table-severity"
                  style={{ backgroundColor: getSeverityColor(pip.severity) }}
                >
                  {pip.severity}
                </span>
              </td>
              <td>{formatDate(pip.start_date)}</td>
              <td>{formatDate(pip.end_date)}</td>
              <td><ReviewStatusBadge status={pip.status} size="sm" /></td>
              <td>
                <div className="pip-table-progress">
                  <div className="pip-table-progress-bar">
                    <div
                      className="pip-table-progress-fill"
                      style={{ width: `${pip.completion_percentage || 0}%` }}
                    />
                  </div>
                  <span className="pip-table-progress-text">{pip.completion_percentage || 0}%</span>
                </div>
              </td>
              <td className="pip-table-actions">
                <button
                  className="pip-table-action-btn"
                  onClick={() => navigate(`/reviews/pips/${pip.id}`)}
                  aria-label="View"
                >
                  <Eye size={16} />
                </button>
                {canManage && (
                  <>
                    <button
                      className="pip-table-action-btn"
                      onClick={() => navigate(`/reviews/pips/${pip.id}/edit`)}
                      aria-label="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="pip-table-action-btn danger"
                      onClick={() => handleDelete(pip.id, pip.title)}
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

export default PIPTable;
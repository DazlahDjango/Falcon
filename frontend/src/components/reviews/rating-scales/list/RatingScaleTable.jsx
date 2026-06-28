// src/components/reviews/rating-scales/list/RatingScaleTable.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Eye, Star } from 'lucide-react';
import { ReviewStatusBadge } from '../../common';
import { useRatingScales } from '../../../../hooks/reviews';

const RatingScaleTable = ({ data }) => {
  const navigate = useNavigate();
  const { deleteRatingScale, canManage } = useRatingScales();

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteRatingScale(id);
    }
  };

  return (
    <div className="rating-scale-table-container">
      <table className="rating-scale-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Levels</th>
            <th>Range</th>
            <th>Status</th>
            <th>Usage</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((scale) => (
            <tr key={scale.id} className="rating-scale-table-row">
              <td className="rating-scale-table-name">
                <div className="rating-scale-table-name-content">
                  <span>{scale.name}</span>
                  {scale.is_default && (
                    <span className="badge badge-primary badge-sm">
                      <Star size={12} /> Default
                    </span>
                  )}
                </div>
              </td>
              <td className="rating-scale-table-description">
                {scale.description || '—'}
              </td>
              <td className="rating-scale-table-levels">
                {scale.levels?.length || 0}
              </td>
              <td className="rating-scale-table-range">
                {scale.min_value} - {scale.max_value}
              </td>
              <td>
                <ReviewStatusBadge status={scale.is_active ? 'active' : 'inactive'} />
              </td>
              <td className="rating-scale-table-usage">
                {scale.usage_count || 0}
              </td>
              <td className="rating-scale-table-actions">
                <button
                  className="rating-scale-table-action-btn"
                  onClick={() => navigate(`/reviews/rating-scales/${scale.id}`)}
                  aria-label="View"
                >
                  <Eye size={16} />
                </button>
                {canManage && (
                  <>
                    <button
                      className="rating-scale-table-action-btn"
                      onClick={() => navigate(`/reviews/rating-scales/${scale.id}/edit`)}
                      aria-label="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="rating-scale-table-action-btn danger"
                      onClick={() => handleDelete(scale.id, scale.name)}
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

export default RatingScaleTable;
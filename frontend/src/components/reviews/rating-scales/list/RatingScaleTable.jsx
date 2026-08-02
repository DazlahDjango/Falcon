// src/components/reviews/rating-scales/list/RatingScaleTable.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Eye, Star, Copy } from 'lucide-react';
import { ReviewStatusBadge } from '../../common';
import { useRatingScales } from '../../../../hooks/reviews';

const RatingScaleTable = ({ data }) => {
  const navigate = useNavigate();
  const { deleteRatingScale, cloneScale, setDefault, activate, deactivate, canManage } = useRatingScales();

  const handleDelete = async (id, name, isDefault, usageCount) => {
    if (isDefault) {
      alert('Cannot delete the default rating scale.');
      return;
    }
    if (usageCount > 0) {
      alert('Cannot delete a rating scale that is currently in use.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteRatingScale(id);
    }
  };

  const handleClone = async (id, name) => {
    if (window.confirm(`Are you sure you want to clone "${name}"?`)) {
      try {
        await cloneScale(id);
      } catch (err) {
        console.error('Failed to clone rating scale:', err);
      }
    }
  };

  const handleToggleActive = async (e, scale) => {
    e.stopPropagation();
    try {
      if (scale.is_active) {
        if (scale.is_default) {
          alert('Cannot deactivate the default rating scale.');
          return;
        }
        await deactivate(scale.id);
      } else {
        await activate(scale.id);
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleSetDefault = async (e, id) => {
    e.stopPropagation();
    try {
      await setDefault(id);
    } catch (err) {
      console.error('Failed to set default scale:', err);
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
                {canManage ? (
                  <label className="flex items-center gap-1 cursor-pointer select-none" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={scale.is_active}
                      disabled={scale.is_default}
                      onChange={(e) => handleToggleActive(e, scale)}
                      className="w-3.5 h-3.5 cursor-pointer accent-blue-600"
                      title={scale.is_default ? 'Cannot deactivate the default scale' : 'Toggle active status'}
                    />
                    <span className={`text-xs ${scale.is_active ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                      {scale.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </label>
                ) : (
                  <ReviewStatusBadge status={scale.is_active ? 'active' : 'inactive'} />
                )}
              </td>
              <td className="rating-scale-table-usage">
                {scale.usage_count || 0}
              </td>
              <td className="rating-scale-table-actions">
                <button
                  className="rating-scale-table-action-btn"
                  onClick={() => navigate(`/reviews/rating-scales/${scale.id}`)}
                  aria-label="View"
                  title="View Details"
                >
                  <Eye size={16} />
                </button>
                {canManage && (
                  <>
                    {!scale.is_default && scale.is_active && (
                      <button
                        className="rating-scale-table-action-btn"
                        onClick={(e) => handleSetDefault(e, scale.id)}
                        aria-label="Set Default"
                        title="Set as Default Scale"
                      >
                        <Star size={16} className="text-yellow-500 fill-yellow-500" />
                      </button>
                    )}
                    <button
                      className="rating-scale-table-action-btn"
                      onClick={() => handleClone(scale.id, scale.name)}
                      aria-label="Clone"
                      title="Clone Rating Scale"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      className="rating-scale-table-action-btn"
                      onClick={() => navigate(`/reviews/rating-scales/${scale.id}/edit`)}
                      aria-label="Edit"
                      title="Edit Rating Scale"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="rating-scale-table-action-btn danger"
                      onClick={() => handleDelete(scale.id, scale.name, scale.is_default, scale.usage_count)}
                      aria-label="Delete"
                      disabled={scale.is_default || scale.usage_count > 0}
                      title={
                        scale.is_default
                          ? 'Cannot delete the default scale'
                          : scale.usage_count > 0
                          ? 'Scale is in use and cannot be deleted'
                          : 'Delete Rating Scale'
                      }
                      style={{
                        opacity: (scale.is_default || scale.usage_count > 0) ? 0.4 : 1,
                        cursor: (scale.is_default || scale.usage_count > 0) ? 'not-allowed' : 'pointer'
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

export default RatingScaleTable;
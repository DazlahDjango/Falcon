import React from 'react';
import { FiEdit, FiTrash2, FiEye, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { StructureLoading } from './StructureLoading';
import { StructureEmptyState } from './StructureEmptyState';

export const StructureTable = ({
  columns,
  data,
  loading = false,
  error = null,
  onView,
  onEdit,
  onDelete,
  onRowClick,
  actions = true,
  pagination = null,
  className = '',
}) => {
  if (loading) return <StructureLoading />;
  if (error) return <div className="structure-table-error">{error}</div>;
  if (!data || data.length === 0) return <StructureEmptyState />;

  const handleRowClick = (item) => {
    if (onRowClick) onRowClick(item);
  };

  const renderActions = (item) => (
    <div className="structure-table-actions">
      {onView && (
        <button onClick={() => onView(item)} className="action-btn view-btn" title="View">
          <FiEye size={16} />
        </button>
      )}
      {onEdit && (
        <button onClick={() => onEdit(item)} className="action-btn edit-btn" title="Edit">
          <FiEdit size={16} />
        </button>
      )}
      {onDelete && (
        <button onClick={() => onDelete(item)} className="action-btn delete-btn" title="Delete">
          <FiTrash2 size={16} />
        </button>
      )}
    </div>
  );

  return (
    <div className={`structure-table-container ${className}`}>
      <div className="structure-table-wrapper">
        <table className="structure-table">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={col.key || index} style={{ width: col.width }}>
                  {col.header}
                </th>
              ))}
              {actions && <th className="actions-header">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((item, rowIndex) => (
              <tr
                key={item.id || rowIndex}
                onClick={() => handleRowClick(item)}
                className={onRowClick ? 'clickable' : ''}
              >
                {columns.map((col, colIndex) => (
                  <td key={col.key || colIndex}>
                    {col.render ? col.render(item) : item[col.key] || '-'}
                  </td>
                ))}
                {actions && (
                  <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                    {renderActions(item)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && (
        <div className="structure-table-footer">
          <div className="table-info">
            Showing {pagination.startIndex || 1} to {pagination.endIndex || data.length} of {pagination.total || data.length}
          </div>
          <div className="table-pagination">
            <button
              onClick={pagination.onPrevious}
              disabled={!pagination.hasPrevious}
              className="page-btn"
            >
              <FiChevronLeft size={18} />
            </button>
            <span className="page-info">
              Page {pagination.currentPage || 1} of {pagination.totalPages || 1}
            </span>
            <button
              onClick={pagination.onNext}
              disabled={!pagination.hasNext}
              className="page-btn"
            >
              <FiChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StructureTable;
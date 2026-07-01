import React from 'react';
import { FiInbox, FiPlus } from 'react-icons/fi';

export const StructureEmptyState = ({
  title = 'No items found',
  description = 'There are no items to display at the moment.',
  icon = FiInbox,
  actionLabel = null,
  onAction = null,
  className = '',
}) => {
  const Icon = icon;

  return (
    <div className={`structure-empty-state ${className}`}>
      <div className="empty-state-icon">
        <Icon size={48} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn btn-primary empty-state-action">
          <FiPlus size={16} />
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default StructureEmptyState;
import React from 'react';
import { FiSave, FiX, FiLoader } from 'react-icons/fi';

export const StructureForm = ({
  title,
  children,
  onSubmit,
  onCancel,
  isLoading = false,
  isEditing = false,
  submitLabel = null,
  cancelLabel = 'Cancel',
  className = '',
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(e);
  };

  return (
    <div className={`structure-form-container ${className}`}>
      {title && (
        <div className="structure-form-header">
          <h2>{title}</h2>
        </div>
      )}
      <form onSubmit={handleSubmit} className="structure-form">
        <div className="structure-form-body">
          {children}
        </div>
        <div className="structure-form-footer">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            <FiX size={16} />
            {cancelLabel}
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <FiLoader size={16} className="spinning" />
                Saving...
              </>
            ) : (
              <>
                <FiSave size={16} />
                {submitLabel || (isEditing ? 'Update' : 'Create')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StructureForm;
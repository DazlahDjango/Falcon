// src/components/reviews/pip-actions/detail/PIPActionComplete.jsx
import React, { useState } from 'react';
import { CheckCircle, Upload, X, FileText } from 'lucide-react';
import { usePIPActions } from '../../../../hooks/reviews';
import { ReviewLoading } from '../../common';

const PIPActionComplete = ({ action, onComplete }) => {
  const { complete, loading } = usePIPActions();
  const [formData, setFormData] = useState({
    notes: '',
    evidence: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filePreview, setFilePreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, evidence: file });
      setFilePreview(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await complete(action.id, formData.notes, formData.evidence);
      onComplete();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <ReviewLoading size="md" text="Loading..." />;

  return (
    <div className="pip-action-complete">
      <div className="pip-action-complete-header">
        <h3 className="pip-action-complete-title">Complete Action</h3>
        <p className="pip-action-complete-subtitle">
          Mark this action as completed for "{action.title}"
        </p>
      </div>

      <form onSubmit={handleSubmit} className="pip-action-complete-form">
        <div className="pip-action-complete-group">
          <label className="pip-action-complete-label">Progress Notes</label>
          <textarea
            className="pip-action-complete-textarea"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Describe what was accomplished..."
            rows={4}
          />
        </div>

        {action.requires_evidence && (
          <div className="pip-action-complete-group">
            <label className="pip-action-complete-label">Evidence</label>
            <div className="pip-action-complete-upload">
              {filePreview ? (
                <div className="pip-action-complete-file-preview">
                  <FileText size={24} />
                  <span>{filePreview}</span>
                  <button
                    type="button"
                    className="pip-action-complete-file-remove"
                    onClick={() => {
                      setFormData({ ...formData, evidence: null });
                      setFilePreview(null);
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="pip-action-complete-upload-label">
                  <Upload size={24} />
                  <span>Click to upload evidence</span>
                  <input
                    type="file"
                    className="pip-action-complete-upload-input"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </label>
              )}
              <p className="pip-action-complete-upload-hint">
                Supported: PDF, DOC, DOCX, JPG, PNG (Max 5MB)
              </p>
            </div>
          </div>
        )}

        <div className="pip-action-complete-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onComplete}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-success"
            disabled={isSubmitting}
          >
            <CheckCircle size={18} />
            {isSubmitting ? 'Submitting...' : 'Complete Action'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PIPActionComplete;
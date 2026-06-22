// src/components/reviews/pip-actions/detail/PIPActionVerify.jsx
import React, { useState } from 'react';
import { CheckCircle, X, FileText, Download } from 'lucide-react';
import { usePIPActions } from '../../../../hooks/reviews';
import { ReviewLoading } from '../../common';

const PIPActionVerify = ({ action, onVerify }) => {
  const { verify, loading } = usePIPActions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await verify(action.id);
      onVerify();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <ReviewLoading size="md" text="Loading..." />;

  return (
    <div className="pip-action-verify">
      <div className="pip-action-verify-header">
        <h3 className="pip-action-verify-title">Verify Evidence</h3>
        <p className="pip-action-verify-subtitle">
          Review and verify the evidence for "{action.title}"
        </p>
      </div>

      <div className="pip-action-verify-evidence">
        <div className="pip-action-verify-evidence-header">
          <FileText size={20} />
          <span>Evidence Submitted</span>
        </div>
        {action.evidence_url ? (
          <a
            href={action.evidence_url}
            target="_blank"
            rel="noopener noreferrer"
            className="pip-action-verify-evidence-link"
          >
            <Download size={16} />
            Download Evidence
          </a>
        ) : (
          <p className="pip-action-verify-evidence-missing">No evidence uploaded</p>
        )}
      </div>

      {action.progress_notes && (
        <div className="pip-action-verify-notes">
          <h4 className="pip-action-verify-notes-title">Progress Notes</h4>
          <p className="pip-action-verify-notes-content">{action.progress_notes}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="pip-action-verify-form">
        <div className="pip-action-verify-group">
          <label className="pip-action-verify-label">Verification Notes (Optional)</label>
          <textarea
            className="pip-action-verify-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any verification notes..."
            rows={3}
          />
        </div>

        <div className="pip-action-verify-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onVerify}
          >
            <X size={18} />
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-success"
            disabled={isSubmitting}
          >
            <CheckCircle size={18} />
            {isSubmitting ? 'Verifying...' : 'Verify Evidence'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PIPActionVerify;
// src/components/reviews/settings/SettingsReset.jsx
import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, CheckCircle } from 'lucide-react';
import { useReviewsSystemSettings } from '../../../hooks/reviews';
import { ReviewConfirmDialog } from '../common';

const SettingsReset = ({ onReset }) => {
  const { resetSettings, loading } = useReviewsSystemSettings();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetSettings();
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setShowConfirm(false);
        onReset();
      }, 2000);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="settings-reset">
      <div className="settings-reset-card">
        <div className="settings-reset-icon">
          <AlertTriangle size={24} color="#f59e0b" />
        </div>
        <div className="settings-reset-content">
          <h4 className="settings-reset-title">Reset to Default Settings</h4>
          <p className="settings-reset-description">
            This will reset all system settings to their default values. This action cannot be undone.
          </p>
          <button
            className="btn btn-danger"
            onClick={() => setShowConfirm(true)}
            disabled={isResetting}
          >
            <RefreshCw size={16} />
            {isResetting ? 'Resetting...' : 'Reset Settings'}
          </button>
        </div>
      </div>

      {success && (
        <div className="settings-reset-success">
          <CheckCircle size={20} color="#22c55e" />
          <span>Settings reset successfully!</span>
        </div>
      )}

      <ReviewConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleReset}
        title="Reset System Settings"
        message="Are you sure you want to reset all system settings to their default values? This action cannot be undone."
        variant="danger"
        confirmText="Reset All"
        isLoading={isResetting}
      />
    </div>
  );
};

export default SettingsReset;
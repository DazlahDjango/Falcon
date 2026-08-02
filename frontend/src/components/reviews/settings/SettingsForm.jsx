// src/components/reviews/settings/SettingsForm.jsx
import React, { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';

const SettingsForm = ({ settings, onSave, isSaving }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (settings) {
      const calibration = settings.calibration || {};
      setFormData({
        reviews_enabled: settings.reviews_enabled !== undefined ? settings.reviews_enabled : true,
        self_assessment_enabled: settings.self_assessment_enabled !== undefined ? settings.self_assessment_enabled : true,
        supervisor_review_enabled: settings.supervisor_review_enabled !== undefined ? settings.supervisor_review_enabled : true,
        calibration_enabled: settings.calibration_enabled !== undefined ? settings.calibration_enabled : true,
        pip_enabled: settings.pip_enabled !== undefined ? settings.pip_enabled : true,
        feedback_enabled: settings.feedback_enabled !== undefined ? settings.feedback_enabled : true,
        promotions_enabled: settings.promotions_enabled !== undefined ? settings.promotions_enabled : true,
        default_cycle_duration_days: settings.default_cycle_duration_days || 90,
        self_assessment_deadline_days: settings.self_assessment_deadline_days || 30,
        supervisor_review_deadline_days: settings.supervisor_review_deadline_days || 45,
        auto_lock_ratings: settings.auto_lock_ratings !== undefined ? settings.auto_lock_ratings : false,
        require_approval: settings.require_approval !== undefined ? settings.require_approval : true,
        z_score_threshold: calibration.z_score_threshold !== undefined ? calibration.z_score_threshold : 1.5,
        critical_low_score: calibration.critical_low_score !== undefined ? calibration.critical_low_score : 40,
        critical_high_score: calibration.critical_high_score !== undefined ? calibration.critical_high_score : 95,
        manager_deviation_bias_limit: calibration.manager_deviation_bias_limit !== undefined ? calibration.manager_deviation_bias_limit : 15,
      });
    }
  }, [settings]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      calibration: {
        z_score_threshold: Number(formData.z_score_threshold),
        critical_low_score: Number(formData.critical_low_score),
        critical_high_score: Number(formData.critical_high_score),
        manager_deviation_bias_limit: Number(formData.manager_deviation_bias_limit),
      }
    };
    onSave(dataToSave);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      onSave({});
    }
  };

  return (
    <form className="settings-form" onSubmit={handleSubmit}>
      <div className="settings-form-header">
        <h3 className="settings-form-title">General Settings</h3>
        <div className="settings-form-actions">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleReset}
          >
            <RefreshCw size={16} />
            Reset Defaults
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={isSaving}
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div className="settings-form-grid">
        <div className="settings-form-group">
          <label className="settings-form-label">Enable Reviews Module</label>
          <div className="settings-form-toggle">
            <input
              type="checkbox"
              checked={formData.reviews_enabled}
              onChange={(e) => handleChange('reviews_enabled', e.target.checked)}
            />
            <span className="settings-form-toggle-label">
              {formData.reviews_enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <span className="settings-form-hint">Enable or disable the entire reviews module</span>
        </div>

        <div className="settings-form-group">
          <label className="settings-form-label">Enable Self Assessment</label>
          <div className="settings-form-toggle">
            <input
              type="checkbox"
              checked={formData.self_assessment_enabled}
              onChange={(e) => handleChange('self_assessment_enabled', e.target.checked)}
            />
            <span className="settings-form-toggle-label">
              {formData.self_assessment_enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        <div className="settings-form-group">
          <label className="settings-form-label">Enable Supervisor Review</label>
          <div className="settings-form-toggle">
            <input
              type="checkbox"
              checked={formData.supervisor_review_enabled}
              onChange={(e) => handleChange('supervisor_review_enabled', e.target.checked)}
            />
            <span className="settings-form-toggle-label">
              {formData.supervisor_review_enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        <div className="settings-form-group">
          <label className="settings-form-label">Enable Calibration</label>
          <div className="settings-form-toggle">
            <input
              type="checkbox"
              checked={formData.calibration_enabled}
              onChange={(e) => handleChange('calibration_enabled', e.target.checked)}
            />
            <span className="settings-form-toggle-label">
              {formData.calibration_enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        <div className="settings-form-group">
          <label className="settings-form-label">Enable PIP</label>
          <div className="settings-form-toggle">
            <input
              type="checkbox"
              checked={formData.pip_enabled}
              onChange={(e) => handleChange('pip_enabled', e.target.checked)}
            />
            <span className="settings-form-toggle-label">
              {formData.pip_enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        <div className="settings-form-group">
          <label className="settings-form-label">Enable 360 Feedback</label>
          <div className="settings-form-toggle">
            <input
              type="checkbox"
              checked={formData.feedback_enabled}
              onChange={(e) => handleChange('feedback_enabled', e.target.checked)}
            />
            <span className="settings-form-toggle-label">
              {formData.feedback_enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        <div className="settings-form-group">
          <label className="settings-form-label">Enable Promotions</label>
          <div className="settings-form-toggle">
            <input
              type="checkbox"
              checked={formData.promotions_enabled}
              onChange={(e) => handleChange('promotions_enabled', e.target.checked)}
            />
            <span className="settings-form-toggle-label">
              {formData.promotions_enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        <div className="settings-form-group">
          <label className="settings-form-label">Auto-Lock Ratings</label>
          <div className="settings-form-toggle">
            <input
              type="checkbox"
              checked={formData.auto_lock_ratings}
              onChange={(e) => handleChange('auto_lock_ratings', e.target.checked)}
            />
            <span className="settings-form-toggle-label">
              {formData.auto_lock_ratings ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <span className="settings-form-hint">Automatically lock ratings after approval</span>
        </div>

        <div className="settings-form-group">
          <label className="settings-form-label">Require Approval</label>
          <div className="settings-form-toggle">
            <input
              type="checkbox"
              checked={formData.require_approval}
              onChange={(e) => handleChange('require_approval', e.target.checked)}
            />
            <span className="settings-form-toggle-label">
              {formData.require_approval ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <span className="settings-form-hint">Require HR approval for final ratings</span>
        </div>
      </div>

      <div className="settings-form-group">
        <label className="settings-form-label">Default Cycle Duration (Days)</label>
        <input
          type="number"
          className="settings-form-input"
          value={formData.default_cycle_duration_days}
          onChange={(e) => handleChange('default_cycle_duration_days', Number(e.target.value))}
          min={1}
          max={365}
        />
      </div>

      <div className="settings-form-row">
        <div className="settings-form-group">
          <label className="settings-form-label">Self Assessment Deadline (Days)</label>
          <input
            type="number"
            className="settings-form-input"
            value={formData.self_assessment_deadline_days}
            onChange={(e) => handleChange('self_assessment_deadline_days', Number(e.target.value))}
            min={1}
            max={90}
          />
        </div>
        <div className="settings-form-group">
          <label className="settings-form-label">Supervisor Review Deadline (Days)</label>
          <input
            type="number"
            className="settings-form-input"
            value={formData.supervisor_review_deadline_days}
            onChange={(e) => handleChange('supervisor_review_deadline_days', Number(e.target.value))}
            min={1}
            max={90}
          />
        </div>
      </div>

      <hr style={{ margin: '2rem 0', borderColor: '#e2e8f0' }} />
      <h3 className="settings-form-title" style={{ marginBottom: '1.5rem' }}>Calibration Outlier Settings</h3>
      <div className="settings-form-row">
        <div className="settings-form-group">
          <label className="settings-form-label">Z-Score Outlier Threshold</label>
          <input
            type="number"
            step="0.1"
            className="settings-form-input"
            value={formData.z_score_threshold}
            onChange={(e) => handleChange('z_score_threshold', Number(e.target.value))}
            min={0.1}
            max={5.0}
          />
          <span className="settings-form-hint">Standard deviations from department average (default: 1.5)</span>
        </div>
        <div className="settings-form-group">
          <label className="settings-form-label">Manager Deviation Bias Limit (%)</label>
          <input
            type="number"
            className="settings-form-input"
            value={formData.manager_deviation_bias_limit}
            onChange={(e) => handleChange('manager_deviation_bias_limit', Number(e.target.value))}
            min={1}
            max={50}
          />
          <span className="settings-form-hint">Deviation from company average to flag manager bias (default: 15%)</span>
        </div>
      </div>
      <div className="settings-form-row" style={{ marginTop: '1rem' }}>
        <div className="settings-form-group">
          <label className="settings-form-label">Critical Low Score Highlight (%)</label>
          <input
            type="number"
            className="settings-form-input"
            value={formData.critical_low_score}
            onChange={(e) => handleChange('critical_low_score', Number(e.target.value))}
            min={0}
            max={100}
          />
          <span className="settings-form-hint">Highlight ratings scoring below this value (default: 40%)</span>
        </div>
        <div className="settings-form-group">
          <label className="settings-form-label">Critical High Score Highlight (%)</label>
          <input
            type="number"
            className="settings-form-input"
            value={formData.critical_high_score}
            onChange={(e) => handleChange('critical_high_score', Number(e.target.value))}
            min={0}
            max={100}
          />
          <span className="settings-form-hint">Highlight ratings scoring above this value (default: 95%)</span>
        </div>
      </div>
    </form>
  );
};

export default SettingsForm;
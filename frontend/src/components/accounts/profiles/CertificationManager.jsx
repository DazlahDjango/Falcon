import React, { useState } from 'react';
import {
  FiPlus,
  FiTrash2,
  FiX,
  FiAward,
  FiCalendar,
  FiAlertCircle,
  FiCheckCircle,
  FiExternalLink,
} from 'react-icons/fi';
import { useProfile } from '../../../hooks/accounts/useProfile';

export const CertificationManager = ({ profileId, certifications = [], isOwner = true }) => {
  const { addCertification, removeCertification, isLoading } = useProfile();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    issuer: '',
    issued_date: '',
    expiry_date: '',
    credential_id: '',
  });
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleAdd = () => {
    setFormData({
      name: '',
      issuer: '',
      issued_date: '',
      expiry_date: '',
      credential_id: '',
    });
    setFormError(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({
      name: '',
      issuer: '',
      issued_date: '',
      expiry_date: '',
      credential_id: '',
    });
    setFormError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('Certification name is required');
      return;
    }

    if (!formData.issuer.trim()) {
      setFormError('Issuer is required');
      return;
    }

    if (!formData.issued_date) {
      setFormError('Issue date is required');
      return;
    }

    const certData = {
      name: formData.name.trim(),
      issuer: formData.issuer.trim(),
      issued_date: formData.issued_date,
      expiry_date: formData.expiry_date || null,
      credential_id: formData.credential_id || '',
    };

    const result = await addCertification(profileId, certData);

    if (result.success !== false) {
      setSuccess(true);
      setShowForm(false);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setFormError(result.error || 'Failed to add certification');
    }
  };

  const handleDelete = async (certName) => {
    if (!confirm(`Remove certification "${certName}"?`)) return;
    const result = await removeCertification(profileId, certName);
    if (result.success !== false) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="certification-manager">
      <div className="certification-manager-header">
        <h3>
          <FiAward /> Certifications ({certifications.length})
        </h3>
        {isOwner && (
          <button className="btn-primary-sm" onClick={handleAdd}>
            <FiPlus /> Add Certification
          </button>
        )}
      </div>

      {success && (
        <div className="certification-manager-success">
          <FiCheckCircle /> Operation successful!
        </div>
      )}

      {certifications.length === 0 ? (
        <div className="certification-manager-empty">
          <FiAward className="empty-icon" />
          <p>No certifications added yet</p>
          {isOwner && <p className="empty-hint">Click "Add Certification" to get started</p>}
        </div>
      ) : (
        <div className="certification-list">
          {certifications.map((cert) => (
            <div key={cert.name} className="certification-item">
              <div className="certification-icon">
                <FiAward />
              </div>
              <div className="certification-info">
                <span className="certification-name">{cert.name}</span>
                <span className="certification-issuer">{cert.issuer}</span>
                <div className="certification-dates">
                  <span>
                    <FiCalendar /> Issued: {formatDate(cert.issued_date)}
                  </span>
                  {cert.expiry_date && (
                    <span className={isExpired(cert.expiry_date) ? 'expired' : ''}>
                      <FiCalendar /> Expires: {formatDate(cert.expiry_date)}
                      {isExpired(cert.expiry_date) && ' (Expired)'}
                    </span>
                  )}
                </div>
                {cert.credential_id && (
                  <span className="certification-credential">
                    ID: {cert.credential_id}
                  </span>
                )}
              </div>
              {isOwner && (
                <div className="certification-actions">
                  <button className="action-btn delete" onClick={() => handleDelete(cert.name)}>
                    <FiTrash2 />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="certification-form">
          <h4>Add Certification</h4>
          {formError && (
            <div className="form-error">
              <FiAlertCircle /> {formError}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="cert-name" className="form-label">Certification Name</label>
              <input
                id="cert-name"
                name="name"
                type="text"
                className="form-input"
                placeholder="e.g., Certified Scrum Master"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="cert-issuer" className="form-label">Issuer</label>
              <input
                id="cert-issuer"
                name="issuer"
                type="text"
                className="form-input"
                placeholder="e.g., Scrum Alliance"
                value={formData.issuer}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cert-issued" className="form-label">Issue Date</label>
                <input
                  id="cert-issued"
                  name="issued_date"
                  type="date"
                  className="form-input"
                  value={formData.issued_date}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="cert-expiry" className="form-label">Expiry Date (Optional)</label>
                <input
                  id="cert-expiry"
                  name="expiry_date"
                  type="date"
                  className="form-input"
                  value={formData.expiry_date}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="cert-credential" className="form-label">Credential ID (Optional)</label>
              <input
                id="cert-credential"
                name="credential_id"
                type="text"
                className="form-input"
                placeholder="e.g., CSM-12345"
                value={formData.credential_id}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary-sm" onClick={handleCancel}>
                <FiX /> Cancel
              </button>
              <button type="submit" className="btn-primary-sm" disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Certification'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
export default CertificationManager;
// frontend/src/components/tenant/domains/DomainSettingsPanel.jsx
import React, { useState } from 'react';
import './domains.css';

export const DomainSettingsPanel = ({ domain, onUpdate, onClose }) => {
    const [forceHttps, setForceHttps] = useState(domain?.force_https || true);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        await onUpdate({ force_https: forceHttps });
        setIsLoading(false);
    };

    return (
        <div className="domain-modal-overlay" onClick={onClose}>
            <div className="domain-modal" onClick={(e) => e.stopPropagation()}>
                <div className="domain-modal-header">
                    <h3 className="domain-modal-title">Domain Settings - {domain?.domain}</h3>
                    <button onClick={onClose} className="domain-modal-close">✕</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="domain-modal-body">
                        <div className="domain-form-group">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={forceHttps}
                                    onChange={(e) => setForceHttps(e.target.checked)}
                                    disabled={isLoading}
                                />
                                <span className="domain-form-label">Force HTTPS</span>
                            </label>
                            <p className="domain-form-hint">Automatically redirect all HTTP traffic to HTTPS</p>
                        </div>
                    </div>

                    <div className="domain-modal-footer">
                        <button type="button" onClick={onClose} className="domain-btn domain-btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" disabled={isLoading} className="domain-btn domain-btn-primary">
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
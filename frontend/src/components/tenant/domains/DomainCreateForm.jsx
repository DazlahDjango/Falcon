// frontend/src/components/tenant/domains/DomainCreateForm.jsx
import React, { useState } from 'react';
import './domains.css';

export const DomainCreateForm = ({ onSubmit, onCancel, isLoading = false }) => {
    const [domain, setDomain] = useState('');
    const [isPrimary, setIsPrimary] = useState(false);
    const [forceHttps, setForceHttps] = useState(true);
    const [error, setError] = useState('');

    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!domain) {
            setError('Domain is required');
            return;
        }

        if (!domainRegex.test(domain)) {
            setError('Please enter a valid domain name (e.g., example.com)');
            return;
        }

        onSubmit({
            domain,
            is_primary: isPrimary,
            force_https: forceHttps,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="domain-form">
            <div className="domain-form-group">
                <label className="domain-form-label">Domain Name *</label>
                <input
                    type="text"
                    value={domain}
                    onChange={(e) => {
                        setDomain(e.target.value);
                        setError('');
                    }}
                    placeholder="example.com"
                    className={`domain-form-input ${error ? 'domain-form-input-error' : ''}`}
                    disabled={isLoading}
                />
                {error && <p className="domain-form-error">{error}</p>}
                <p className="domain-form-hint">Enter the domain name you want to use for this tenant</p>
            </div>

            <div className="domain-form-group">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isPrimary}
                        onChange={(e) => setIsPrimary(e.target.checked)}
                        disabled={isLoading}
                    />
                    <span className="domain-form-label">Set as primary domain</span>
                </label>
                <p className="domain-form-hint">The primary domain will be the main access point for this tenant</p>
            </div>

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
                <p className="domain-form-hint">Automatically redirect HTTP to HTTPS</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="domain-btn domain-btn-secondary"
                    disabled={isLoading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="domain-btn domain-btn-primary"
                >
                    {isLoading ? 'Adding...' : 'Add Domain'}
                </button>
            </div>
        </form>
    );
};
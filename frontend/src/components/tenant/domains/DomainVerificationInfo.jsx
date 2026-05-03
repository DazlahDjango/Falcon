// frontend/src/components/tenant/domains/DomainVerificationInfo.jsx
import React from 'react';
import './domains.css';

export const DomainVerificationInfo = ({ domain }) => {
    const dnsRecord = `falcon-domain-verification=${domain?.verification_token}`;

    return (
        <div className="domain-verification-box">
            <div className="domain-verification-title">DNS Verification Required</div>
            <p className="text-sm text-gray-600 mb-2">Add the following TXT record to your domain's DNS settings:</p>

            <div className="domain-verification-record">
                <div><strong>Type:</strong> TXT</div>
                <div><strong>Name:</strong> @ or {domain?.domain}</div>
                <div><strong>Value:</strong> <code>{dnsRecord}</code></div>
            </div>

            <div className="domain-verification-instructions">
                <strong>Instructions:</strong>
                <ol>
                    <li>Log in to your domain registrar's DNS management console</li>
                    <li>Add a new TXT record</li>
                    <li>Set the host/name to <code>@</code> or your domain name</li>
                    <li>Paste the value above</li>
                    <li>Wait 5-30 minutes for DNS propagation</li>
                    <li>Click "Verify Now" to complete verification</li>
                </ol>
            </div>
        </div>
    );
};
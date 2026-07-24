// frontend/src/components/reports/shares/ShareLink.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiLink, FiCopy, FiCheck, FiExternalLink } from 'react-icons/fi';
import './shares.css';

export const ShareLink = ({
    shareId,
    link,
    token,
    variant = 'button',
    className = '',
}) => {
    const [copied, setCopied] = useState(false);

    const fullLink = link || `${window.location.origin}/share/${token}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(fullLink).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleOpen = () => {
        window.open(fullLink, '_blank');
    };

    if (variant === 'icon') {
        return (
            <div className={`share-link-icon ${className}`}>
                <button
                    className="link-btn"
                    onClick={handleCopy}
                    title="Copy Link"
                >
                    {copied ? <FiCheck size={16} color="#10b981" /> : <FiCopy size={16} />}
                </button>
                <button
                    className="link-btn"
                    onClick={handleOpen}
                    title="Open Link"
                >
                    <FiExternalLink size={16} />
                </button>
            </div>
        );
    }

    if (variant === 'inline') {
        return (
            <div className={`share-link-inline ${className}`}>
                <span className="link-text">{fullLink}</span>
                <button className="copy-btn" onClick={handleCopy}>
                    {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
                </button>
                <button className="open-btn" onClick={handleOpen}>
                    <FiExternalLink size={14} />
                </button>
            </div>
        );
    }

    return (
        <div className={`share-link-full ${className}`}>
            <div className="link-header">
                <FiLink size={18} />
                <span className="link-title">Share Link</span>
                {token && (
                    <span className="token-badge">
                        Token: {token.slice(0, 8)}...
                    </span>
                )}
            </div>
            <div className="link-content">
                <div className="link-url">
                    <span className="url-text">{fullLink}</span>
                </div>
                <div className="link-actions">
                    <button className="btn btn-secondary" onClick={handleCopy}>
                        {copied ? (
                            <>
                                <FiCheck size={16} />
                                Copied!
                            </>
                        ) : (
                            <>
                                <FiCopy size={16} />
                                Copy Link
                            </>
                        )}
                    </button>
                    <button className="btn btn-primary" onClick={handleOpen}>
                        <FiExternalLink size={16} />
                        Open Link
                    </button>
                </div>
            </div>
        </div>
    );
};

ShareLink.propTypes = {
    shareId: PropTypes.string,
    link: PropTypes.string,
    token: PropTypes.string,
    variant: PropTypes.oneOf(['button', 'icon', 'inline', 'full']),
    className: PropTypes.string,
};
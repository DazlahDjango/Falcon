import React, { useState, useEffect } from 'react';
import {
  FiX,
  FiRefreshCw,
  FiTrash2,
  FiAlertTriangle,
  FiClock,
  FiUser,
  FiKey,
} from 'react-icons/fi';
import { useSessions } from '../../../hooks/accounts/useSessions';
import { usePagination } from '../../../hooks/accounts/usePagination';

export const BlacklistManager = () => {
  const {
    getBlacklistedTokens,
    blacklistToken,
    blacklistedTokens,
    isLoading,
    error,
    clearError,
  } = useSessions();

  const [showBlacklistForm, setShowBlacklistForm] = useState(false);
  const [tokenId, setTokenId] = useState('');
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const pagination = usePagination({
    initialPage: 1,
    initialPageSize: 20,
    initialTotal: 0,
  });

  useEffect(() => {
    loadBlacklist();
  }, [pagination.page, pagination.pageSize]);

  const loadBlacklist = () => {
    getBlacklistedTokens({
      page: pagination.page,
      pageSize: pagination.pageSize,
    });
  };

  const handleBlacklist = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!tokenId.trim()) {
      setFormError('Token ID is required');
      return;
    }

    setActionLoading(true);
    try {
      const result = await blacklistToken(tokenId.trim(), reason);
      if (result.success !== false) {
        setTokenId('');
        setReason('');
        setShowBlacklistForm(false);
        loadBlacklist();
      } else {
        setFormError(result.error || 'Failed to blacklist token');
      }
    } catch (err) {
      setFormError(err?.message || 'Failed to blacklist token');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="blacklist-manager">
      <div className="blacklist-header">
        <div className="blacklist-title">
          <FiX className="title-icon" />
          <h3>Token Blacklist</h3>
          <span className="blacklist-count">{pagination.total} tokens</span>
        </div>
        <div className="blacklist-actions">
          <button
            className="btn-primary-sm"
            onClick={() => setShowBlacklistForm(!showBlacklistForm)}
          >
            {showBlacklistForm ? 'Cancel' : '+ Blacklist Token'}
          </button>
          <button className="btn-icon" onClick={loadBlacklist}>
            <FiRefreshCw className={isLoading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="blacklist-error">
          <span>{error}</span>
          <button onClick={clearError}>×</button>
        </div>
      )}

      {showBlacklistForm && (
        <form className="blacklist-form" onSubmit={handleBlacklist}>
          <div className="form-group">
            <label htmlFor="tokenId" className="form-label">Token ID (JTI)</label>
            <div className="form-input-wrapper">
              <FiKey className="input-icon" />
              <input
                id="tokenId"
                type="text"
                className={`form-input ${formError ? 'error' : ''}`}
                placeholder="Enter the token JTI to blacklist"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                disabled={actionLoading}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="reason" className="form-label">Reason (Optional)</label>
            <input
              id="reason"
              type="text"
              className="form-input"
              placeholder="Why is this token being blacklisted?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={actionLoading}
            />
          </div>
          {formError && <span className="form-error">{formError}</span>}
          <div className="blacklist-form-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={actionLoading}
            >
              {actionLoading ? 'Blacklisting...' : 'Blacklist Token'}
            </button>
          </div>
        </form>
      )}

      {blacklistedTokens.length === 0 ? (
        <div className="blacklist-empty">
          <FiX className="empty-icon" />
          <p>No blacklisted tokens</p>
        </div>
      ) : (
        <div className="blacklist-table-container">
          <table className="blacklist-table">
            <thead>
              <tr>
                <th>Token ID</th>
                <th>User</th>
                <th>Type</th>
                <th>Reason</th>
                <th>Blacklisted At</th>
                <th>Expires</th>
              </tr>
            </thead>
            <tbody>
              {blacklistedTokens.map((token) => (
                <tr key={token.id} className="blacklist-row">
                  <td>
                    <code className="token-id">{token.token_id}</code>
                  </td>
                  <td>
                    <div className="user-cell">
                      <FiUser className="user-icon" />
                      {token.user_email || 'Unknown'}
                    </div>
                  </td>
                  <td>
                    <span className="token-type">{token.token_type || 'refresh'}</span>
                  </td>
                  <td>{token.reason || '-'}</td>
                  <td>{formatDate(token.blacklisted_at)}</td>
                  <td>{formatDate(token.expires_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default BlacklistManager;
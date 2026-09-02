import React, { useRef, useEffect } from 'react';
import { buildLogEntries } from '../../../services/tenant';

export const ProvisioningLogs = ({ logs = [], statusMeta = null, onClear }) => {
  const scrollRef = useRef(null);
  const entries = logs?.length ? logs : buildLogEntries(statusMeta);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  const levelClass = (level) => {
    switch (level) {
      case 'success': return 'provisioning-log-success';
      case 'error': return 'provisioning-log-error';
      case 'warning': return 'provisioning-log-warning';
      default: return 'provisioning-log-info';
    }
  };

  const formatTime = (ts) => {
    if (!ts) return '—';
    try {
      return new Date(ts).toLocaleTimeString();
    } catch {
      return ts;
    }
  };

  return (
    <div className="provisioning-logs">
      <div className="provisioning-logs-header">
        <span className="provisioning-logs-title">Provisioning Log</span>
        {onClear && entries.length > 0 && (
          <button type="button" className="provisioning-logs-clear" onClick={onClear}>
            Clear
          </button>
        )}
      </div>
      <div className="provisioning-logs-content" ref={scrollRef}>
        {entries.length === 0 ? (
          <div className="provisioning-log-entry provisioning-log-info">
            <span className="provisioning-log-time">{formatTime(new Date().toISOString())}</span>
            No log entries yet. Waiting for provisioning to begin...
          </div>
        ) : (
          entries.map((entry, idx) => (
            <div key={idx} className={`provisioning-log-entry ${levelClass(entry.level)}`}>
              <span className="provisioning-log-time">{formatTime(entry.time)}</span>
              {typeof entry.message === 'object' ? (entry.message?.message || JSON.stringify(entry.message)) : entry.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

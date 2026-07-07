// components/tenant/resources/ResourceCard.jsx
import React from 'react';
import { FiRefreshCw, FiEdit, FiTrash2, FiPlusCircle, FiMinusCircle, FiZap } from 'react-icons/fi';
import ResourceUsageGauge from './ResourceUsageGauge';
import ResourceStatusBadge from './ResourceStatusBadge';

const ResourceCard = ({ resource, onReset, onEdit, onDelete, onIncrement, onDecrement, loading }) => {
  const typeIcons = {
    USERS: '👥',
    STORAGE_MB: '💾',
    API_CALLS_PER_DAY: '📡',
    DEPARTMENTS: '🏢',
    CONCURRENT_SESSIONS: '🔄',
    KPIS: '📊',
  };
  const icon = typeIcons[resource?.resource_type] || '📦';

  const hasBurst = resource?.burst_allowed;
  const softLimit = resource?.soft_limit;
  const hardLimit = resource?.hard_limit;

  return (
    <div className="resource-card resource-card-hover">
      {/* Header */}
      <div className="resource-flex-between resource-mb-4">
        <div className="resource-flex resource-gap-2">
          <span style={{ fontSize: '24px' }}>{icon}</span>
          <div>
            <h3 className="resource-font-semibold resource-text-sm" style={{ color: '#0f172a' }}>
              {resource?.resource_type_display || resource?.resource_type}
            </h3>
            <p className="resource-text-xs resource-text-muted">{resource?.resource_type}</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <ResourceStatusBadge resource={resource} />
          {hasBurst && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '3px',
              fontSize: '10px', fontWeight: 600, color: '#7c3aed',
              background: '#ede9fe', padding: '2px 6px', borderRadius: '4px'
            }}>
              <FiZap size={10} /> Burst
            </span>
          )}
        </div>
      </div>

      {/* Gauge */}
      <div className="resource-flex-center">
        <ResourceUsageGauge resource={resource} />
      </div>

      {/* Soft / Hard limit row */}
      {(softLimit || hardLimit) && (
        <div className="resource-flex resource-gap-2" style={{ justifyContent: 'center', marginTop: '8px' }}>
          {softLimit && (
            <span style={{ fontSize: '10px', color: '#92400e', background: '#fef3c7', padding: '2px 6px', borderRadius: '4px' }}>
              Soft: {softLimit}
            </span>
          )}
          {hardLimit && (
            <span style={{ fontSize: '10px', color: '#991b1b', background: '#fee2e2', padding: '2px 6px', borderRadius: '4px' }}>
              Hard: {hardLimit}
            </span>
          )}
        </div>
      )}

      <div className="resource-divider"></div>

      {/* Quick increment/decrement row */}
      {(onIncrement || onDecrement) && (
        <div className="resource-flex resource-gap-2" style={{ justifyContent: 'center', marginBottom: '8px' }}>
          {onDecrement && (
            <button
              className="resource-btn resource-btn-secondary resource-btn-sm"
              onClick={() => onDecrement && onDecrement(resource.id, 1)}
              disabled={loading}
              title="Decrement usage by 1"
            >
              <FiMinusCircle size={14} style={{ marginRight: '4px' }} />
              -1
            </button>
          )}
          {onIncrement && (
            <button
              className="resource-btn resource-btn-secondary resource-btn-sm"
              onClick={() => onIncrement && onIncrement(resource.id, 1)}
              disabled={loading}
              title="Increment usage by 1"
            >
              <FiPlusCircle size={14} style={{ marginRight: '4px' }} />
              +1
            </button>
          )}
        </div>
      )}

      {/* Main actions row */}
      <div className="resource-flex resource-gap-2" style={{ justifyContent: 'center' }}>
        <button
          className="resource-btn resource-btn-primary resource-btn-sm"
          onClick={() => onReset && onReset(resource.id)}
          disabled={loading}
          title="Reset usage"
        >
          <FiRefreshCw size={14} style={{ marginRight: '4px' }} />
          Reset
        </button>
        <button
          className="resource-btn resource-btn-secondary resource-btn-sm"
          onClick={() => onEdit && onEdit(resource.id)}
          disabled={loading}
          title="Edit limits"
        >
          <FiEdit size={14} style={{ marginRight: '4px' }} />
          Edit
        </button>
        <button
          className="resource-btn resource-btn-danger resource-btn-sm"
          onClick={() => onDelete && onDelete(resource.id)}
          disabled={loading}
          title="Delete"
        >
          <FiTrash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export default ResourceCard;
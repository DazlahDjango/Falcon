// components/tenant/sectors/SectorCard.jsx
import React from 'react';
import { FiEdit, FiTrash2, FiPower } from 'react-icons/fi';
import SectorStatusBadge from './SectorStatusBadge';

const SectorCard = ({ sector, onEdit, onDelete, onToggle, loading }) => {
  const typeColors = {
    COMMERCIAL: { bg: '#dbeafe', color: '#1e40af', label: 'Commercial' },
    NGO: { bg: '#dcfce7', color: '#166534', label: 'Non-Profit' },
    PUBLIC: { bg: '#ede9fe', color: '#5b21b6', label: 'Public Sector' },
    CONSULTING: { bg: '#ffedd5', color: '#9a3412', label: 'Consulting' },
  };
  const typeConfig = typeColors[sector.sector_type] || { bg: '#f1f5f9', color: '#475569', label: sector.sector_type };

  return (
    <div className="sector-card sector-card-hover">
      <div className="sector-flex-between sector-mb-4">
        <div className="sector-flex sector-gap-3">
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: sector.color || typeConfig.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: '700',
              color: sector.color ? '#ffffff' : typeConfig.color,
            }}
          >
            {sector.icon || sector.name?.charAt(0) || 'S'}
          </div>
          <div>
            <h3 className="sector-font-semibold sector-text-sm" style={{ color: '#0f172a' }}>
              {sector.name}
            </h3>
            <p className="sector-text-xs sector-text-muted">{sector.code}</p>
          </div>
        </div>
        <SectorStatusBadge isActive={sector.is_active} />
      </div>

      <div className="sector-space-y-2">
        <div className="sector-flex sector-gap-2">
          <span className="sector-text-xs sector-text-muted">Type:</span>
          <span
            className="sector-badge"
            style={{ background: typeConfig.bg, color: typeConfig.color }}
          >
            {typeConfig.label}
          </span>
        </div>
        {sector.description && (
          <p className="sector-text-sm sector-text-muted" style={{ fontSize: '13px' }}>
            {sector.description}
          </p>
        )}
        {sector.metadata && Object.keys(sector.metadata).length > 0 && (
          <div className="sector-flex sector-gap-2">
            <span className="sector-text-xs sector-text-muted">Metadata:</span>
            <span className="sector-text-xs" style={{ color: '#0f172a' }}>
              {Object.keys(sector.metadata).join(', ')}
            </span>
          </div>
        )}
        <div className="sector-divider"></div>
        <div className="sector-flex sector-gap-2" style={{ justifyContent: 'flex-end' }}>
          <button
            className="sector-btn sector-btn-secondary sector-btn-sm"
            onClick={() => onEdit && onEdit(sector.id)}
            disabled={loading}
            title="Edit"
          >
            <FiEdit size={14} style={{ marginRight: '4px' }} />
            Edit
          </button>
          <button
            className={`sector-btn sector-btn-sm ${sector.is_active ? 'sector-btn-warning' : 'sector-btn-success'}`}
            onClick={() => onToggle && onToggle(sector.id)}
            disabled={loading}
            title={sector.is_active ? 'Deactivate' : 'Activate'}
          >
            <FiPower size={14} style={{ marginRight: '4px' }} />
            {sector.is_active ? 'Deactivate' : 'Activate'}
          </button>
          <button
            className="sector-btn sector-btn-danger sector-btn-sm"
            onClick={() => onDelete && onDelete(sector.id)}
            disabled={loading}
            title="Delete"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SectorCard;
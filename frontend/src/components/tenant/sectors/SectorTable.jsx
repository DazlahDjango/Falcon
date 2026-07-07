// components/tenant/sectors/SectorTable.jsx
import React from 'react';
import { FiEdit, FiTrash2, FiPower } from 'react-icons/fi';
import SectorStatusBadge from './SectorStatusBadge';

const SectorTable = ({ sectors, onEdit, onDelete, onToggle, loading }) => {
  if (!sectors || sectors.length === 0) {
    return (
      <div className="sector-empty-state">
        <div className="sector-empty-icon">🏢</div>
        <p className="sector-empty-title">No sectors found</p>
        <p className="sector-empty-desc">Create a sector to get started</p>
      </div>
    );
  }

  const typeConfig = {
    COMMERCIAL: { label: 'Commercial', color: '#dbeafe' },
    NGO: { label: 'Non-Profit', color: '#dcfce7' },
    PUBLIC: { label: 'Public Sector', color: '#f3e8ff' },
    CONSULTING: { label: 'Consulting', color: '#fef3c7' },
  };

  return (
    <div className="sector-card" style={{ 
      overflowX: 'auto', 
      overflowY: 'hidden',
      maxWidth: '100%',
      WebkitOverflowScrolling: 'touch',
      scrollBehavior: 'smooth',
      borderRadius: '8px'
    }}>
      <table className="sector-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead className="sector-table-head">
          <tr>
            <th style={{ minWidth: '160px', padding: '8px 10px', fontSize: '12px', fontWeight: '600' }}>Name</th>
            <th style={{ minWidth: '80px', padding: '8px 10px', fontSize: '12px', fontWeight: '600' }}>Code</th>
            <th style={{ minWidth: '130px', padding: '8px 10px', fontSize: '12px', fontWeight: '600' }}>Type</th>
            <th style={{ minWidth: '90px', padding: '8px 10px', fontSize: '12px', fontWeight: '600' }}>Status</th>
            <th style={{ minWidth: '90px', padding: '8px 10px', fontSize: '12px', fontWeight: '600' }}>Created</th>
            <th style={{ 
              minWidth: '160px',
              padding: '8px 10px',
              fontSize: '12px',
              fontWeight: '600',
              position: 'sticky',
              right: 0,
              background: '#f3f4f6',
              zIndex: 10,
              borderLeft: '1px solid #e5e7eb',
              textAlign: 'center'
            }}>Actions</th>
          </tr>
        </thead>
        <tbody className="sector-table-body">
          {sectors.map((sector) => (
            <tr key={sector.id}>
              <td style={{ padding: '8px 10px', minWidth: '160px', fontSize: '13px' }}>
                <div className="sector-flex sector-gap-2" style={{ alignItems: 'center' }}>
                  {sector.color && (
                    <span
                      style={{
                        display: 'inline-block',
                        width: '12px',
                        height: '12px',
                        borderRadius: '4px',
                        background: sector.color,
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <span className="sector-font-semibold" style={{ color: '#0f172a' }}>
                    {sector.name}
                  </span>
                </div>
              </td>
              <td style={{ padding: '8px 10px', minWidth: '80px', fontSize: '12px' }} className="sector-text-muted">
                {sector.code}
              </td>
              <td style={{ padding: '8px 10px', minWidth: '130px', fontSize: '12px' }}>
                <span className="sector-badge" style={{
                  background: typeConfig[sector.sector_type]?.color || '#f3f4f6',
                  color: sector.sector_type === 'COMMERCIAL' ? '#1e40af' :
                         sector.sector_type === 'NGO' ? '#166534' :
                         sector.sector_type === 'PUBLIC' ? '#6b21a8' : '#b45309',
                  fontSize: '11px',
                  padding: '3px 6px'
                }}>
                  {typeConfig[sector.sector_type]?.label || sector.sector_type}
                </span>
              </td>
              <td style={{ padding: '8px 10px', minWidth: '90px' }}>
                <SectorStatusBadge isActive={sector.is_active} />
              </td>
              <td style={{ padding: '8px 10px', minWidth: '90px', fontSize: '12px' }} className="sector-text-muted">
                {sector.created_at ? new Date(sector.created_at).toLocaleDateString() : 'N/A'}
              </td>
              <td style={{ 
                padding: '6px 8px', 
                minWidth: '160px',
                position: 'sticky',
                right: 0,
                background: '#ffffff',
                zIndex: 9,
                borderLeft: '1px solid #e5e7eb'
              }}>
                <div className="sector-flex sector-gap-1" style={{ justifyContent: 'center', gap: '2px' }}>
                  <button
                    className="sector-btn sector-btn-secondary sector-btn-sm"
                    onClick={() => onEdit && onEdit(sector.id)}
                    disabled={loading}
                    title="Edit"
                    style={{ padding: '3px 5px', fontSize: '12px' }}
                  >
                    <FiEdit size={13} />
                  </button>
                  <button
                    className={`sector-btn sector-btn-sm ${sector.is_active ? 'sector-btn-warning' : 'sector-btn-success'}`}
                    onClick={() => onToggle && onToggle(sector.id)}
                    disabled={loading}
                    title={sector.is_active ? 'Deactivate' : 'Activate'}
                    style={{ padding: '3px 5px', fontSize: '12px' }}
                  >
                    <FiPower size={13} />
                  </button>
                  <button
                    className="sector-btn sector-btn-danger sector-btn-sm"
                    onClick={() => onDelete && onDelete(sector.id)}
                    disabled={loading}
                    title="Delete"
                    style={{ padding: '3px 5px', fontSize: '12px' }}
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SectorTable;

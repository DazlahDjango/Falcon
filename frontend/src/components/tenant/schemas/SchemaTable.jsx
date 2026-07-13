// components/tenant/schemas/SchemaTable.jsx
import React from 'react';
import { FiEye, FiEdit, FiTrash2, FiPlay, FiStopCircle, FiRefreshCw } from 'react-icons/fi';
import SchemaStatusBadge from './SchemaStatusBadge';

const SchemaTable = ({ schemas, onView, onEdit, onDelete, onProvision, onDrop, onUpdateStats, loading }) => {
  if (!schemas || schemas.length === 0) {
    return (
      <div className="schema-empty-state">
        <div className="schema-empty-icon">🗄️</div>
        <p className="schema-empty-title">No schemas found</p>
        <p className="schema-empty-desc">Create a schema for your organization</p>
      </div>
    );
  }

  return (
    <div className="schema-card" style={{ 
      overflowX: 'auto', 
      overflowY: 'hidden',
      maxWidth: '100%',
      WebkitOverflowScrolling: 'touch',
      scrollBehavior: 'smooth',
      borderRadius: '8px'
    }}>
      <table className="schema-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead className="schema-table-head">
          <tr>
            <th style={{ minWidth: '140px', padding: '8px 10px', fontSize: '12px', fontWeight: '600' }}>Schema Name</th>
            <th style={{ minWidth: '90px', padding: '8px 10px', fontSize: '12px', fontWeight: '600' }}>Organization</th>
            <th style={{ minWidth: '100px', padding: '8px 10px', fontSize: '12px', fontWeight: '600' }}>Type</th>
            <th style={{ minWidth: '80px', padding: '8px 10px', fontSize: '12px', fontWeight: '600' }}>Status</th>
            <th style={{ minWidth: '80px', padding: '8px 10px', fontSize: '12px', fontWeight: '600' }}>Ready</th>
            <th style={{ minWidth: '50px', padding: '8px 10px', fontSize: '12px', fontWeight: '600' }}>Tables</th>
            <th style={{ minWidth: '70px', padding: '8px 10px', fontSize: '12px', fontWeight: '600' }}>Size</th>
            <th style={{ minWidth: '80px', padding: '8px 10px', fontSize: '12px', fontWeight: '600' }}>Created</th>
            <th style={{ 
              minWidth: '200px',
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
        <tbody className="schema-table-body">
          {schemas.map((schema) => (
            <tr key={schema.id}>
              <td style={{ padding: '8px 10px', minWidth: '140px', fontSize: '13px' }}>
                <div className="schema-font-semibold" style={{ color: '#0f172a' }}>
                  {schema.schema_name}
                </div>
              </td>
              <td style={{ padding: '8px 10px', minWidth: '90px', fontSize: '12px' }} className="schema-text-muted">
                {schema.organization_name || schema.organization?.name || 'N/A'}
              </td>
              <td style={{ padding: '8px 10px', minWidth: '100px', fontSize: '12px' }}>
                <span className="schema-badge" style={{
                  background: schema.schema_type === 'shared_schema' ? '#fecaca' :
                              schema.schema_type === 'separate_schema' ? '#bfdbfe' : '#d1d5db',
                  color: schema.schema_type === 'shared_schema' ? '#991b1b' :
                         schema.schema_type === 'separate_schema' ? '#1e40af' : '#374151',
                  fontSize: '11px',
                  padding: '3px 6px'
                }}>
                  {schema.schema_type === 'shared_schema' ? 'Shared' :
                   schema.schema_type === 'separate_schema' ? 'Separate Schema' : 'Separate DB'}
                </span>
              </td>
              <td style={{ padding: '8px 10px', minWidth: '80px' }}><SchemaStatusBadge status={schema.status} /></td>
              <td style={{ padding: '8px 10px', minWidth: '80px' }}>
                {schema.is_ready ? (
                  <span className="schema-badge schema-badge-green" style={{ fontSize: '11px', padding: '3px 6px' }}>Ready</span>
                ) : (
                  <span className="schema-badge schema-badge-gray" style={{ fontSize: '11px', padding: '3px 6px' }}>Not Ready</span>
                )}
              </td>
              <td style={{ padding: '8px 10px', minWidth: '50px', fontSize: '12px' }} className="schema-text-muted">{schema.table_count || 0}</td>
              <td style={{ padding: '8px 10px', minWidth: '70px', fontSize: '12px' }} className="schema-text-muted">
                {schema.size_mb ? `${schema.size_mb.toFixed(1)} MB` : 'N/A'}
              </td>
              <td style={{ padding: '8px 10px', minWidth: '80px', fontSize: '12px' }} className="schema-text-muted">
                {schema.created_at ? new Date(schema.created_at).toLocaleDateString() : 'N/A'}
              </td>
              <td style={{ 
                padding: '6px 8px', 
                minWidth: '200px',
                position: 'sticky',
                right: 0,
                background: '#ffffff',
                zIndex: 9,
                borderLeft: '1px solid #e5e7eb'
              }}>
                <div className="schema-flex schema-gap-1" style={{ justifyContent: 'center', flexWrap: 'wrap', gap: '2px' }}>
                  <button
                    className="schema-btn schema-btn-secondary schema-btn-sm"
                    onClick={() => onView && onView(schema.id)}
                    disabled={loading}
                    title="View"
                    style={{ padding: '3px 5px', fontSize: '12px' }}
                  >
                    <FiEye size={13} />
                  </button>
                  <button
                    className="schema-btn schema-btn-secondary schema-btn-sm"
                    onClick={() => onEdit && onEdit(schema.id)}
                    disabled={loading}
                    title="Edit"
                    style={{ padding: '3px 5px', fontSize: '12px' }}
                  >
                    <FiEdit size={13} />
                  </button>
                  {schema.status === 'PENDING' && (
                    <button
                      className="schema-btn schema-btn-success schema-btn-sm"
                      onClick={() => onProvision && onProvision(schema.id)}
                      disabled={loading}
                      title="Provision"
                      style={{ padding: '3px 5px', fontSize: '12px' }}
                    >
                      <FiPlay size={13} />
                    </button>
                  )}
                  {(schema.status === 'ACTIVE' || schema.status === 'MIGRATING') && (
                    <button
                      className="schema-btn schema-btn-warning schema-btn-sm"
                      onClick={() => onDrop && onDrop(schema.id)}
                      disabled={loading}
                      title="Drop"
                      style={{ padding: '3px 5px', fontSize: '12px' }}
                    >
                      <FiStopCircle size={13} />
                    </button>
                  )}
                  {schema.status === 'ACTIVE' && (
                    <button
                      className="schema-btn schema-btn-primary schema-btn-sm"
                      onClick={() => onUpdateStats && onUpdateStats(schema.id)}
                      disabled={loading}
                      title="Update Stats"
                      style={{ padding: '3px 5px', fontSize: '12px' }}
                    >
                      <FiRefreshCw size={13} />
                    </button>
                  )}
                  <button
                    className="schema-btn schema-btn-danger schema-btn-sm"
                    onClick={() => onDelete && onDelete(schema.id)}
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

export default SchemaTable;
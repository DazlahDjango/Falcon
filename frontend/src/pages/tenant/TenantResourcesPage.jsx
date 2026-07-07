// frontend/src/pages/tenant/TenantResourcesPage.jsx
import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit2, FiX } from 'react-icons/fi';
import {
  ResourceUsageDashboard,
  ResourceLimitTable,
  ResourceLimitForm,
} from '../../components/tenant/resources';
import { useResources } from '../../hooks/tenant';
import { TENANT_ROUTES } from '../../config/constants/tenantRouteConstants';

export const TenantResourcesPage = () => {
  const { tenantId, orgId } = useParams();
  const navigate = useNavigate();

  // Prefer orgId from org-scoped URL, fallback to tenantId
  const organizationId = orgId || tenantId;

  const {
    resources,
    loading,
    update,
    increment,
    decrement,
    snapshot,
    syncFromBilling,
    fetchList,
  } = useResources({
    autoFetch: !!organizationId,
    filters: organizationId ? { organization_id: organizationId } : {},
  });

  const [editingResource, setEditingResource] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const handleEditResource = useCallback((resource) => {
    setEditingResource(resource);
    setSaveError(null);
  }, []);

  const handleSaveResource = useCallback(async (data) => {
    if (!editingResource) return;
    setSaving(true);
    setSaveError(null);
    try {
      await update(editingResource.id, {
        limit_value: data.limit_value,
        soft_limit: data.soft_limit ?? null,
        hard_limit: data.hard_limit ?? null,
        warning_threshold: data.warning_threshold,
        burst_allowed: data.burst_allowed,
      });
      setEditingResource(null);
      fetchList();
    } catch (err) {
      setSaveError(err?.message || 'Failed to save resource');
    } finally {
      setSaving(false);
    }
  }, [editingResource, update, fetchList]);

  const handleIncrement = useCallback(async (id, amount = 1) => {
    try { await increment(id, amount); }
    catch (err) { console.error('Increment failed:', err); }
  }, [increment]);

  const handleDecrement = useCallback(async (id, amount = 1) => {
    try { await decrement(id, amount); }
    catch (err) { console.error('Decrement failed:', err); }
  }, [decrement]);

  const handleSnapshot = useCallback(async (id) => {
    try { await snapshot(id, 'manual'); }
    catch (err) { console.error('Snapshot failed:', err); }
  }, [snapshot]);

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="mb-6 flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Resource Management
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
            Monitor and manage organization resource limits
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => syncFromBilling(organizationId || null).catch(() => {})}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', background: '#6366f1', color: '#fff',
              border: 'none', borderRadius: '8px', fontWeight: 600,
              fontSize: '13px', cursor: 'pointer', opacity: loading ? 0.6 : 1,
            }}
          >
            Sync from Billing
          </button>
          {organizationId && (
            <button
              onClick={() => navigate(TENANT_ROUTES.RESOURCES_ORGANIZATION(organizationId))}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', background: '#f1f5f9', color: '#475569',
                border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: 500,
                fontSize: '13px', cursor: 'pointer',
              }}
            >
              Full Resource Page
            </button>
          )}
        </div>
      </div>

      {/* Usage dashboard — self-managing component */}
      <ResourceUsageDashboard
        organizationId={organizationId}
        loading={loading}
      />

      {/* Resource limits table */}
      <div style={{ marginTop: '28px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', marginBottom: '14px' }}>
          Resource Limits Detail
        </h2>
        <ResourceLimitTable
          resources={resources}
          onEdit={handleEditResource}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
          onSnapshot={handleSnapshot}
          loading={loading}
        />
      </div>

      {/* Edit resource modal */}
      {editingResource && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
        }}>
          <div style={{
            background: '#fff', borderRadius: '12px', padding: '28px',
            width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiEdit2 size={16} style={{ color: '#6366f1' }} />
                Edit Resource Limit
              </h3>
              <button
                onClick={() => setEditingResource(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <FiX size={20} />
              </button>
            </div>

            {saveError && (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                {saveError}
              </div>
            )}

            <ResourceLimitForm
              resource={editingResource}
              onSubmit={handleSaveResource}
              onCancel={() => setEditingResource(null)}
              isLoading={saving}
            />
          </div>
        </div>
      )}
    </div>
  );
};
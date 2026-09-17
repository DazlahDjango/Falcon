import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FiX,
  FiShield,
  FiCheck,
  FiSlash,
  FiRotateCcw,
  FiSave,
  FiSearch,
  FiFilter,
  FiAlertCircle,
  FiCheckCircle,
} from 'react-icons/fi';
import { UserRoleBadge } from '../users/UserRoleBadge';
import { getUserPermissions, updateUserPermissions } from '../../../services/accounts/api/users';

const CATEGORY_LABELS = {
  kpi: 'KPI Management',
  review: 'Appraisals & Reviews',
  user: 'User Management',
  structure: 'Organization Structure',
  report: 'Reports & Analytics',
  config: 'Tenant Configuration',
  billing: 'Billing & Plans',
  workflow: 'Workflows & Approvals',
  admin: 'Administration',
};

export const UserPermissionModal = ({ user, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [roleDefaults, setRoleDefaults] = useState([]);
  const [granted, setGranted] = useState(new Set());
  const [revoked, setRevoked] = useState(new Set());
  const [allAvailable, setAllAvailable] = useState([]);
  const [roleDisplay, setRoleDisplay] = useState(user?.role || '');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Load permission breakdown from backend
  const loadUserPermissions = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getUserPermissions(user.id);
      const data = res.data || res;
      setRoleDefaults(data.role_defaults || []);
      setGranted(new Set(data.granted || []));
      setRevoked(new Set(data.revoked || []));
      setAllAvailable(data.all_available || []);
      setRoleDisplay(data.role_display || data.role || user.role);
    } catch (err) {
      console.error('Failed to load user permissions:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load user permissions');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadUserPermissions();
  }, [loadUserPermissions]);

  // Handle toggle logic
  const handleToggle = (codename) => {
    const isDefault = roleDefaults.includes(codename);
    
    if (isDefault) {
      // Toggle revoke state
      setRevoked((prev) => {
        const next = new Set(prev);
        if (next.has(codename)) {
          next.delete(codename);
        } else {
          next.add(codename);
        }
        return next;
      });
      // Ensure it's not in granted
      setGranted((prev) => {
        const next = new Set(prev);
        next.delete(codename);
        return next;
      });
    } else {
      // Toggle grant state
      setGranted((prev) => {
        const next = new Set(prev);
        if (next.has(codename)) {
          next.delete(codename);
        } else {
          next.add(codename);
        }
        return next;
      });
      // Ensure it's not in revoked
      setRevoked((prev) => {
        const next = new Set(prev);
        next.delete(codename);
        return next;
      });
    }
  };

  // Reset overrides to role defaults
  const handleResetToDefaults = () => {
    setGranted(new Set());
    setRevoked(new Set());
  };

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await updateUserPermissions(user.id, {
        granted: Array.from(granted),
        revoked: Array.from(revoked),
      });
      setSuccessMessage('User permissions updated and cache invalidated successfully.');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to update permissions:', err);
      setError(err.response?.data?.error || err.message || 'Failed to update permissions');
    } finally {
      setSaving(false);
    }
  };

  // Compute effective status
  const effectiveCount = useMemo(() => {
    const roleSet = new Set(roleDefaults);
    granted.forEach((p) => roleSet.add(p));
    revoked.forEach((p) => roleSet.delete(p));
    return roleSet.size;
  }, [roleDefaults, granted, revoked]);

  // Filter permissions
  const filteredPermissions = useMemo(() => {
    return allAvailable.filter((p) => {
      const matchesSearch =
        !searchTerm ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.codename.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat =
        selectedCategory === 'all' || p.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [allAvailable, searchTerm, selectedCategory]);

  const categories = useMemo(() => {
    const set = new Set(allAvailable.map((p) => p.category).filter(Boolean));
    return Array.from(set);
  }, [allAvailable]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FiShield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  {user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username}
                </h2>
                <UserRoleBadge role={user.role} />
              </div>
              <p className="text-xs text-slate-400">{user.email} • Manage Dynamic Permissions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Summary Bar */}
        <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Role Base:</span>
              <span className="font-semibold text-emerald-400">{roleDefaults.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Granted Overrides:</span>
              <span className="font-semibold text-sky-400">+{granted.size}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Revoked:</span>
              <span className="font-semibold text-rose-400">-{revoked.size}</span>
            </div>
            <div className="h-3 w-px bg-slate-700" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Effective Active:</span>
              <span className="font-bold text-indigo-300">{effectiveCount}</span>
            </div>
          </div>

          <button
            onClick={handleResetToDefaults}
            disabled={granted.size === 0 && revoked.size === 0}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition text-xs"
          >
            <FiRotateCcw className="w-3.5 h-3.5" />
            Reset to Role Defaults
          </button>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="p-4 border-b border-slate-800/80 flex flex-wrap gap-3 items-center justify-between bg-slate-900/50">
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search permissions by name or codename..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950/80 border border-slate-700/80 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                {CATEGORY_LABELS[cat] || cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <FiAlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <FiCheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Body / Permissions Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading permission catalog...</span>
            </div>
          ) : filteredPermissions.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              No matching permissions found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredPermissions.map((perm) => {
                const isRoleDefault = roleDefaults.includes(perm.codename);
                const isCustomGranted = granted.has(perm.codename);
                const isCustomRevoked = revoked.has(perm.codename);
                const isActive = (isRoleDefault || isCustomGranted) && !isCustomRevoked;

                let badgeText = 'Inactive';
                let badgeClass = 'bg-slate-800 text-slate-400 border-slate-700';

                if (isCustomGranted) {
                  badgeText = 'Custom Granted';
                  badgeClass = 'bg-sky-500/15 text-sky-400 border-sky-500/30 font-semibold';
                } else if (isCustomRevoked) {
                  badgeText = 'Revoked';
                  badgeClass = 'bg-rose-500/15 text-rose-400 border-rose-500/30 font-semibold';
                } else if (isRoleDefault) {
                  badgeText = 'Role Default';
                  badgeClass = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-semibold';
                }

                return (
                  <div
                    key={perm.codename}
                    onClick={() => handleToggle(perm.codename)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 select-none ${
                      isActive
                        ? 'bg-slate-800/60 border-indigo-500/30 hover:border-indigo-500/60'
                        : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-white truncate">
                          {perm.name}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${badgeClass}`}>
                          {badgeText}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-[11px] text-slate-400 font-mono bg-slate-950/60 px-1.5 py-0.5 rounded">
                          {perm.codename}
                        </code>
                        <span className="text-[10px] text-slate-500">
                          {CATEGORY_LABELS[perm.category] || perm.category} • {perm.level}
                        </span>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <div
                      className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 ${
                        isActive ? 'bg-indigo-600' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                          isActive ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Changes apply in real-time and clear Redis user session permission caches.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-sm font-medium text-white transition shadow-lg shadow-indigo-600/20"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  Save Permissions
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// src/components/reviews/pips/create/PIPForm.jsx
import React, { useEffect, useMemo, useRef } from 'react';
import { useEmployees, useTeam } from '../../../../hooks/accounts';
import { useCycles, useReviewsPermissions } from '../../../../hooks/reviews';
import { useAuthContext } from '../../../../contexts/accounts/AuthContext';

const PIPForm = ({ data = {}, onChange }) => {
  const { user } = useAuthContext();
  const { isAdmin, isHrAdmin, isExecutive, isSupervisor } = useReviewsPermissions();
  const { data: employees, loading: employeesLoading } = useEmployees();
  const { teamMembers, isLoading: teamLoading } = useTeam();
  const { data: cycles, loading: cyclesLoading } = useCycles({ autoFetch: true });
  const autoSelectedRef = useRef(false);

  const isLeadOnly = isSupervisor && !isAdmin && !isHrAdmin && !isExecutive;

  // Normalized employees list
  const empList = useMemo(() => {
    const raw = Array.isArray(employees) ? employees : (employees?.results || employees?.data || employees?.team || []);
    return raw.map((emp) => ({
      ...emp,
      id: emp.id,
      full_name: emp.full_name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.email,
      email: emp.email,
    }));
  }, [employees]);

  // Normalized direct team list
  const directTeam = useMemo(() => {
    const raw = Array.isArray(teamMembers) ? teamMembers : (teamMembers?.team || teamMembers?.results || teamMembers?.data || []);
    return raw.map((emp) => ({
      ...emp,
      id: emp.id,
      full_name: emp.full_name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.email,
      email: emp.email,
    }));
  }, [teamMembers]);

  // Combined owners list (current logged-in lead + all available users)
  const allOwners = useMemo(() => {
    const map = new Map();
    if (user?.id) {
      map.set(String(user.id), {
        id: user.id,
        full_name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
        email: user.email,
      });
    }
    directTeam.forEach((u) => map.set(String(u.id), u));
    empList.forEach((u) => map.set(String(u.id), u));
    return Array.from(map.values());
  }, [user, directTeam, empList]);

  // Filter employees for Leads to only show direct reports
  const displayEmployees = useMemo(() => {
    if (isLeadOnly && user) {
      const uid = String(user.id || user.pk || '').toLowerCase();
      const uemail = String(user.email || '').toLowerCase();

      const matchedEmployees = empList.filter((emp) => {
        const mgr = emp.manager;
        const mgrId = String(emp.manager_id || emp.supervisor_id || (typeof mgr === 'object' ? mgr?.id : mgr) || '').toLowerCase();
        const mgrEmail = String((typeof mgr === 'object' ? mgr?.email : (typeof mgr === 'string' && mgr.includes('@') ? mgr : '')) || '').toLowerCase();
        const reportsTo = String(emp.position?.reports_to_user_id || '').toLowerCase();

        return (uid && (mgrId === uid || reportsTo === uid)) || (uemail && mgrEmail === uemail);
      });

      const map = new Map();
      directTeam.forEach((u) => map.set(String(u.id), u));
      matchedEmployees.forEach((u) => map.set(String(u.id), u));
      const res = Array.from(map.values());
      return res.length > 0 ? res : empList;
    }

    return empList;
  }, [empList, directTeam, isLeadOnly, user]);

  // Identify active cycle and sort active to the top
  const { sortedCycles, defaultActiveCycle } = useMemo(() => {
    const rawList = Array.isArray(cycles) ? cycles : (cycles?.results || cycles?.data || []);
    if (!rawList || rawList.length === 0) return { sortedCycles: [], defaultActiveCycle: null };

    const active = rawList.find(
      (c) => c.status === 'active' || c.status === 'ACTIVE' || c.status === 'submitted' || c.is_active
    ) || rawList[0];

    const sorted = [...rawList].sort((a, b) => {
      const aIsActive = (a.id === active?.id || a.status === 'active' || a.status === 'submitted') ? 1 : 0;
      const bIsActive = (b.id === active?.id || b.status === 'active' || b.status === 'submitted') ? 1 : 0;
      return bIsActive - aIsActive;
    });

    return { sortedCycles: sorted, defaultActiveCycle: active };
  }, [cycles]);

  // Auto-select active review cycle & default owner once
  useEffect(() => {
    if (!autoSelectedRef.current && defaultActiveCycle?.id && !data.review_cycle) {
      autoSelectedRef.current = true;
      onChange?.({
        ...data,
        review_cycle: defaultActiveCycle.id,
        owner: data.owner || user?.id || ''
      });
    }
  }, [defaultActiveCycle?.id, data.review_cycle, data.owner, user?.id, onChange]);

  const handleChange = (field, value) => {
    onChange?.({ ...data, [field]: value });
  };

  const severityOptions = [
    { value: 'minor', label: 'Minor - Coaching Required' },
    { value: 'moderate', label: 'Moderate - Formal PIP' },
    { value: 'severe', label: 'Severe - Final Warning' },
    { value: 'critical', label: 'Critical - Possible Termination' },
  ];

  return (
    <div className="pip-form">
      <h3 className="pip-form-title">PIP Information</h3>

      <div className="pip-form-group">
        <label className="pip-form-label">Title *</label>
        <input
          type="text"
          className="pip-form-input"
          value={data.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Enter PIP title"
          required
        />
      </div>

      <div className="pip-form-group">
        <label className="pip-form-label">Description</label>
        <textarea
          className="pip-form-textarea"
          value={data.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Enter description"
          rows={3}
        />
      </div>

      <div className="pip-form-row">
        <div className="pip-form-group">
          <label className="pip-form-label">Employee *</label>
          <select
            className="pip-form-select"
            value={data.employee || ''}
            onChange={(e) => handleChange('employee', e.target.value)}
            required
          >
            <option value="">{isLeadOnly ? "Select team member (direct report)..." : "Select employee..."}</option>
            {displayEmployees?.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name} ({emp.email})
              </option>
            ))}
          </select>
        </div>
        <div className="pip-form-group">
          <label className="pip-form-label">Owner</label>
          <select
            className="pip-form-select"
            value={data.owner || user?.id || ''}
            onChange={(e) => handleChange('owner', e.target.value)}
          >
            <option value="">Select owner...</option>
            {allOwners.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name} ({emp.email})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="pip-form-group">
        <label className="pip-form-label">Review Cycle</label>
        <select
          className="pip-form-select"
          value={data.review_cycle || defaultActiveCycle?.id || ''}
          onChange={(e) => handleChange('review_cycle', e.target.value)}
        >
          <option value="">Select review cycle...</option>
          {sortedCycles?.map((cycle) => {
            const isCurrent = cycle.id === defaultActiveCycle?.id || cycle.status === 'active' || cycle.status === 'submitted';
            return (
              <option key={cycle.id} value={cycle.id}>
                {cycle.name} {isCurrent ? ' ★ (Active Cycle)' : ''}
              </option>
            );
          })}
        </select>
      </div>

      <div className="pip-form-group">
        <label className="pip-form-label">Severity</label>
        <select
          className="pip-form-select"
          value={data.severity || 'moderate'}
          onChange={(e) => handleChange('severity', e.target.value)}
        >
          {severityOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="pip-form-row">
        <div className="pip-form-group">
          <label className="pip-form-label">Start Date *</label>
          <input
            type="date"
            className="pip-form-input"
            value={data.start_date || ''}
            onChange={(e) => handleChange('start_date', e.target.value)}
            required
          />
        </div>
        <div className="pip-form-group">
          <label className="pip-form-label">End Date *</label>
          <input
            type="date"
            className="pip-form-input"
            value={data.end_date || ''}
            onChange={(e) => handleChange('end_date', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="pip-form-group">
        <label className="pip-form-label">Improvement Areas</label>
        <textarea
          className="pip-form-textarea"
          value={data.improvement_areas || ''}
          onChange={(e) => handleChange('improvement_areas', e.target.value)}
          placeholder="What areas need improvement?"
          rows={3}
        />
      </div>

      <div className="pip-form-group">
        <label className="pip-form-label">Success Criteria</label>
        <textarea
          className="pip-form-textarea"
          value={data.success_criteria || ''}
          onChange={(e) => handleChange('success_criteria', e.target.value)}
          placeholder="What defines success?"
          rows={3}
        />
      </div>

      <div className="pip-form-group">
        <label className="pip-form-label">Consequences if Failed</label>
        <textarea
          className="pip-form-textarea"
          value={data.consequences_if_failed || ''}
          onChange={(e) => handleChange('consequences_if_failed', e.target.value)}
          placeholder="What happens if the PIP fails?"
          rows={2}
        />
      </div>

      <div className="pip-form-group">
        <label className="pip-form-label">Consequences if Successful</label>
        <textarea
          className="pip-form-textarea"
          value={data.consequences_if_successful || ''}
          onChange={(e) => handleChange('consequences_if_successful', e.target.value)}
          placeholder="What happens if the PIP succeeds?"
          rows={2}
        />
      </div>
    </div>
  );
};

export default PIPForm;
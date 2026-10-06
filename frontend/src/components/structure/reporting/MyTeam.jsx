import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUsers,
  FiUser,
  FiMail,
  FiBriefcase,
  FiLayers,
  FiGitBranch,
  FiRefreshCw,
  FiSearch,
  FiGrid,
  FiList,
  FiCheckCircle,
  FiShield,
  FiAward,
} from 'react-icons/fi';
import { HiOutlineBuildingOffice } from 'react-icons/hi2';
import { reportingLineService } from '../../../services/structure/reportingLine.service';
import { useAuthContext } from '../../../contexts/accounts/AuthContext';
import {
  StructureLoading,
  StructureEmptyState,
  StructureStatusBadge,
} from '../common';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './reporting.css';

export const MyTeam = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuthContext();

  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  const fetchTeam = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await reportingLineService.getMyTeam();
      const rawData = response?.data || response?.results || response || [];
      const list = Array.isArray(rawData) ? rawData : [];
      setTeamMembers(list);
    } catch (err) {
      console.error('Failed to fetch team members:', err);
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        'Unable to load your team and peers.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  // Current user ID
  const currentUserId = String(authUser?.id || '');

  // Separate manager/supervisor from peers
  const { supervisor, directPeers, selfMember } = useMemo(() => {
    let sup = null;
    let self = null;
    const peers = [];

    teamMembers.forEach((member) => {
      const isSelf = String(member.user_id) === currentUserId;
      if (isSelf) {
        self = member;
      }

      // If the member is marked as manager and not self, or is executive
      if (member.is_manager && !isSelf && !sup) {
        sup = member;
      } else if (!isSelf) {
        peers.push(member);
      }
    });

    // Fallback if supervisor wasn't explicitly flagged is_manager but is first in chain
    if (!sup && teamMembers.length > 0 && teamMembers[0] !== self) {
      sup = teamMembers[0];
      const idx = peers.indexOf(sup);
      if (idx > -1) peers.splice(idx, 1);
    }

    return { supervisor: sup, directPeers: peers, selfMember: self };
  }, [teamMembers, currentUserId]);

  // Filtered members based on search
  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) return teamMembers;
    const term = searchTerm.toLowerCase();
    return teamMembers.filter((m) =>
      (m.user_name && m.user_name.toLowerCase().includes(term)) ||
      (m.user_email && m.user_email.toLowerCase().includes(term)) ||
      (m.position_title && m.position_title.toLowerCase().includes(term)) ||
      (m.department_name && m.department_name.toLowerCase().includes(term))
    );
  }, [teamMembers, searchTerm]);

  const departmentName =
    selfMember?.department_name ||
    supervisor?.department_name ||
    (teamMembers[0]?.department_name) ||
    'Department';

  const divisionName =
    selfMember?.division_name ||
    supervisor?.division_name ||
    (teamMembers[0]?.division_name) ||
    '';

  if (isLoading) {
    return (
      <div className="reporting-list-container">
        <StructureLoading text="Loading your team and direct peers..." />
      </div>
    );
  }

  return (
    <div className="reporting-list-container my-team-view">
      {/* Header */}
      <div className="reporting-list-header">
        <div className="header-left">
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiUsers className="text-primary" />
              My Team & Immediate Peers
            </h1>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary, #64748b)', fontSize: '14px' }}>
              Direct supervisor and colleagues reporting directly within <strong>{departmentName}</strong>
            </p>
          </div>
        </div>
        <div className="header-right">
          <div className="view-mode-toggle" style={{ display: 'flex', background: 'var(--bg-gray-100, #f1f5f9)', padding: '3px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <button
              onClick={() => setViewMode('grid')}
              className={`btn-icon ${viewMode === 'grid' ? 'active' : ''}`}
              style={{
                border: 'none',
                background: viewMode === 'grid' ? '#fff' : 'transparent',
                boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                borderRadius: '6px',
                padding: '6px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '13px',
                fontWeight: viewMode === 'grid' ? 600 : 400,
                color: viewMode === 'grid' ? '#2563eb' : '#64748b'
              }}
              title="Card Grid View"
            >
              <FiGrid size={15} /> Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`btn-icon ${viewMode === 'table' ? 'active' : ''}`}
              style={{
                border: 'none',
                background: viewMode === 'table' ? '#fff' : 'transparent',
                boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                borderRadius: '6px',
                padding: '6px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '13px',
                fontWeight: viewMode === 'table' ? 600 : 400,
                color: viewMode === 'table' ? '#2563eb' : '#64748b'
              }}
              title="Table View"
            >
              <FiList size={15} /> List
            </button>
          </div>

          <button onClick={fetchTeam} className="btn btn-secondary" title="Refresh">
            <FiRefreshCw size={15} />
            Refresh
          </button>
          <button
            onClick={() => navigate(STRUCTURE_ROUTES.MY_CHAIN)}
            className="btn btn-primary"
          >
            <FiGitBranch size={15} />
            View Reporting Chain
          </button>
        </div>
      </div>

      {error && (
        <div className="reporting-list-error" style={{ marginBottom: '20px', padding: '16px 20px', textAlign: 'left', alignItems: 'flex-start' }}>
          <p style={{ margin: 0 }}>{error}</p>
          <button onClick={fetchTeam} className="btn btn-primary" style={{ marginTop: '10px' }}>
            Try Again
          </button>
        </div>
      )}

      {/* Stats / Department Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--bg-surface, #fff)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiUsers size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 600 }}>Total Direct Team</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
              {teamMembers.length} Members
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface, #fff)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiShield size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 600 }}>Direct Supervisor</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
              {supervisor ? supervisor.user_name : 'Top Level / Board'}
            </div>
            {supervisor?.position_title && (
              <div style={{ fontSize: '12px', color: '#64748b' }}>{supervisor.position_title}</div>
            )}
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface, #fff)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.1)', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HiOutlineBuildingOffice size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 600 }}>Department</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
              {departmentName}
            </div>
            {divisionName && (
              <div style={{ fontSize: '12px', color: '#64748b' }}>{divisionName}</div>
            )}
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <FiSearch size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by name, position, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '14px',
              outline: 'none',
              background: '#fff'
            }}
          />
        </div>
      </div>

      {/* Content: Grid or Table */}
      {filteredMembers.length === 0 ? (
        <StructureEmptyState
          title="No Team Members Found"
          description={searchTerm ? 'No team members matched your search.' : 'You currently do not have assigned team peers.'}
        />
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredMembers.map((member) => {
            const isSelf = String(member.user_id) === currentUserId;
            const isSup = supervisor && String(member.user_id) === String(supervisor.user_id);

            return (
              <div
                key={member.id || member.user_id}
                style={{
                  background: 'var(--bg-surface, #fff)',
                  border: isSelf
                    ? '2px solid #3b82f6'
                    : isSup
                    ? '2px solid #10b981'
                    : '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '20px',
                  boxShadow: isSelf
                    ? '0 4px 12px rgba(59, 130, 246, 0.08)'
                    : isSup
                    ? '0 4px 12px rgba(16, 185, 129, 0.08)'
                    : '0 2px 6px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  position: 'relative',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                {/* Header Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        background: isSup
                          ? 'linear-gradient(135deg, #10b981, #059669)'
                          : isSelf
                          ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                          : '#e2e8f0',
                        color: isSup || isSelf ? '#fff' : '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '18px'
                      }}
                    >
                      {member.user_name ? member.user_name.charAt(0).toUpperCase() : <FiUser />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a' }}>
                        {member.user_name}
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiMail size={13} />
                        {member.user_email || 'No email'}
                      </div>
                    </div>
                  </div>

                  {/* Role Tag */}
                  {isSup ? (
                    <span style={{ fontSize: '11px', fontWeight: 700, background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Supervisor
                    </span>
                  ) : isSelf ? (
                    <span style={{ fontSize: '11px', fontWeight: 700, background: '#dbeafe', color: '#1e40af', padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      You (Self)
                    </span>
                  ) : (
                    <span style={{ fontSize: '11px', fontWeight: 600, background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '6px' }}>
                      Peer
                    </span>
                  )}
                </div>

                {/* Details */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155' }}>
                    <FiBriefcase size={14} style={{ color: '#64748b', flexShrink: 0 }} />
                    <span style={{ fontWeight: 600 }}>{member.position_title || 'Unassigned Position'}</span>
                  </div>
                  {member.department_name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
                      <HiOutlineBuildingOffice size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
                      <span>{member.department_name}</span>
                    </div>
                  )}
                </div>

                {/* Status footer */}
                <div style={{ marginTop: 'auto', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10b981' }}>
                    <FiCheckCircle size={14} /> Active Employee
                  </div>
                  {member.is_manager && !isSup && (
                    <span style={{ fontSize: '11px', color: '#64748b', background: '#f8fafc', padding: '2px 6px', borderRadius: '4px' }}>
                      Lead
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div style={{ background: 'var(--bg-surface, #fff)', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '12px 16px' }}>Member</th>
                <th style={{ padding: '12px 16px' }}>Position</th>
                <th style={{ padding: '12px 16px' }}>Department</th>
                <th style={{ padding: '12px 16px' }}>Relationship</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => {
                const isSelf = String(member.user_id) === currentUserId;
                const isSup = supervisor && String(member.user_id) === String(supervisor.user_id);

                return (
                  <tr
                    key={member.id || member.user_id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: isSelf ? '#f0fdf4' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            background: isSup ? '#10b981' : isSelf ? '#3b82f6' : '#e2e8f0',
                            color: isSup || isSelf ? '#fff' : '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '14px'
                          }}
                        >
                          {member.user_name ? member.user_name.charAt(0).toUpperCase() : <FiUser />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{member.user_name}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{member.user_email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 500, color: '#334155' }}>
                      {member.position_title || '-'}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>
                      {member.department_name || '-'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {isSup ? (
                        <span style={{ fontSize: '12px', fontWeight: 700, background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '6px' }}>
                          Supervisor
                        </span>
                      ) : isSelf ? (
                        <span style={{ fontSize: '12px', fontWeight: 700, background: '#dbeafe', color: '#1e40af', padding: '3px 8px', borderRadius: '6px' }}>
                          You (Self)
                        </span>
                      ) : (
                        <span style={{ fontSize: '12px', fontWeight: 500, background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '6px' }}>
                          Direct Peer
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <StructureStatusBadge status="active" customLabel="Active" size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyTeam;

/**
 * Organisation Audit Page
 * View audit logs and activity history
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAuditLogs, fetchAuditStats } from '../../store/organisations/slice/auditSlice';
import { AuditLogs } from '../../components/organisations/audit';

const OrganisationAuditPage = () => {
  const dispatch = useDispatch();
  const { logs, stats, loading, total } = useSelector((state) => state.audit);

  useEffect(() => {
    dispatch(fetchAuditLogs({ limit: 50 }));
    dispatch(fetchAuditStats());
  }, [dispatch]);

  if (loading && !logs.length) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return <AuditLogs logs={logs} stats={stats} total={total} loading={loading} />;
};

export default OrganisationAuditPage;
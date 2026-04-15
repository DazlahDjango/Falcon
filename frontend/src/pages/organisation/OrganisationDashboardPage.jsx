/**
 * Organisation Dashboard Page
 * Main landing page for organisation users
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentOrganisation } from '../../store/organisation/slice/organisationSlice';
import { fetchKpiOverview } from '../../store/organisation/slice/kpiSlice';
import { fetchAuditStats } from '../../store/organisation/slice/auditSlice';
import OrganisationDashboard from '../../components/Organisation/OrganisationDashboard';

const OrganisationDashboardPage = () => {
  const dispatch = useDispatch();
  const { organisation, loading: orgLoading } = useSelector((state) => state.organisation);
  const { overview, loading: kpiLoading } = useSelector((state) => state.kpis);
  const { stats, loading: auditLoading } = useSelector((state) => state.audit);

  useEffect(() => {
    // Fetch all dashboard data
    dispatch(fetchCurrentOrganisation());
    dispatch(fetchKpiOverview());
    dispatch(fetchAuditStats());
  }, [dispatch]);

  const isLoading = orgLoading || kpiLoading || auditLoading;

  if (isLoading && !organisation) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return <OrganisationDashboard organisation={organisation} kpiOverview={overview} auditStats={stats} />;
};

export default OrganisationDashboardPage;
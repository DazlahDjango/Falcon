import React, { useEffect } from 'react';
import { DashboardPageShell } from '../../../components/dashboard/Layout/DashboardPageShell';
import { OrgTreeVisualization } from '../../../components/dashboard/integrations';
import { useHierarchy } from '../../../hooks/dashboard/useHierarchy';

const ExecutiveTeam = () => {
  const { orgTree, loading, fetchOrgTree } = useHierarchy();

  useEffect(() => {
    fetchOrgTree();
  }, [fetchOrgTree]);

  return (
    <DashboardPageShell
      title="Organization"
      subtitle="Executive view"
      description="Live org structure from Structure app. Drill-down is RBAC-checked and audited."
      dashboardType="executive"
      onRefresh={fetchOrgTree}
      loading={loading}
    >
      <div className="dashboard-page__panel">
        <OrgTreeVisualization data={orgTree} loading={loading} />
      </div>
    </DashboardPageShell>
  );
};

export default ExecutiveTeam;

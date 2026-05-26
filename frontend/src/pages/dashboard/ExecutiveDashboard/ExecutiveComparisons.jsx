import React from 'react';
import { DashboardPageShell } from '../../../components/dashboard/Layout/DashboardPageShell';
import { ComparisonSelector, PeriodComparisonChart } from '../../../components/dashboard/comparisons';
import { useDashboardComparisons } from '../../../hooks/dashboard/useDashboardComparisons';

const ExecutiveComparisons = () => {
  const {
    comparisons,
    selectedComparison,
    comparisonResults,
    loading,
    selectComparison,
    fetchComparisons,
    calculateComparison,
  } = useDashboardComparisons({ autoFetch: true });

  return (
    <DashboardPageShell
      title="Period Comparisons"
      subtitle="Executive analytics"
      description="Compare departments and periods. Data reflects supervisor-validated KPIs only."
      dashboardType="executive"
      loading={loading}
      onRefresh={fetchComparisons}
    >
      <div className="dashboard-page__panel">
        <ComparisonSelector
          comparisons={comparisons}
          selectedComparisonId={selectedComparison?.id}
          onSelect={selectComparison}
          onRefresh={fetchComparisons}
          loading={loading}
        />
      </div>
      <div className="dashboard-page__panel">
        <PeriodComparisonChart
          data={comparisonResults}
          loading={loading}
          onRefresh={() => selectedComparison && calculateComparison(selectedComparison.id)}
        />
      </div>
    </DashboardPageShell>
  );
};

export default ExecutiveComparisons;

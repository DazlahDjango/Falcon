import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { TrendChartWidget, KPITableWidget } from '../../../components/dashboard/widgets';
import { DateRangePicker, FilterBar } from '../../../components/dashboard/common';
import { selectExecutiveTrends, selectExecutiveLoading } from '../../../store/dashboard/selectors/dashboardSelectors';

export const ExecutiveTrends = () => {
  const trends = useSelector(selectExecutiveTrends);
  const loading = useSelector(selectExecutiveLoading);
  const [period, setPeriod] = useState('monthly');
  const [selectedKpi, setSelectedKpi] = useState(null);

  const handleFilterChange = (filters) => {
    setPeriod(filters.period || 'monthly');
  };

  return (
    <div className="executive-trends-page">
      <div className="page-header">
        <h1>KPIs & Trends</h1>
        <p>Track key performance indicators over time</p>
      </div>
      
      <FilterBar 
        filters={{ period }}
        onFilterChange={handleFilterChange}
        showSearch={false}
      />
      
      <div className="trends-grid">
        <TrendChartWidget
          data={trends}
          loading={loading}
          title="Performance Trends"
          height={400}
          onRefresh={() => {}}
          onExport={() => {}}
        />
        
        <KPITableWidget
          data={trends?.flatMap(t => t.kpis) || []}
          loading={loading}
          title="KPI Details"
          onKpiClick={setSelectedKpi}
        />
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { DepartmentHeatmapWidget } from '../../../components/dashboard/widgets';
import { selectExecutiveDepartments, selectExecutiveLoading } from '../../../store/dashboard/selectors/dashboardSelectors';

export const ExecutiveDepartments = () => {
  const navigate = useNavigate();
  const departments = useSelector(selectExecutiveDepartments);
  const loading = useSelector(selectExecutiveLoading);

  const handleDepartmentClick = (departmentId) => {
    navigate(`/dashboard/executive/departments/${departmentId}`);
  };

  return (
    <div className="executive-departments-page">
      <div className="page-header">
        <h1>Department Performance</h1>
        <p>View and compare performance across all departments</p>
      </div>

      <DepartmentHeatmapWidget
        data={departments}
        loading={loading}
        title="Department Performance Heatmap"
        onDepartmentClick={handleDepartmentClick}
        onRefresh={() => { }}
        onExport={() => { }}
      />
    </div>
  );
};
export default ExecutiveDepartments;
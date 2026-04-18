/**
 * Organisation Positions Page
 * Manage job positions and reporting hierarchy
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPositions, fetchPositionHierarchy } from '../../store/organisation/slice/positionSlice';
import { fetchDepartments } from '../../store/organisation/slice/departmentSlice';
import { PositionManager } from '../../components/Organisation/positions';

const OrganisationPositionsPage = () => {
  const dispatch = useDispatch();
  const { positions, positionHierarchy, loading } = useSelector((state) => state.positions);
  const { departments } = useSelector((state) => state.departments);

  useEffect(() => {
    dispatch(fetchPositions());
    dispatch(fetchPositionHierarchy());
    dispatch(fetchDepartments());
  }, [dispatch]);

  if (loading && !positions.length) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return <PositionManager positions={positions} positionHierarchy={positionHierarchy} departments={departments} loading={loading} />;
};

export default OrganisationPositionsPage;
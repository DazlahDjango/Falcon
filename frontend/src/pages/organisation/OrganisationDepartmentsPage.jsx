/**
 * Organisation Departments Page
 * Manage department structure and hierarchy
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDepartments, fetchDepartmentTree } from '../../store/organisation/slice/departmentSlice';
import { DepartmentManager } from '../../components/Organisation/departments';

const OrganisationDepartmentsPage = () => {
  const dispatch = useDispatch();
  const { departments, departmentTree, loading } = useSelector((state) => state.departments);

  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchDepartmentTree());
  }, [dispatch]);

  if (loading && !departments.length) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return <DepartmentManager departments={departments} departmentTree={departmentTree} loading={loading} />;
};

export default OrganisationDepartmentsPage;
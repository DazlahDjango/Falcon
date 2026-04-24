/**
 * Organisation Teams Page
 * Manage teams within departments
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTeams } from '../../store/organisations/slice/teamSlice';
import { fetchDepartments } from '../../store/organisations/slice/departmentSlice';
import { TeamManager } from '../../components/organisations/teams';

const OrganisationTeamsPage = () => {
  const dispatch = useDispatch();
  const { teams, loading } = useSelector((state) => state.teams);
  const { departments } = useSelector((state) => state.departments);

  useEffect(() => {
    dispatch(fetchTeams());
    dispatch(fetchDepartments());
  }, [dispatch]);

  if (loading && !teams.length) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return <TeamManager teams={teams} departments={departments} loading={loading} />;
};

export default OrganisationTeamsPage;
import React from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardProviders } from '../../../providers/DashboardProviders';
import MainLayout from '../Layout/MainLayout';
import '../../../styles/dashboard/dashboard.css';

/**
 * Entry shell for all PMS dashboards. Keeps providers off the app root until you opt in.
 */
export const DashboardShell = () => (
  <DashboardProviders>
    <MainLayout />
  </DashboardProviders>
);

export const DashboardShellOutlet = () => (
  <DashboardProviders>
    <Outlet />
  </DashboardProviders>
);

export default DashboardShell;

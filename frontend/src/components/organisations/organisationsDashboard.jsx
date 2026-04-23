import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import { useOrganisation, useKpiData, useDepartments } from '@/hooks/organisations';
import {
  KPIOverviewWidget,
  RecentActivityWidget,
  SubscriptionStatusWidget,
  QuickActionsWidget,
  PerformanceChartWidget,
  AlertsWidget,
} from './dashboard/widgets';

const OrganisationDashboard = () => {
  const navigate = useNavigate();
  const { organisation, loading: orgLoading } = useOrganisation();
  const { overview: kpiOverview } = useKpiData();
  const { total: totalDepartments, getDepartments } = useDepartments();
  
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    // Fetch departments for overview stats
    getDepartments({ limit: 0 });

    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, [getDepartments]);

  if (orgLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting}, {organisation?.name || 'Organisation'}! 👋
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {currentTime.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here's what's happening with your organisation.
        </p>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-100 rounded-lg p-3">
              <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Employees</p>
              <p className="text-2xl font-semibold text-gray-900">{organisation?.employee_count || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Departments</p>
              <p className="text-2xl font-semibold text-gray-900">{totalDepartments || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
              <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active KPIs</p>
              <p className="text-2xl font-semibold text-gray-900">{kpiOverview?.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completion Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{kpiOverview?.average_progress || 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid with Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          <KPIOverviewWidget />
          <PerformanceChartWidget />
          <RecentActivityWidget />
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          <SubscriptionStatusWidget />
          <QuickActionsWidget />
          <AlertsWidget />
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">Quick Links</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/organisation/departments" className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
              <span className="text-2xl block">🏢</span>
              <span className="text-sm text-gray-600">Departments</span>
            </Link>
            <Link to="/organisation/teams" className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
              <span className="text-2xl block">👥</span>
              <span className="text-sm text-gray-600">Teams</span>
            </Link>
            <Link to="/organisation/positions" className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
              <span className="text-2xl block">💺</span>
              <span className="text-sm text-gray-600">Positions</span>
            </Link>
            <Link to="/organisation/contacts" className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
              <span className="text-2xl block">📧</span>
              <span className="text-sm text-gray-600">Contacts</span>
            </Link>
            <Link to="/organisation/domains" className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
              <span className="text-2xl block">🌐</span>
              <span className="text-sm text-gray-600">Domains</span>
            </Link>
            <Link to="/organisation/branding" className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
              <span className="text-2xl block">🎨</span>
              <span className="text-sm text-gray-600">Branding</span>
            </Link>
            <Link to="/organisation/subscription" className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
              <span className="text-2xl block">💰</span>
              <span className="text-sm text-gray-600">Subscription</span>
            </Link>
            <Link to="/organisation/settings" className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
              <span className="text-2xl block">⚙️</span>
              <span className="text-sm text-gray-600">Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganisationDashboard;
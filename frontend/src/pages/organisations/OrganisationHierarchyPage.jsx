import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/UI/Card';
import { HierarchyChart } from '../../components/organisations/hierarchy';

const OrganisationHierarchyPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Organisation Hierarchy</h1>
        <p className="text-gray-600 mt-2">
          View and manage your organisation's reporting structure
        </p>
      </div>

      <HierarchyChart />
    </div>
  );
};

export default OrganisationHierarchyPage;
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/UI/Card';
import { PlanManager } from '../../components/organisations/plans';

const OrganisationPlansPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
        <p className="text-gray-600 mt-2">
          Choose the perfect plan for your organisation's needs
        </p>
      </div>

      <PlanManager />
    </div>
  );
};

export default OrganisationPlansPage;
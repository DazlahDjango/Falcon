import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/UI/Card';
import { FeatureFlagManager } from '../../components/organisations/feature-flags';

const OrganisationFeatureFlagsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Feature Flags</h1>
        <p className="text-gray-600 mt-2">
          Control and manage organisation-specific features
        </p>
      </div>

      <FeatureFlagManager />
    </div>
  );
};

export default OrganisationFeatureFlagsPage;
/**
 * Organisation Two-Factor Authentication Page
 * Manage MFA settings
 */

import React from 'react';
import { TwoFactorAuth } from '../../components/Organisation/settings';

const OrganisationTwoFactorPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add an extra layer of security to your account
        </p>
      </div>
      <TwoFactorAuth />
    </div>
  );
};

export default OrganisationTwoFactorPage;
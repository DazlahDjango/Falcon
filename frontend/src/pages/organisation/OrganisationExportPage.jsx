/**
 * Organisation Export Page
 * Export organisation data
 */

import React from 'react';
import { DataExport } from '../../components/Organisation/importexport';

const OrganisationExportPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Export Data</h1>
        <p className="mt-1 text-sm text-gray-500">
          Export your organisation's data for analysis or backup
        </p>
      </div>
      <DataExport />
    </div>
  );
};

export default OrganisationExportPage;
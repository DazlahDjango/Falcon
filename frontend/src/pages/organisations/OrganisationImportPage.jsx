/**
 * Organisation Import Page
 * Import data from CSV/Excel files
 */

import React from 'react';
import { DataImport } from '../../components/organisations/importexport';

const OrganisationImportPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Import Data</h1>
        <p className="mt-1 text-sm text-gray-500">
          Import data from CSV or Excel files into your organisation
        </p>
      </div>
      <DataImport />
    </div>
  );
};

export default OrganisationImportPage;
import React, { useState } from 'react';
import FileUploader from './components/FileUploader';
import ImportPreview from './components/ImportPreview';
import { importApi } from '../../../services/organisations';
import toast from 'react-hot-toast';

const DataImport = () => {
  const [step, setStep] = useState('upload'); // upload, preview, complete
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [importType, setImportType] = useState('kpis');
  const [previewData, setPreviewData] = useState(null);
  const [columns, setColumns] = useState([]);
  const [importResult, setImportResult] = useState(null);

  const importTypes = [
    { value: 'kpis', label: 'KPIs', description: 'Import Key Performance Indicators', template: 'kpi_template.csv' },
    { value: 'users', label: 'Users', description: 'Import team members', template: 'user_template.csv' },
    { value: 'departments', label: 'Departments', description: 'Import department structure', template: 'department_template.csv' },
    { value: 'teams', label: 'Teams', description: 'Import team assignments', template: 'team_template.csv' },
    { value: 'positions', label: 'Positions', description: 'Import job positions', template: 'position_template.csv' },
  ];

  const getAcceptFormats = () => {
    return ['.csv', '.xlsx', '.xls'];
  };

  const handleFileAccepted = async (acceptedFile) => {
    setFile(acceptedFile);
    await previewImport(acceptedFile);
  };

  const previewImport = async (fileToPreview) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', fileToPreview);
      formData.append('type', importType);
      
      const response = await importApi.preview(formData);
      const data = response.data;
      
      setPreviewData(data.rows || []);
      setColumns(data.columns || [
        { key: 'name', label: 'Name' },
        { key: 'description', label: 'Description' },
        { key: 'target', label: 'Target' },
        { key: 'department', label: 'Department' },
      ]);
      setStep('preview');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to preview import');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', importType);
      formData.append('data', JSON.stringify(data));
      
      const response = await importApi.confirm(formData);
      setImportResult(response.data);
      setStep('complete');
      toast.success('Import completed successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setStep('upload');
    setFile(null);
    setPreviewData(null);
    setImportResult(null);
  };

  const downloadTemplate = () => {
    const template = importTypes.find(t => t.value === importType);
    if (template) {
      // Trigger template download
      window.location.href = `/api/templates/${template.template}`;
    }
  };

  if (step === 'complete' && importResult) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow text-center p-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Complete!</h2>
          
          <div className="grid grid-cols-3 gap-4 my-6">
            <div className="bg-green-50 p-3 rounded">
              <p className="text-2xl font-bold text-green-600">{importResult.created || 0}</p>
              <p className="text-xs text-green-600">Created</p>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-2xl font-bold text-blue-600">{importResult.updated || 0}</p>
              <p className="text-xs text-blue-600">Updated</p>
            </div>
            <div className="bg-red-50 p-3 rounded">
              <p className="text-2xl font-bold text-red-600">{importResult.errors || 0}</p>
              <p className="text-xs text-red-600">Errors</p>
            </div>
          </div>

          {importResult.error_details && importResult.error_details.length > 0 && (
            <div className="bg-red-50 p-4 rounded-lg text-left mb-6">
              <p className="text-sm font-medium text-red-800 mb-2">Error Details:</p>
              <div className="space-y-1">
                {importResult.error_details.slice(0, 5).map((err, idx) => (
                  <p key={idx} className="text-xs text-red-700">• {err}</p>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Import Another File
            </button>
            <a
              href={`/${importType}s`}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              View {importType.toUpperCase()}s
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Data Import</h1>
        <p className="mt-1 text-sm text-gray-500">
          Import data from CSV or Excel files into your organisation
        </p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">Import Settings</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Import Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What would you like to import?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {importTypes.map((type) => (
                <label
                  key={type.value}
                  className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                    importType === type.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="importType"
                    value={type.value}
                    checked={importType === type.value}
                    onChange={(e) => setImportType(e.target.value)}
                    className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{type.label}</p>
                    <p className="text-xs text-gray-500">{type.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Template Download */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-blue-800">Need a template?</p>
                <p className="text-xs text-blue-600 mt-1">
                  Download a sample template to see the required format
                </p>
              </div>
              <button
                onClick={downloadTemplate}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Download Template →
              </button>
            </div>
          </div>

          {/* File Upload */}
          {step === 'upload' && (
            <FileUploader
              onFileAccepted={handleFileAccepted}
              accept={getAcceptFormats()}
              maxSize={10 * 1024 * 1024} // 10MB
              label="Upload CSV or Excel file"
              loading={loading}
            />
          )}

          {/* Import Preview */}
          {step === 'preview' && previewData && (
            <ImportPreview
              data={previewData}
              columns={columns}
              onConfirm={handleConfirmImport}
              onCancel={handleCancel}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DataImport;
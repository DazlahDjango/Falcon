// src/components/reviews/reports/exports/ReportExport.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText, FileSpreadsheet, File, X } from 'lucide-react';
import { useReviewsReports } from '../../../../hooks/reviews';
import ExportOptions from './ExportOptions';
import ExportProgress from './ExportProgress';

const ReportExport = () => {
  const navigate = useNavigate();
  const { exportReport, loading, canExport } = useReviewsReports();
  const [selectedReport, setSelectedReport] = useState('cycle');
  const [selectedCycle, setSelectedCycle] = useState('');
  const [format, setFormat] = useState('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExport = async () => {
    if (!selectedCycle) {
      alert('Please select a cycle');
      return;
    }
    setIsExporting(true);
    setProgress(0);

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      await exportReport(selectedReport, selectedCycle, format);
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        setIsExporting(false);
        setProgress(0);
        navigate('/reviews/reports');
      }, 1000);
    } catch (error) {
      setIsExporting(false);
      setProgress(0);
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="report-export">
      <div className="report-export-header">
        <button className="report-export-back" onClick={() => navigate('/reviews/reports')}>
          <ArrowLeft size={20} />
          Back to Reports
        </button>
        <h1 className="report-export-title">Export Reports</h1>
      </div>

      <div className="report-export-content">
        <ExportOptions
          selectedReport={selectedReport}
          selectedCycle={selectedCycle}
          format={format}
          onReportChange={setSelectedReport}
          onCycleChange={setSelectedCycle}
          onFormatChange={setFormat}
        />

        {isExporting && <ExportProgress progress={progress} />}

        <div className="report-export-actions">
          <button
            className="btn btn-outline"
            onClick={() => navigate('/reviews/reports')}
            disabled={isExporting}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleExport}
            disabled={isExporting || !selectedCycle}
          >
            <Download size={18} />
            {isExporting ? 'Exporting...' : 'Export Report'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportExport;
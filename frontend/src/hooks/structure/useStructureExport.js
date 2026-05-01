import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { showToast } from '../../store/ui/slices/uiSlice';

export const useStructureExport = ({ onSuccess, onError } = {}) => {
  const dispatch = useDispatch();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [error, setError] = useState(null);

  const downloadFile = useCallback((blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, []);

  const convertToCSV = useCallback((data, columns) => {
    if (!data || data.length === 0) return '';
    
    const headers = columns.map(col => col.header).join(',');
    const rows = data.map(item => 
      columns.map(col => {
        let value = item[col.key];
        if (typeof value === 'object') value = JSON.stringify(value);
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    );
    
    return [headers, ...rows].join('\n');
  }, []);
  
  const convertToJSON = useCallback((data) => {
    return JSON.stringify(data, null, 2);
  }, []);

  const exportDepartmentsToCSV = useCallback((departments, filename = `departments_${Date.now()}.csv`) => {
    const columns = [
      { key: 'code', header: 'Code' },
      { key: 'name', header: 'Name' },
      { key: 'description', header: 'Description' },
      { key: 'parent_name', header: 'Parent Department' },
      { key: 'depth', header: 'Depth' },
      { key: 'headcount_limit', header: 'Headcount Limit' },
      { key: 'employee_count', header: 'Employees' },
      { key: 'sensitivity_level', header: 'Sensitivity' },
      { key: 'is_active', header: 'Status' },
      { key: 'created_at', header: 'Created At' },
    ];
    
    const csvData = convertToCSV(departments, columns);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, filename);
  }, [convertToCSV, downloadFile]);

  const exportTeamsToCSV = useCallback((teams, filename = `teams_${Date.now()}.csv`) => {
    const columns = [
      { key: 'code', header: 'Code' },
      { key: 'name', header: 'Name' },
      { key: 'description', header: 'Description' },
      { key: 'department_name', header: 'Department' },
      { key: 'parent_team_name', header: 'Parent Team' },
      { key: 'team_lead', header: 'Team Lead' },
      { key: 'member_count', header: 'Members' },
      { key: 'max_members', header: 'Max Members' },
      { key: 'is_active', header: 'Status' },
      { key: 'created_at', header: 'Created At' },
    ];
    
    const csvData = convertToCSV(teams, columns);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, filename);
  }, [convertToCSV, downloadFile]);

  const exportPositionsToCSV = useCallback((positions, filename = `positions_${Date.now()}.csv`) => {
    const columns = [
      { key: 'job_code', header: 'Job Code' },
      { key: 'title', header: 'Title' },
      { key: 'grade', header: 'Grade' },
      { key: 'level', header: 'Level' },
      { key: 'reports_to_title', header: 'Reports To' },
      { key: 'current_incumbents_count', header: 'Incumbents' },
      { key: 'max_incumbents', header: 'Max Incumbents' },
      { key: 'is_single_incumbent', header: 'Single Incumbent' },
      { key: 'created_at', header: 'Created At' },
    ];
    
    const csvData = convertToCSV(positions, columns);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, filename);
  }, [convertToCSV, downloadFile]);

  const exportEmploymentsToCSV = useCallback((employments, filename = `employments_${Date.now()}.csv`) => {
    const columns = [
      { key: 'user_id', header: 'User ID' },
      { key: 'position_title', header: 'Position' },
      { key: 'department_name', header: 'Department' },
      { key: 'team_name', header: 'Team' },
      { key: 'employment_type', header: 'Type' },
      { key: 'effective_from', header: 'Effective From' },
      { key: 'effective_to', header: 'Effective To' },
      { key: 'is_manager', header: 'Is Manager' },
      { key: 'is_executive', header: 'Is Executive' },
      { key: 'is_active', header: 'Status' },
    ];
    
    const csvData = convertToCSV(employments, columns);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, filename);
  }, [convertToCSV, downloadFile]);
  
  const exportToJSON = useCallback((data, filename = `export_${Date.now()}.json`) => {
    const jsonData = convertToJSON(data);
    const blob = new Blob([jsonData], { type: 'application/json' });
    downloadFile(blob, filename);
  }, [convertToJSON, downloadFile]);

  const exportData = useCallback(async ({ url, format = 'csv', params = {}, filename, onProgress: progressCallback }) => {
    setIsExporting(true);
    setExportProgress(0);
    setError(null);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('falcon_access_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const finalFilename = filename || `export_${Date.now()}.${format}`;
      downloadFile(blob, finalFilename);
      
      dispatch(showToast({ message: 'Export completed successfully', type: 'success' }));
      onSuccess?.();
    } catch (err) {
      const errorMessage = err.message || 'Export failed. Please try again.';
      setError(errorMessage);
      dispatch(showToast({ message: errorMessage, type: 'error' }));
      onError?.(err);
    } finally {
      setIsExporting(false);
      setExportProgress(100);
      setTimeout(() => setExportProgress(0), 1000);
    }
  }, [dispatch, downloadFile, onSuccess, onError]);
  
  return {
    // State
    isExporting,
    exportProgress,
    error,
    exportData,
    exportDepartmentsToCSV,
    exportTeamsToCSV,
    exportPositionsToCSV,
    exportEmploymentsToCSV,
    exportToJSON,
    downloadFile,
    convertToCSV,
    convertToJSON,
  };
};

export default useStructureExport;
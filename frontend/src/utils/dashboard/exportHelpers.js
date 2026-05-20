// frontend/src/utils/dashboard/exportHelpers.js
/**
 * Export utility functions for dashboard reports
 */

/**
 * Download blob as file
 * @param {Blob} blob - File blob
 * @param {string} filename - File name
 */
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Convert data to CSV
 * @param {Array} data - Array of objects
 * @returns {string} CSV string
 */
export const convertToCSV = (data) => {
  if (!data || !data.length) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  csvRows.push(headers.join(','));
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
};

/**
 * Export data as CSV file
 * @param {Array} data - Data to export
 * @param {string} filename - File name
 */
export const exportToCSV = (data, filename) => {
  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
};

/**
 * Export data as JSON file
 * @param {Object} data - Data to export
 * @param {string} filename - File name
 */
export const exportToJSON = (data, filename) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, `${filename}.json`);
};

/**
 * Print dashboard
 * @param {HTMLElement} element - Element to print
 */
export const printDashboard = (element) => {
  const printWindow = window.open('', '_blank');
  const content = element.cloneNode(true);
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Dashboard Export</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          @media print {
            .no-print { display: none; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        ${content.outerHTML}
      </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.print();
};

/**
 * Generate filename with timestamp
 * @param {string} prefix - File prefix
 * @param {string} extension - File extension
 * @returns {string} Generated filename
 */
export const generateExportFilename = (prefix, extension) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${prefix}_${timestamp}.${extension}`;
};

/**
 * Prepare dashboard data for export
 * @param {Object} dashboardData - Dashboard data
 * @param {string} format - Export format
 * @returns {Object} Prepared data
 */
export const prepareExportData = (dashboardData, format = 'csv') => {
  if (!dashboardData) return null;
  
  if (format === 'csv') {
    if (dashboardData.department_performance) {
      return dashboardData.department_performance;
    }
    if (dashboardData.tenants) {
      return dashboardData.tenants;
    }
    if (dashboardData.kpi_performance?.by_department) {
      return dashboardData.kpi_performance.by_department;
    }
  }
  
  return dashboardData;
};

/**
 * Get MIME type for export format
 * @param {string} format - Export format
 * @returns {string} MIME type
 */
export const getExportMimeType = (format) => {
  const mimeTypes = {
    pdf: 'application/pdf',
    excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
    json: 'application/json',
    png: 'image/png'
  };
  return mimeTypes[format] || 'application/octet-stream';
};

/**
 * Get file extension for export format
 * @param {string} format - Export format
 * @returns {string} File extension
 */
export const getExportExtension = (format) => {
  const extensions = {
    pdf: 'pdf',
    excel: 'xlsx',
    csv: 'csv',
    json: 'json',
    png: 'png'
  };
  return extensions[format] || 'bin';
};

/**
 * Create and trigger download of HTML content as PDF (using browser print)
 * @param {HTMLElement} element - Element to print as PDF
 * @param {string} filename - File name
 */
export const exportToPDF = (element, filename) => {
  const printWindow = window.open('', '_blank');
  const content = element.cloneNode(true);
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${filename}</title>
        <style>
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            margin: 20px;
            padding: 20px;
          }
          .no-print, button, .widget-edit-btn, .dashboard-edit-btn {
            display: none !important;
          }
          .dashboard-widget {
            break-inside: avoid;
            page-break-inside: avoid;
            margin-bottom: 20px;
          }
          @media print {
            body { margin: 0; padding: 0; }
            .dashboard-grid {
              display: block !important;
            }
          }
        </style>
      </head>
      <body>
        <h1>${filename}</h1>
        <div class="export-content">
          ${content.outerHTML}
        </div>
        <p style="margin-top: 30px; font-size: 12px; color: #666;">
          Generated on ${new Date().toLocaleString()}
        </p>
      </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.print();
  printWindow.close();
};
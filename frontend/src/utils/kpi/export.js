/**
 * Export Utilities
 * Functions for exporting data to various formats
 */

/**
 * Export data as CSV
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Column definitions { key, header, formatter }
 * @param {string} filename - Output filename
 */
export const exportToCSV = (data, columns, filename = 'export.csv') => {
    if (!data || !data.length) {
        console.warn('No data to export');
        return;
    }

    // Build headers
    const headers = columns.map(col => col.header).join(',');
    
    // Build rows
    const rows = data.map(item => {
        return columns.map(col => {
            let value = item[col.key];
            if (col.formatter) {
                value = col.formatter(value);
            }
            // Handle commas in values
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                value = `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        }).join(',');
    });
    
    const csvContent = [headers, ...rows].join('\n');
    downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
};

/**
 * Export data as JSON
 * @param {Object|Array} data - Data to export
 * @param {string} filename - Output filename
 */
export const exportToJSON = (data, filename = 'export.json') => {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, filename, 'application/json');
};

/**
 * Export data as Excel (XLSX)
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Column definitions
 * @param {string} filename - Output filename
 */
export const exportToExcel = async (data, columns, filename = 'export.xlsx') => {
    // This would require a library like xlsx
    // For now, fallback to CSV
    console.warn('Excel export requires xlsx library. Using CSV instead.');
    exportToCSV(data, columns, filename.replace('.xlsx', '.csv'));
};

/**
 * Download file from blob or string
 * @param {string|Blob} content - File content
 * @param {string} filename - Output filename
 * @param {string} mimeType - MIME type
 */
export const downloadFile = (content, filename, mimeType = 'text/plain') => {
    const blob = content instanceof Blob 
        ? content 
        : new Blob([content], { type: mimeType });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Read file content as text
 * @param {File} file - File to read
 * @returns {Promise<string>} File content
 */
export const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
};

/**
 * Read file content as JSON
 * @param {File} file - File to read
 * @returns {Promise<Object>} Parsed JSON
 */
export const readFileAsJSON = async (file) => {
    const text = await readFileAsText(file);
    return JSON.parse(text);
};
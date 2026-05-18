// frontend/src/utils/config/sizeFormatter.js
export const formatBytes = (bytes, decimals = 1) => {
  if (bytes === null || bytes === undefined) return 'N/A';
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const formatBytesToGB = (bytes, decimals = 2) => {
  if (!bytes) return 0;
  return parseFloat((bytes / (1024 ** 3)).toFixed(decimals));
};

export const formatGBToBytes = (gb) => {
  return gb * (1024 ** 3);
};

export const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return 'N/A';
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return 'N/A';
  return `${value.toFixed(decimals)}%`;
};
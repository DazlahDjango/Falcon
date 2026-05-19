// frontend/src/utils/config/dateFormatter.js
import { format, formatDistanceToNow, parseISO, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';

export const formatDateTime = (dateString, formatStr = 'MMM dd, yyyy HH:mm:ss') => {
  if (!dateString) return 'N/A';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, formatStr);
  } catch {
    return 'Invalid date';
  }
};

export const formatDate = (dateString, formatStr = 'MMM dd, yyyy') => {
  if (!dateString) return 'N/A';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, formatStr);
  } catch {
    return 'Invalid date';
  }
};

export const formatTime = (dateString, formatStr = 'HH:mm:ss') => {
  if (!dateString) return 'N/A';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, formatStr);
  } catch {
    return 'Invalid time';
  }
};

export const timeAgo = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'Invalid date';
  }
};

export const getDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return null;
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  
  const minutes = differenceInMinutes(end, start);
  const hours = differenceInHours(end, start);
  const days = differenceInDays(end, start);
  
  if (days > 0) return { days, hours: hours % 24, minutes: minutes % 60, totalMinutes: minutes };
  if (hours > 0) return { hours, minutes: minutes % 60, totalMinutes: minutes };
  return { minutes, totalMinutes: minutes };
};

export const formatDurationFromDates = (startDate, endDate) => {
  const duration = getDuration(startDate, endDate);
  if (!duration) return 'N/A';
  if (duration.days) return `${duration.days}d ${duration.hours}h`;
  if (duration.hours) return `${duration.hours}h ${duration.minutes}m`;
  return `${duration.minutes}m`;
};

export const isExpired = (dateString) => {
  if (!dateString) return false;
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return new Date() > date;
};

export const isUpcoming = (dateString, minutesThreshold = 60) => {
  if (!dateString) return false;
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  const diffMinutes = differenceInMinutes(date, new Date());
  return diffMinutes > 0 && diffMinutes <= minutesThreshold;
};